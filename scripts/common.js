/**
 * common.js: loads each requirejs-compatible script file (except tests) and
 * configures requirejs to load libraries as shims
 *
 * This file is automatically generated as part of the build process.
 * Do not attempt manual changes
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */

require.config({
  shim : {
    'lib/modernizr' : {
      deps: ['lib/Blob'],
      exports: 'Modernizr'
    },
      'lib/Blob' : {
      exports : 'Blob'
    },
      'lib/typeahead' : {
//      deps: [ 'lib/jquery' ]
    },
    'lib/jsPlumb' : {
//      deps: ['lib/jquery'],
      exports: 'jsPlumb'
    },
    'lib/qunit' : {
      exports: 'QUnit',
      /**
      * disable QUnit autoload/autostart for requirejs optimizer compatibility
      */
      init: function() {
        QUnit.config.autoload = false;
        QUnit.config.autostart = false;
      }
    },
  },
});

define([
  "backend/blobber",
  "backend/buchholzranking",
  "backend/correction",
  "backend/finebuchholzranking",
  "backend/fullmatrix",
  "backend/game",
  "backend/halfmatrix",
  "backend/kotournament",
  "backend/map",
  "backend/matrix",
  "backend/nettoranking",
  "backend/options",
  "backend/random",
  "backend/ranking",
  "backend/result",
  "backend/rleblobber",
  "backend/swisstournament",
  "backend/tournament",
  "backend/vector",
  "lib/extend",
  "lib/FileSaver",
  "lib/implements",
  "lib/jsPlumb",
  "ui/alltabs",
  "ui/autocomplete",
  "ui/backgroundscripts/box",
  "ui/backgroundscripts/online",
  "ui/backgroundscripts/reset",
  "ui/backgroundscripts/print",
  "ui/backgroundscripts/featuredetect",
  "ui/backgroundscripts/save",
  "ui/backgroundscripts/updatetab",
  "ui/boxcontroller",
  "ui/boxview",
  "ui/csver",
  "ui/data/swissperms",
  "ui/debug",
  "ui/globalranking",
  "ui/history",
  "ui/interfaces/model",
  "ui/interfaces/controller",
  "ui/interfaces/emitter",
  "ui/interfaces/view",
  "ui/listmodel",
  "ui/listview",
  "ui/options",
  "ui/opts",
  "ui/players",
  "ui/ranking",
  "ui/shared",
  "ui/splash",
  "ui/state",
  "ui/storage",
  "ui/strings",
  "ui/tab_debug",
  "ui/tab_games",
  "ui/tab_history",
  "ui/tab",
  "ui/tablemodel",
  "ui/tableview",
  "ui/tab_new",
  "ui/tab_ranking",
  "ui/tab_settings",
  "ui/tabshandle",
  "ui/tabs",
  "ui/tab_teams",
  "ui/team",
  "ui/toast",
  "ui/tournaments",
  "ui/update"
]);

