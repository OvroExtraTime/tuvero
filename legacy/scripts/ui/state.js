/**
 * A singular object which represents the whole tournament state for the purpose
 * of being read from and written to storage.
 *
 * @return State
 * @implements ../backend/blobber
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(['options', './tabshandle', './team', './history', './tournaments',
    './tab_games', './tab_ranking', './tab_history', './shared'], function(
    Options, Tabshandle, Team, History, Tournaments, Tab_Games, Tab_Ranking,
    Tab_History, Shared) {
  var State;

  State = {
    /**
     * store the current program state in a blob
     *
     * @return the blob
     */
    toBlob: function() {
      return JSON.stringify({
        options: Options.toBlob(),
        team: Team.toBlob(),
        history: History.toBlob(),
        tournaments: Tournaments.toBlob()
      });
    },

    /**
     * restore the program state from the blob
     *
     * @param blob
     *          the blob
     */
    fromBlob: function(blob) {
      var ob;

      if (!blob) {
        return undefined;
      }

      ob = JSON.parse(blob);

      // fall back to default options when loading saves from before 1.2
      if (ob.options) {
        Options.fromBlob(ob.options);
        // Tabshandle.updateOpts();
      }

      Team.fromBlob(ob.team);
      History.fromBlob(ob.history);
      Tournaments.fromBlob(ob.tournaments);

      // update all tabs
      // Tab_Teams.update();
      // Tab_New.update();
      Tab_Games.update();
      Tab_History.update();
      Tab_Ranking.update(); // attempt ranking update

      return true;
    },

    /**
     * resets everything managed by Blob
     */
    reset: function() {
      Team.reset();
      History.reset();
      Tournaments.reset();
      Options.reset();
      // Tabshandle.updateOpts();
    }
  };

  Shared.State = State;
  return State;
});
