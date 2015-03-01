/**
 * Model, View and Controller of the settings tab
 *
 * This tab allows viewing and changing various settings of the program.
 *
 * @return Tab_Settings
 * @implements ./tab
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */

define(['./tab', 'lib/FileSaver', 'lib/Blob', './toast', './strings',
    './team', './history', './ranking', './state', './storage', 'options',
    './players', './tabshandle', './shared', 'options'], function(Tab, saveAs, 
        Blob, Toast, Strings, Team, History, Ranking, State, Storage, Options, 
        Players, Tabshandle, Shared, Options) {
  var Tab_Settings, $tab, areas, updatepending;

  updatepending = false;

  areas = {};

  function initCSV() {
    areas.csv = {};
    areas.csv.$buttons = $tab.find('.csv button');

    // set csv selection buttons
    areas.csv.$buttons.click(function() {
      var $button = $(this);

      // button contains image. Forward accidental clicks.
      if ($button.prop('tagName') === 'IMG') {
        $button = $button.parent();
      }

      csvupdate($button);
    });
  }

  function csvupdate($button) {
    var csv, blob;

    csv = [];

    if ($button.hasClass('teams')) {
      csv.push(Team.toCSV());
    }
    if ($button.hasClass('ranking')) {
      csv.push(Ranking.toCSV());
    }
    if ($button.hasClass('history')) {
      csv.push(History.toCSV());
    }

    csv = csv.join('\r\n""\r\n');

    if (csv.length === 0) {
      new Toast(Strings.nodata);
      return;
    }

    try {
      blob = new Blob([csv], {
        type: 'application/csv'
      });
      saveAs(blob, Options.csvfile);
    } catch (er) {
      console.error('Blobbing failed');
      new Toast(Strings.savefailed);
    }
  }

  function initLoad() {
    areas.load = {};

    areas.load.$file = $tab.find('input.load.file');

    areas.load.$file.change(function(evt) {
      var reader = new FileReader();
      reader.onerror = loadFileError;
      reader.onabort = loadFileAbort;
      reader.onload = loadFileLoad;

      reader.readAsText(evt.target.files[0]);
    });
  }

  function invalidateLoad() {
    $tab.find('.load .selected').removeClass('selected');

    areas.load.$file.val('');
  }

  function loadFileError(evt) {
    // file api callback function
    switch (evt.target.error.code) {
    case evt.target.error.NOT_FOUND_ERR:
      new Toast(Strings.filenotfound);
      break;
    case evt.target.error.NOT_READABLE_ERR:
      new Toast(Strings.filenotreadable);
      break;
    case evt.target.error.ABORT_ERR:
      break;
    default:
      new Toast(Strings.fileerror, Toast.LONG);
    }
  }

  function loadFileLoad(evt) {
    var blob, Alltabs;

    blob = evt.target.result;

    Storage.enable();
    Storage.clear(Options.dbname);

    try {
      if (State.fromBlob(blob)) {
        Storage.changed();
        resetStorageState();
        new Toast(Strings.loaded);
        Tabshandle.focus('teams');
      } else {
        // TODO what if something invalid has been returned?
      }
    } catch (err) {
      new Toast(Strings.loadfailed, Toast.LONG);
      // perform a complete reset of the everything related to the tournament
      Storage.enable();
      Storage.clear(Options.dbname);
      Alltabs = Shared.Alltabs;
      Alltabs.reset();
      State.reset();
      Alltabs.update();

      new Toast(Strings.newtournament);
      Tabshandle.focus('teams');
    }
  }

  function loadFileAbort() {
    new Toast(Strings.fileabort);
  }

  function reloadAutocomplete() {
    if (!Options.playernameurl) {
      console.warn('Options.playernameurl not specified. No player name autocompletion available');
      Players.reset();
      return;
    }
    $.get(Options.playernameurl, undefined, function(jsontext, status, response) {
      if (jsontext.length === 0) {
        new Toast(Strings.fileempty);
      } else {
        try {
          Players.fromBlob(jsontext);
          Storage.store();
          new Toast(Strings.autocompleteloaded);
        } catch (err) {
          console.error(err);
          Players.reset();
          Storage.store();
          new Toast(Strings.autocompletereloadfailed, Toast.LONG);
        }
      }
    }, 'text').fail(function() {
      var content, i;

      console.error('could not read ' + Options.playernameurl + '. Is this a local installation?');

      new Toast(Strings.autocompletereloadfailed, Toast.LONG);
    });
  }

  function initAutocomplete() {
    areas.autocomplete = {};

    areas.autocomplete.$button = $tab.find('.autocomplete button');
    areas.autocomplete.$file = $tab.find('.autocomplete input.file');

//    areas.autocomplete.$button.click(function() {
//      var $button = $(this);
//
//      // button contains image. Forward accidental clicks.
//      if ($button.prop('tagName') !== 'BUTTON') {
//        $button = $button.parents('button');
//      }
//
//      reloadAutocomplete();
//    });

    areas.autocomplete.$button.click(function() {
      areas.autocomplete.$file.click();
    });

    areas.autocomplete.$file.change(function(evt) {
      var reader = new FileReader();
      reader.onerror = autocompleteFileError;
      reader.onabort = autocompleteFileAbort;
      reader.onload = autocompleteFileLoad;

      reader.readAsText(evt.target.files[0]);
    });

    // always load playernames when the program is opened
    window.setTimeout(reloadAutocomplete, 1000);
  }

  function invalidateAutocomplete() {
    areas.autocomplete.$file.val('');
  }

  function autocompleteFileError(evt) {
    // file api callback function
    switch (evt.target.error.code) {
    case evt.target.error.NOT_FOUND_ERR:
      new Toast(Strings.filenotfound);
      break;
    case evt.target.error.NOT_READABLE_ERR:
      new Toast(Strings.filenotreadable);
      break;
    case evt.target.error.ABORT_ERR:
      break;
    default:
      new Toast(Strings.fileerror);
    }
  }

  function autocompleteFileLoad(evt) {
    var string;

    string = evt.target.result;

    Players.fromString(string);

    Storage.store();

    new Toast(Strings.autocompleteloaded);
  }

  function autocompleteFileAbort() {
    new Toast(Strings.fileabort);
  }

  function updateLocalStorageMeters() {
    var dbvalue, usage; // usage in MiB

    if (window.localStorage) {
      // player
      dbvalue = window.localStorage[Options.dbplayername];
      if (dbvalue) {
        usage = dbvalue.length / (1024 * 1024);
      } else {
        usage = 0.0;
      }

      areas.local.$playermeter.val(usage.toString());

      // tournament
      dbvalue = window.localStorage[Options.dbname];
      if (dbvalue) {
        usage = dbvalue.length / (1024 * 1024);
      } else {
        usage = 0.0;
      }

      areas.local.$tournamentmeter.val(usage.toString());
    }
  }

  function initLocalStorage() {
    areas.local = {};

    areas.local.$savebutton = $tab.find('.local button.save');
    areas.local.$clearbutton = $tab.find('.local button.clear');
    areas.local.$playermeter = $tab.find('.local .playerstoragemeter');
    areas.local.$tournamentmeter = $tab.find('.local .tournamentstoragemeter');

    areas.local.$savebutton.click(function(e) {
      Storage.enable();

      if (Storage.store()) {
        new Toast(Strings.saved);
      } else {
        new Toast(Strings.savefailed);
      }

      resetStorageState();

      e.preventDefault();
      return false;
    });

    areas.local.$clearbutton.click(function(e) {
      var Alltabs;

      // TODO don't use confirm()
      if (confirm(Strings.clearstorage)) {
        Storage.enable();
        Storage.clear(Options.dbname);

        Alltabs = Shared.Alltabs;

        Alltabs.reset();
        State.reset();
        Alltabs.update();

        new Toast(Strings.newtournament);
        Tabshandle.focus('teams');

        resetStorageState();
      }

      e.preventDefault();
      return false;
    });
  }

  /**
   * toggles the storage state depending on the current autosave checkbox state.
   *
   * @return {Boolean} true if autosave is enabled, false otherwise
   */
  function resetStorageState() {
    Storage.enable();
  }

  function init() {
    if ($tab) {
      console.error('tab_settings: $tab is already defined:');
      console.error($tab);
      return;
    }

    $tab = $('#settings');

    initCSV();
    initLoad();
    initAutocomplete();
    initLocalStorage();
  }

  /**
   * reset an initial state
   */
  function reset() {
    if (!$tab) {
      init();
    }

    invalidateLoad();
    invalidateAutocomplete();

    resetStorageState();

    updateLocalStorageMeters();
  }

  function update() {
    reset();
    updateLocalStorageMeters();
  }

  Tab_Settings = Tab.createTab('settings', reset, update);
  Shared.Tab_Settings = Tab_Settings;
  return Tab_Settings;
});
