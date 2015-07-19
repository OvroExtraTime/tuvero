/**
 * store the state whenever a player name changes
 *
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(['ui/state_new', 'ui/listcollectormodel', 'ui/teammodel', 'ui/storage',
    'core/listener'], function(State, ListCollectorModel, TeamModel, Storage,
    Listener) {
  var updatePending, nameListener,

  updatePending = undefined;

  function save() {
    if (updatePending === undefined) {
      updatePending = window.setTimeout(function() {
        updatePending = undefined;
        Storage.store();
      }, 10);
    }
  }

  // save on player name change
  Listener.bind(new ListCollectorModel(State.teams, TeamModel), 'update', save//
  );

  // save on team insertion/removal
  Listener.bind(State.teams, 'resize', save);

  // save on tournament insertion/removal
  Listener.bind(State.tournaments, 'resize', save);

  // save on global ranking change (i.e. after every match, etc.
  Listener.bind(State.tournaments, 'update', save);

  // save on tournament name change
  nameListener = new Listener();
  nameListener.onupdate = save;

  // register tournament listeners
  Listener.bind(State.tournaments, 'insert', function(emitter, event, data) {
    data.object.getName().registerListener(nameListener);
  });
  Listener.bind(State.tournaments, 'remove', function(emitter, event, data) {
    data.object.getName().unregisterListener(nameListener);
  });

});
