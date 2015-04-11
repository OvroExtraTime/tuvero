/**
 * No Description
 *
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */

define(['./vector', './matrix', './halfmatrix', './result', './correction',
    './rleblobber', 'options'], function(Vector, Matrix, HalfMatrix, Result,
    Correction, RLEBlobber, Options) {
  /**
   * FinebuchholzRanking: A ranking variant which sorts players by wins,
   * buchholz points, finebuchholz points and netto points, in this order.
   */
  var Finebuchholz = function(size) {
    this.wins = [];
    this.netto = [];
    this.byes = [];
    this.corrections = [];
    this.games = new HalfMatrix(HalfMatrix.mirrored, size);

    this.length = 0;
    while (this.length < size) {
      this.netto.push(0);
      this.wins.push(0);
      this.byes.push(0);
      this.length += 1;
    }
  };

  /**
   * simply return the stored size
   *
   * @return the number of players in the ranking instance
   */
  Finebuchholz.prototype.size = function() {
    return this.length;
  };

  /**
   * resize the internal structures
   *
   * @param size
   *          new size
   * @return {Finebuchholz} this
   */
  Finebuchholz.prototype.resize = function(size) {
    var length = this.size();

    // FIXME test the length of every array on its own!
    if (size < length) {
      this.netto.splice(size);
      this.wins.splice(size);
      this.byes.splice(size);
      while (this.games.size > size) {
        this.games.erase(size);
      }
    } else {
      this.games.extend(size - length);

      for (; length < size; length += 1) {
        this.netto.push(0);
        this.wins.push(0);
        this.byes.push(0);
      }
    }

    this.length = size;

    return this;
  };

  /**
   * return an object containing all points data and a sorted array of pids
   * representing the ranking
   *
   * @return a data object containing the ranking information
   */
  Finebuchholz.prototype.get = function() {
    var rank, n, w, bh, fbh, games;

    n = this.netto;
    w = this.wins;
    games = Matrix.rowSums(this.games);
    // add byes to the number of games
    this.byes.map(function(bye, i) {
      if (bye) {
        games[i] += bye;
      }
    });
    bh = Matrix.multVec(this.games, w); // calculate the buchholz points
    fbh = Matrix.multVec(this.games, bh); // calculate the finebuchholz
    // points

    rank = n.map(function(undefined, index) {
      return index;
    });

    rank.sort(function(a, b) {
      return /* (games[b] - games[a]) || */(w[b] - w[a]) || (bh[b] - bh[a])
          || (fbh[b] - fbh[a]) || (n[b] - n[a]) || (a - b);
    });

    return {
      buchholz: bh,
      byes: this.byes,
      finebuchholz: fbh,
      games: games,
      netto: n,
      ranking: rank,
      size: n.length,
      wins: w
    };
  };

  /**
   * Add the result of a game to the ranking table.
   *
   * @param result
   *          the result
   * @return {Finebuchholz} this
   */
  Finebuchholz.prototype.add = function(result) {
    var netto, n, w, g, t1, t2;

    n = this.netto;
    w = this.wins;
    g = this.games;

    netto = result.getNetto();
    t1 = result.getTeam(1);
    t2 = result.getTeam(2);

    t1.map(function(v) {
      n[v] += netto;
      if (netto > 0) {
        w[v] += 1;
      }

      t2.map(function(v2) {
        g.set(v, v2, g.get(v, v2) + 1);
      });
    });

    t2.map(function(v) {
      n[v] -= netto;
      if (netto < 0) {
        w[v] += 1;
      }
    });

    return this;
  };

  /**
   * remove the result of a game from the ranking table
   *
   * @param result
   *          the result
   * @return {Finebuchholz} this
   */
  Finebuchholz.prototype.remove = function(result) {
    var netto, n, w, g, t1, t2;

    n = this.netto;
    w = this.wins;
    g = this.games;

    netto = result.getNetto();
    t1 = result.getTeam(1);
    t2 = result.getTeam(2);

    t1.forEach(function(v) {
      n[v] -= netto;
      if (netto > 0) {
        w[v] -= 1;
      }

      t2.map(function(v2) {
        g.set(v, v2, g.get(v, v2) - 1);
      });
    }, this);

    t2.forEach(function(v) {
      n[v] += netto;
      if (netto < 0) {
        w[v] -= 1;
      }
    }, this);

    return this;
  };

  /**
   * Correct the result of a game.
   *
   * @param correction
   *          the correction
   * @return {Finebuchholz} undefined on failure, this otherwise
   */
  Finebuchholz.prototype.correct = function(correction) {
    if (this.added(correction.pre.getGame())) {
      this.remove(correction.pre);
      this.add(correction.post);

      this.corrections.push(correction.copy());

      return this;
    }

    console.error('correction not applicable!');
    return undefined;
  };

  Finebuchholz.prototype.grantBye = function(team) {
    var n, w, b, size;

    if (typeof team === 'number') {
      team = [team];
    }

    n = this.netto;
    w = this.wins;
    b = this.byes;

    size = this.size();

    team.forEach(function(pid) {
      if (pid < size) {
        n[pid] += Options.byepointswon - Options.byepointslost;
        w[pid] += 1; // win against nobody
        b[pid] += 1; // keep track of the byes
      }
    }, this);
  };

  Finebuchholz.prototype.revokeBye = function(team) {
    var b, n, w, size;

    if (typeof team === 'number') {
      team = [team];
    }

    n = this.netto;
    w = this.wins;
    b = this.byes;

    size = this.size();

    team.forEach(function(pid) {
      if (pid < size && b[pid] > 0) {
        n[pid] -= Options.byepointswon - Options.byepointslost;
        w[pid] -= 1; // revoke a win against nobody
        b[pid] -= 1; // keep track of byes
      }
    }, this);
  };

  /**
   * whether a game was played
   *
   * @param game
   *          an instance of the game that could have taken place
   * @return true if all data indicates that this game took place, false
   *         otherwise.
   */
  Finebuchholz.prototype.added = function(game) {
    // if a game has taken place, all players of one team have played
    // against
    // all players of another team.
    var len, i, j, t1, t2, t1func, invalid;

    invalid = false;

    // avoid jslint false positive. shouldn't impact performance too much
    t2 = undefined;

    t1func = function(p1) {
      t2.forEach(function(p2) {
        if (this.games.get(p1, p2) <= 0) {
          invalid = true;
        }
      }, this);
    };

    len = game.teams.length;

    for (i = 0; i < len; i += 1) {
      t1 = game.teams[i];
      for (j = i + 1; j < len; j += 1) {
        t2 = game.teams[j];

        t1.forEach(t1func, this);
        if (invalid) {
          break;
        }
      }
      if (invalid) {
        break;
      }
    }

    return !invalid;
  };

  /**
   * get a copy of the applied corrections
   *
   * @return copy of the array of corrections
   */
  Finebuchholz.prototype.getCorrections = function() {
    return this.corrections.map(function(corr) {
      return corr.copy();
    }, this);
  };

  /**
   * stores the current state in a blob
   *
   * @return a serialization of the ranking state
   */
  Finebuchholz.prototype.toBlob = function() {
    var ob;

    ob = {
      byes: RLEBlobber.toBlob(this.byes),
      corrections: this.corrections,
      games: this.games.toBlob(),
      netto: RLEBlobber.toBlob(this.netto),
      wins: RLEBlobber.toBlob(this.wins),
      length: this.length
    };

    return JSON.stringify(ob);
  };

  Finebuchholz.prototype.fromBlob = function(blob) {
    var ob, i;

    function copyCorrection(corr) {
      return Correction.copy(corr);
    }

    ob = JSON.parse(blob);

    this.length = ob.length;
    this.byes = RLEBlobber.fromBlob(ob.byes);
    this.netto = RLEBlobber.fromBlob(ob.netto);
    this.wins = RLEBlobber.fromBlob(ob.wins);

    this.games.fromBlob(ob.games);

    for (i = 0; i < this.length; i += 1) {
      this.byes[i] = this.byes[i] || 0;
      this.netto[i] = this.netto[i] || 0;
      this.wins[i] = this.wins[i] || 0;
    }

    this.corrections = ob.corrections.map(copyCorrection);
  };

  return Finebuchholz;
});
