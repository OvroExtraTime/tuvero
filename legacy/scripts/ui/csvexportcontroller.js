/**
 * CSVExportController
 *
 * @return CSVExportController
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(['lib/extend', 'core/controller', './state_new', 'options',
    'lib/FileSaver', 'lib/Blob', './toast', './strings'], function(extend,
    Controller, State, Options, saveAs, Blob, Toast, Strings) {
  /**
   * Constructor
   *
   * @param view
   *          a View which contains the CSV container
   */
  function CSVExportController(view) {
    var controller;
    CSVExportController.superconstructor.call(this, view);

    controller = this;

    this.$buttons = this.view.$view.find('button');

    this.$buttons.click(function() {
      var $button, classes;

      $button = $(this);
      classes = $button.attr('class').split(' ');

      controller.saveCSV(classes);
    });
  }
  extend(CSVExportController, Controller);

  CSVExportController.prototype.saveCSV = function(datasets) {
    var data, blob;

    data = this.generateCSV(datasets);
    try {
      blob = new Blob([data], {
        type: 'text/csv'
      });
      saveAs(blob, Options.csvfile);
    } catch (e) {
      new Toast(Strings.exportfailed, Strings.LONG);
    }
  };

  /**
   * create a shared CSV file
   *
   * @param datasets
   *          an array of strings, each of which is a dataset name (i.e. one of
   *          'ranking', 'history' or 'teams)
   * @return a combined CSV string of all datasets
   */
  CSVExportController.prototype.generateCSV = function(datasets) {
    var csvDataSets = datasets.map(function(dataset) {
      if (this[dataset + 'ToCSV']) {
        return this[dataset + 'ToCSV']();
      }

      State.emit('error', 'missing CSV export function: ' + dataset);
      return 'CSV export failed for ' + dataset;
    }, this);

    return csvDataSets.join('\r\n\r\n');
  };

  /**
   * @return a CSV string which represents the registered teams
   */
  CSVExportController.prototype.teamsToCSV = function() {
    var csvLines;

    csvLines = State.teams.map(function(team) {
      var i, line;

      line = [team.getID() + 1];

      for (i = 0; i < team.length; i += 1) {
        line.push(this.escape(team.getPlayer(i).getName()));
      }

      return line.join(',');
    }, this);

    csvLines.unshift(Strings.csvheader_teams);

    return csvLines.join('\r\n');
  };

  /**
   * @return a CSV string which represents the ranking
   */
  CSVExportController.prototype.rankingToCSV = function() {
    return 'ranking';
  };

  /**
   * @return a CSV string which represents all past matches and byes, without
   *         placeholders
   */
  CSVExportController.prototype.historyToCSV = function() {
    return 'history';
  };

  CSVExportController.prototype.escape = function(string) {
    string = "" + string;

    if (/[",]|\s/.test(string)) {
      string = string.replace(/"/g, '""');
      string = '"' + string + '"';
    }

    return string;
  }

  return CSVExportController;
});
