define([ './team', './toast', './strings', './tab_teams', './tab_ranking',
    './history', './tab_history', './storage', './options', './opts',
    './tabshandle', './tournaments' ], function (Team, Toast, Strings, Tab_Teams, Tab_Ranking, History, Tab_History, Storage, Options, Opts, Tabshandle, Tournaments) {
  var Tab_Games, $tab, template, games, $games, $tournaments, options, updatependng;

  updatepending = false;

  // references to html elements of the games and tournaments
  $games = [];
  $tournaments = [];
  // local copy of the running games
  games = [];

  Tab_Games = {};
  options = {};

  function isInt (n) {
    return n % 1 === 0;
  }

  function initGameTemplate () {
    var $form, $names, $teamnos, i, tmp;

    if (template.game) {
      console.error('tab_games: template.game is already defined:');
      console.error(template.game);
      return;
    }

    $form = template.$box.find('.game');
    $form.detach();

    $names = [];
    tmp = $form.find('.names');
    $names[0] = tmp.eq(0);
    $names[1] = tmp.eq(1);

    tmp = $form.find('.teamno');
    $teamnos = [ tmp.eq(0), tmp.eq(1) ];

    $anchor = $tab.find('.votes').eq(0);

    /**
     * disable/enable the submit button if input is valid
     */
    $tab.on('change', '.game input', function () {
      var $button = $(this).parent().find('button');

      if (readResults($(this).parents('.game')) === undefined) {
        $button.attr('disabled', 'disabled');
        $button.attr('tabindex', '-1');
      } else {
        $button.removeAttr('disabled');
        $button.removeAttr('tabindex');
      }

    });

    $tab.on('submit', '.game', function (event) {
      finishGame.call(this);
      event.preventDefault();
      return false;
    });
    // TODO Enter key -> press submit button (as a failsafe)
    // TODO Escape key -> reset form

    template.game = {
      $form : $form,
      $names : $names,
      $teamnos : $teamnos,
    };
  }

  function initVoteTemplate () {
    var $vote, $container, $names, $teamno, i, tmp;

    if (template.vote) {
      console.error('tab_games: template.vote is already defined:');
      console.error(template.vote);
      return;
    }

    $container = template.$box.find('.votes');
    $container.detach();

    $vote = $container.find('.vote');
    $vote.detach();

    $names = $vote.find('.names');
    $teamno = $vote.find('.teamno');

    template.vote = {
      $container : $container,
      $vote : $vote,
      $names : $names,
      $teamno : $teamno
    };
  }

  function initTemplates () {
    if (template) {
      console.error('tab_games: template is already defined:');
      console.error(template);
      return;
    }

    template = {};

    template.$box = $tab.find('.box.tpl');
    template.$box.detach();
    template.$box.removeClass('tpl');
    template.$boxname = template.$box.find('>h3');

    initGameTemplate();
    initVoteTemplate();
  }

  /**
   * create and show a box displaying a certain game
   */
  function appendGame (game, tournamentid, $box) {
    var t1, t2, $game, i;

    t1 = Team.get(game.teams[0][0]);
    t2 = Team.get(game.teams[1][0]);

    template.game.$names[0].html(t1.names.join('<br>'));
    template.game.$names[1].html(t2.names.join('<br>'));

    template.game.$teamnos[0].text(t1.id + 1);
    template.game.$teamnos[1].text(t2.id + 1);

    $game = template.game.$form.clone();
    $box.append($game);

    // insert data and representation into the reference containers
    if (!$games[tournamentid]) {
      $games[tournamentid] = [];
    }
    $games[tournamentid].push($game);

    if (!games[tournamentid]) {
      games[tournamentid] = [];
    }
    games[tournamentid].push(game);
  }

  /**
   * removes all games from the overview
   */
  function clearBoxes () {
    $tab.find('.box').remove();
    $games = [];
    $tournaments = [];
    games = [];
  }

  /**
   * clears the overview and appends all open games of the tournament
   */
  function showRunning () {
    var tournamentid, tournament, $box, notempty, hidden, round;
    clearBoxes();

    hidden = true; // the tab is hidden

    for (tournamentid = 0; tournamentid < Tournaments.numTournaments(); tournamentid += 1) {

      if (!Tournaments.isRunning(tournamentid)) {
        continue;
      }

      tournament = Tournaments.getTournament(tournamentid);
      round = Tournaments.getRanking(tournamentid).round;

      template.$boxname.text(Tournaments.getName(tournamentid) + ' - Runde ' + round);
      $box = template.$box.clone();

      notempty = false;

      tournament.getGames().forEach(function (game) {
        appendGame(game, tournamentid, $box);
        hidden = false;
        notempty = true;
      });

      if (showVotes(tournament, $box)) {
        // nothing, because the information is in the history tab, too
      }

      if (notempty) {
        $box.data('tournamentid', tournamentid);
        $tab.append($box);
        $tournaments[tournamentid] = $box;
      }
    }

    return !hidden;
  }

  function showTab () {
    var tournamentid, empty;

    empty = true;
    for (tournamentid = 0; tournamentid < games.length; tournamentid += 1) {
      if (games[tournamentid] && games[tournamentid].length > 0) {
        empty = false;
        break;
      }
    }

    if (empty) {
      Tabshandle.hide('games');
    } else {
      Tabshandle.show('games');
    }
  }

  function getTournamentID ($game) {
    var $box, i, boxdata;

    if (!$game) {
      return undefined;
    }

    $box = $game.parents('.box');

    if ($box.length !== 1) {
      console.error('cannot find $box of $game');
      return undefined;
    }

    return $box.data('tournamentid');
  }

  /**
   * this function removes the game from the local reference arrays
   * 
   * @param game
   *          the game in question
   * @returns true on success, undefined otherwise
   */
  function removeGame (tournamentid, index) {
    var index;

    games[tournamentid].splice(index, 1);
    $games[tournamentid][index].remove();
    $games[tournamentid].splice(index, 1);

    return true;
  }

  function readResults ($container) {
    var $input, i, ret, round, tournamentid;

    ret = {
      index : -1,
      points : []
    };

    tournamentid = getTournamentID($container);
    if (tournamentid === undefined) {
      return undefined;
    }

    for (i = 0; i < $games[tournamentid].length; i += 1) {
      // find the container in the array of containers
      // Compare TWO empty objects?
      // This works because they're an EXACT match, i.e. the same object.
      // They're still just empty objects without identifiers!
      if ($games[tournamentid][i].data() === $container.data()) {
        ret.index = i;
        break;
      }
    }

    $input = $container.find('.points');

    // game is invalid. Someone tampered with the system.
    if (ret.index === -1) {
      // redraw all games
      showRunning();
      Tab_Ranking.update();
      return undefined;
    }

    // read and validate
    for (i = 0; i < 2; i += 1) {
      // read and convert to number
      ret.points[i] = Number($($input[i]).val());

      // validate whether number and >= 0
      // TODO Options.maxpoints
      if (isNaN(ret.points[i]) || !isInt(ret.points[i]) || ret.points[i] < 0 || ret.points[i] > Options.maxpoints) {
        // FIXME find a better solution
        // flash?
        // $input.eq(i).focus();

        return undefined;
      }
    }

    // there has to be a winner
    if (ret.points[0] === ret.points[1]) {
      return undefined;
    }

    return ret;
  }

  /**
   * jQuery callback function. works with "this"
   */
  function finishGame () {
    var result, $input, i, res, index, points, tournamentid, tournament, gameid;

    // if someone wants to finish a game, do the following:
    // * verify that the game was running
    // * get and verify the points
    // * submit the result
    // * remove the game
    // * drink a toast to the game

    tournamentid = getTournamentID($(this));

    if (tournamentid === undefined) {
      return false;
    }

    if (!Tournaments.isRunning(tournamentid)) {
      console.error("tournament isn't running anymore, but player wants to finish a game");
      return false;
    }

    tournament = Tournaments.getTournament(tournamentid);

    result = readResults($(this));

    if (result === undefined) {
      new Toast(Strings.invalidresult, Toast.LONG);
      return false;
    }

    // TODO extract everything to a new function!

    index = result.index;
    points = result.points;
    gameid = games[tournamentid][index].id;

    if (tournament.finishGame(games[tournamentid][index], points) === undefined) {
      // game was somehow invalid. Someone tampered with the system.

      // redraw all games
      showRunning();

      // TODO event handler
      Tab_Ranking.update();

      // notify the user of this failure
      new Toast(Strings.invalidresult, Toast.LONG);

      return false;
    }

    // the game was accepted, store it in history
    round = Tournaments.getRanking(tournamentid).round;
    res = History.addResult(tournamentid, games[tournamentid][index].teams[0][0], games[tournamentid][index].teams[1][0], points[0], points[1], round - 1, gameid);
    Tab_History.update();

    if (points[0] > points[1]) {
      new Toast(Strings.gamefinished);
    }

    // verify for safety. Doesn't cost much
    if (games.length !== $games.length) {
      // game was somehow invalid. Someone tempered with the system.

      console.error('games != $games');

      // redraw all games
      showRunning();

      Tab_Ranking.update();

      // notify the user of this failure
      new Toast(Strings.invalidresult, Toast.LONG);

      return false;
    }

    // no games left? clean up and go to stage 2.
    if (games[tournamentid].length === 0) {
      clearBoxes();

      // hide this tab
      showTab();
      // open tab_new

      new Toast(Strings.roundfinished.replace('%s', Tournaments.getRanking(tournamentid).round));
    }

    // save changes
    Storage.changed();

    Tab_Ranking.update();
    // due to circular dependency, we must load Tab_New separately
    require('./tab_new').update();
    if (games.length === 0) {
      Tabshandle.focus('new');
    }
    Tab_Games.update();

    return false;
  }

  function createVoteBox (tid) {
    var team, i;
    team = Team.get(tid);

    template.vote.$teamno.text(team.id + 1);
    template.vote.$names.html(team.names.join('<br>'));

    return template.vote.$vote.clone();
  }

  /**
   * translates the Swiss ranking into a traditional votes object
   * 
   * TODO rewrite this file to replace this function
   * 
   * @returns {Object} a votes object of the current round
   */
  function getRoundVotes (Tournament) {
    // FIXME duplicate within tab_new.js
    var votes, ranking, i;

    ranking = Tournaments.getRanking(Tournaments.getTournamentID(Tournament));

    votes = {
      up : [],
      down : [],
      bye : [],
    };

    for (i = 0; i < ranking.ids.length; i += 1) {
      if (ranking.roundupvote && ranking.roundupvote[i]) {
        votes.up.push(ranking.ids[i]);
      }
      if (ranking.rounddownvote && ranking.rounddownvote[i]) {
        votes.down.push(ranking.ids[i]);
      }
      if (ranking.roundbyevote && ranking.roundbyevote[i]) {
        votes.bye.push(ranking.ids[i]);
      }
    }

    return votes;
  }

  /**
   * display the votes for the current round
   */
  function showVotes (Tournament, $box) {
    var votes, i, $containers, $container, notempty;

    notempty = false;

    // get votes
    votes = getRoundVotes(Tournament);

    $container = template.vote.$container.clone();

    $containers = {
      up : $container.find('.up'),
      down : $container.find('.down'),
      bye : $container.find('.bye'),
    };

    // apply upvotes
    if (votes.up && votes.up.length !== 0) {
      $containers.up.show();
      votes.up.forEach(function (tid) {
        if (tid !== undefined) {
          $containers.up.append(createVoteBox(tid));
          notempty = true;
        }
      });
    } else {
      $containers.up.hide();
    }

    // apply down
    if (votes.down && votes.down.length !== 0) {
      $containers.down.show();
      votes.down.forEach(function (tid) {
        if (tid !== undefined) {
          $containers.down.append(createVoteBox(tid));
          notempty = true;
        }
      });
    } else {
      $containers.down.hide();
    }

    // apply bye
    if (votes.bye && votes.bye.length !== 0) {
      $containers.bye.show();
      votes.bye.forEach(function (tid) {
        if (tid !== undefined) {
          $containers.bye.append(createVoteBox(tid));
          notempty = true;
        }
      });
    } else {
      $containers.bye.hide();
    }

    if (notempty) {
      $box.append($container);
    }

    return notempty;
  }

  function initOptions () {
    var $maxwidthbox, $shownamesbox;

    // show or hide playernames
    $maxwidthbox = $tab.find('.options .maxwidth');
    function maxwidthtest () {
      if ($maxwidthbox.prop('checked')) {
        $tab.addClass('maxwidth');
      } else {
        $tab.removeClass('maxwidth');
      }
    }

    $maxwidthbox.click(maxwidthtest);
    maxwidthtest();

    // show or hide playernames
    $shownamesbox = $tab.find('.options .shownames');
    function shownamestest () {
      if ($shownamesbox.prop('checked')) {
        $tab.removeClass('hidenames');
        $maxwidthbox.removeAttr("disabled");
      } else {
        $tab.addClass('hidenames');
        $maxwidthbox.attr("disabled", "disabled");
      }
    }

    $shownamesbox.click(shownamestest);
    shownamestest();
  }

  function init () {
    if ($tab) {
      console.error('tab_games: $tab is already defined:');
      console.error($tab);
      return;
    }

    $tab = $('#games');

    initTemplates();
    initOptions();
  }

  /**
   * reset an original state.
   * 
   * TODO test Tab_Games.reset
   */
  Tab_Games.reset = function () {
    if (!$tab) {
      init();
    }

    // delete everything
    clearBoxes();
  };

  /**
   * reset an original game state, respecting the current state of Swiss
   */
  Tab_Games.update = function (force) {

    if (force) {
      updatepending = false;
    }

    if (updatepending) {
      console.log('updatepending');
    } else {
      updatepending = true;
      window.setTimeout(function () {
        try {
          Tab_Games.reset();

          showRunning();
          showTab();
          console.log('update');
        } catch (e) {
          console.log(e);
          new Toast(Strings.tabupdateerror.replace('%s', strings.tab_games));
        }
        updatepending = false;
      }, 1);
    }
  };

  Tab_Games.getOptions = function () {
    return Opts.getOptions({
      options : options
    });
  };

  Tab_Games.setOptions = function (opts) {
    return Opts.setOptions({
      options : options
    }, opts);
  };

  return Tab_Games;
});
