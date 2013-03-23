/**
 * Implementation of the swiss tournament system
 */
define(
    [ 'map', 'finebuchholzranking', 'game', 'result', 'random', 'halfmatrix' ],
    function (Map, Finebuchholzranking, Game, Result, Random, Halfmatrix) {
      var Swisstournament;

      /**
       * constructor
       * 
       * @returns {Swisstournament}
       */
      Swisstournament = function () {
        this.players = new Map();
        this.ranking = new Finebuchholzranking();
        this.state = 0; // 0 always is the first state, regardless of its name
        this.games = [];
        this.upvote = []; // true, wenn jemand hochgelost wurde
        this.downvote = []; // true, wenn jemand runtergelost wurde
        this.byevote = []; // true, wenn jemand ein Freilos bekommen hat
        this.rng = new Random();
        this.round = 0; // 0 if not started yet, 1 is first valid round, ...
      };

      /**
       * the three possible states
       */
      Swisstournament.state = {
        PREPARING : 0,
        RUNNING : 1,
        FINISHED : 2
      };

      /**
       * (implemented tournament function)
       * 
       * @param id
       * @returns
       */
      Swisstournament.prototype.addPlayer = function (id) {
        if (this.state !== Swisstournament.state.PREPARING) {
          return undefined;
        }

        this.players.insert(id);
        this.ranking.resize(this.players.size());
        return this;
      };

      /**
       * (implemented tournament function)
       * 
       * @returns
       */
      Swisstournament.prototype.start = function () {
        if (this.state !== Swisstournament.state.PREPARING) {
          return undefined;
        }

        if (this.players.size() < 2) {
          return undefined;
        }

        this.state = Swisstournament.state.RUNNING;
        this.newRound();

        return this;
      };

      /**
       * (implemented tournament function)
       * 
       * @returns
       */
      Swisstournament.prototype.end = function () {
        if (this.state !== Swisstournament.state.RUNNING) {
          return undefined;
        }

        // check for running games
        if (this.games.length !== 0) {
          return undefined;
        }

        this.state = Swisstournament.state.FINISHED;
        return this.getRanking();
      };

      /**
       * (implemented tournament function)
       * 
       * @param game
       * @param points
       * @returns
       */
      Swisstournament.prototype.finishGame = function (game, points) {
        var i, invalid;
        if (this.state !== Swisstournament.state.RUNNING) {
          return undefined;
        }

        // abort if game has too many players
        if (game.teams[0].length !== 1 || game.teams[1].length !== 1) {
          return undefined;
        }

        // convert to internal pid
        game = new Game(this.players.find(game.teams[0][0]), this.players
            .find(game.teams[1][0]));

        // verify that the game is in the games list
        invalid = true;
        for (i = 0; i < this.games.length; i += 1) {
          if (game.equals(this.games[i])) {
            invalid = false;
            break;
          }
        }

        if (invalid === true) {
          return undefined;
        }

        // remove the game from the list
        this.games.splice(i, 1);

        // apply ranking
        this.ranking.add(new Result(game.teams[0], game.teams[1], points[0],
            points[1]));

        return this;
      };

      /**
       * (implemented tournament function)
       * 
       * @returns {Array}
       */
      Swisstournament.prototype.openGames = function () {
        // convert internal to external ids
        var games = [];
        this.games.forEach(function (game, i) {
          games[i] = new Game(this.players.at(game.teams[0][0]), this.players
              .at(game.teams[1][0]));
        }, this);

        return games;
      };

      /**
       * (implemented tournament function)
       * 
       * @returns
       */
      Swisstournament.prototype.getRanking = function () {
        var res, wins, netto, bh, fbh, ids;

        bh = [];
        fbh = [];
        ids = [];
        netto = [];
        wins = [];

        res = this.ranking.get();

        // rearrange the arrays from internal id indexing to ranked indexing
        res.ranking.forEach(function (i, rank) {
          bh[rank] = res.buchholz[i];
          fbh[rank] = res.finebuchholz[i];
          netto[rank] = res.netto[i];
          wins[rank] = res.wins[i];
          ids[rank] = this.players.at(i);
        }, this);

        return {
          bh : bh,
          fbh : fbh,
          ids : ids,
          netto : netto,
          wins : wins
        };
      };

      /**
       * @returns current round or 0 if tournament hasn't been proberly started
       *          yet
       */
      Swisstournament.prototype.getRound = function () {
        return this.round;
      };

      /**
       * Start a new round. This function creates a randomized set of new games,
       * maintaining up/down/byevotes.
       * 
       * @returns this on success, undefined otherwise
       */
      Swisstournament.prototype.newRound = function () {
        var wingroups, votes, games, timeout;

        // abort if the tournament isn't running
        if (this.state !== Swisstournament.state.RUNNING) {
          return undefined;
        }
        // abort if there are unfinished games from a previous round
        if (this.games.length !== 0) {
          return undefined;
        }

        timeout = this.players.size() * 10;
        wingroups = this.winGroups();
        votes = this.preliminaryDownVotes(wingroups);

        // Algorithm (copy of the comments below)
        // for each wingroup:
        // / exclude the downvote from this group, if any
        // / if player has been downvoted into this group:
        // / / create game with a random upvote candidate
        // / while there are players in this group:
        // / / pick any two random players
        // / / if they haven't already played against another
        // / / / create game

        games = [];

        // for each wingroup:
        wingroups.forEach(function (wingroup, wins) {
          var candidates, p1, p2;
          // exclude the downvote or byevote from this group, if any

          if (timeout <= 0) {
            return;
          }

          p1 = votes.downvotes[wins];
          if (wins === 0) {
            p1 = votes.byevote;
          }
          if (p1 !== undefined) {
            wingroup.splice(wingroup.indexOf(p1), 1);
          }

          // if player has been downvoted into this group:
          p1 = votes.downvotes[wins + 1];
          if (p1 !== undefined) {
            candidates = [];

            // create game with a random upvote candidate
            wingroup.forEach(function (pid2) {
              // TODO use canPlay: performance vs security?
              if (this.canUpVote(pid2) && this.canPlay(p1, pid2)) {
                candidates.push(pid2);
              }
            }, this);

            p2 = this.rng.pick(candidates);

            games.push(new Game(p1, p2));
            wingroup.splice(wingroup.indexOf(p2), 1);
            votes.upvotes[wins] = p2;
          }

          // while there are players in this group:
          while (wingroup.length > 0) {
            // pick any two random players
            p1 = this.rng.pick(wingroup);
            p2 = this.rng.pick(wingroup);
            if (p1 !== p2) {

              // if they haven't already played against another
              if (this.canPlay(p1, p2)) {
                // create game
                games.push(new Game(p1, p2));
                wingroup.splice(wingroup.indexOf(p1), 1);
                wingroup.splice(wingroup.indexOf(p2), 1);
              }

              timeout -= 1;
              if (timeout <= 0) {
                return;
              }
            }
          }
        }, this);

        if (timeout <= 0) {
          return undefined;
        }

        // apply the votes
        if (this.applyVotes(votes) === undefined) {
          // abort if something's wrong with the votes
          this.games = [];
          return undefined;
        }
        // apply the games
        this.games = games;

        // round increment
        this.round += 1;

        return this;
      };

      /**
       * @param votes
       *          processed votes structure as returned by
       *          preliminaryDownVotes() and processed by newRound()
       * @returns {Swisstournament} this
       */
      Swisstournament.prototype.applyVotes = function (votes) {
        var downcount, upcount, downvalid, upvalid;

        downcount = 0;
        downvalid = true;
        votes.downvotes.forEach(function (down) {
          if (down !== undefined) {
            downcount += 1;
          }
          if (!this.canDownVote(down)) {
            downvalid = false;
          }
        }, this);

        upcount = 0;
        upvalid = true;
        votes.upvotes.forEach(function (up) {
          if (up !== undefined) {
            upcount += 1;
          }
          if (!this.canUpVote(up)) {
            upvalid = false;
          }
        }, this);

        // abort if upvotes and downvotes differ or some vote was invalid
        if (downcount !== upcount || !downvalid || !upvalid) {
          return undefined;
        }

        if (votes.byevote !== undefined && !this.canByeVote(votes.byevote)) {
          return undefined;
        }

        // apply byevote
        this.byeVote(votes.byevote);

        // apply downvotes
        votes.downvotes.forEach(function (down) {
          this.downVote(down);
        }, this);

        votes.upvotes.forEach(function (up) {
          this.upVote(up);
        }, this);

        return this;
      };

      /**
       * Build a 2d array of wingroups. Outer key is the number of wins (0+),
       * values in inner array are internal player ids
       * 
       * @returns 2d array of wingroups
       */
      Swisstournament.prototype.winGroups = function () {
        var wingroups, res, pid, numplayers, wins;

        wingroups = [];

        res = this.ranking.get();

        numplayers = this.players.size();

        for (pid = 0; pid < numplayers; pid += 1) {
          wins = res.wins[pid] || 0;

          if (wingroups[wins] === undefined) {
            wingroups[wins] = [];
          }
          wingroups[wins].push(pid);
        }

        return wingroups;
      };

      /**
       * create a list of players to downvote/byevote using the given wingroups
       * 
       * @param wingroups
       *          wingroups as returned by winGroups()
       * @returns An object containing byevote, downvotes and an empty array of
       *          upvotes. The key of the downvote array is the number of wins
       *          this player has been voted from.
       */
      Swisstournament.prototype.preliminaryDownVotes = function (wingroups) {
        // Due to the symmetric properties of a swiss tournament, we don't
        // verify possible upvotes. If the tournament has too many rounds, this
        // may fail someday.
        var byevote, downvotes, w, candidates, downvoted, fillCandidates;

        byevote = undefined;
        downvoted = false; // whether a player has been downvoted into the
        // current wingroup
        downvotes = [];
        candidates = [];

        // forEach-function to fill the candidates array. DownVote version.
        fillCandidates = function (pid) {
          if (this.canDownVote(pid)) {
            candidates.push(pid);
          }
        };

        // iterate over all wingroups, starting with the highest one, thereby
        // ensuring that all groups except the lowest one are even in player
        // count.
        for (w = wingroups.length - 1; w > 0; w -= 1) {
          // only downvote a player if the current group has an odd number of
          // players
          if ((wingroups[w].length + (downvoted ? 1 : 0)) & 0x1) {
            // create a dense list of candidates
            candidates = [];
            wingroups[w].forEach(fillCandidates, this);

            // abort if no player can be downvoted
            if (candidates.length === 0) {
              return undefined;
            }

            // select a random player from the candidates array
            downvotes[w] = this.rng.pick(candidates);
            downvoted = true;
          } else {
            downvoted = false;
          }
        }

        // byevote from the lowest group, if necessary. Same procedure as with
        // the downvotes
        if ((wingroups[0].length + (downvoted ? 1 : 0)) & 0x1) {
          candidates = [];
          // forEach-function to fill the candidates array. ByeVote version.
          fillCandidates = function (pid) {
            if (this.canByeVote(pid)) {
              candidates.push(pid);
            }
          };

          wingroups[0].forEach(fillCandidates, this);

          if (candidates.length === 0) {
            return undefined;
          }

          byevote = this.rng.pick(candidates);
        }

        // finally, return
        return {
          byevote : byevote,
          downvotes : downvotes,
          upvotes : []
        };
      };

      /**
       * @param id
       *          internal player id
       * @returns {Boolean} whether the player can be downvoted
       */
      Swisstournament.prototype.canDownVote = function (id) {
        return id < this.players.size() && !this.byevote[id]
            && !this.upvote[id] && !this.downvote[id];
      };

      /**
       * @param id
       *          internal player id to downvote
       * @returns {Swisstournament} this
       */
      Swisstournament.prototype.downVote = function (id) {
        if (this.canDownVote(id)) {
          this.downvote[id] = true;
        }

        return this;
      };

      /**
       * @param id
       *          internal player id
       * @returns {Boolean} whether the player can be upvoted
       */
      Swisstournament.prototype.canUpVote = function (id) {
        return id < this.players.size() && !this.byevote[id]
            && !this.upvote[id] && !this.downvote[id];
      };

      /**
       * @param id
       *          internal player id to be upvoted
       * @returns {Swisstournament} this
       */
      Swisstournament.prototype.upVote = function (id) {
        if (this.canUpVote(id)) {
          this.upvote[id] = true;
        }

        return this;
      };

      /**
       * @param id
       *          internal player id
       * @returns {Boolean} whether the player can be byevoted
       */
      Swisstournament.prototype.canByeVote = function (id) {
        return id < this.players.size() && !this.byevote[id]
            && !this.upvote[id] && !this.downvote[id];
      };

      /**
       * @param id
       *          internal player id to be byevoted
       * @returns {Swisstournament} this
       */
      Swisstournament.prototype.byeVote = function (id) {
        if (this.canByeVote(id)) {
          this.byevote[id] = true;
          this.ranking.grantBye(id);
        }

        return this;
      };

      /**
       * Verify whether two players can play against another
       * 
       * @param pid1
       *          internal id of first player
       * @param pid2
       *          iternal id of second player
       * @returns {Boolean} true if they would form a valid game, false
       *          otherwise
       */
      Swisstournament.prototype.canPlay = function (pid1, pid2) {
        // FIXME write wrapping function for the matrix call
        return pid1 < this.players.size() && pid2 < this.players.size()
            && pid1 !== pid2 && this.ranking.games.get(pid1, pid2) === 0;
      };

      return Swisstournament;
    });

// TODO hide internal functions
// TODO teams contain one player only (manage team vs. player externally)
