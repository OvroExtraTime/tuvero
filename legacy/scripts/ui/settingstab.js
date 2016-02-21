/**
 *
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(['lib/extend', 'jquery', 'core/view', './csvexportcontroller',
    'ui/timemachineview'], function(extend, $, View, CSVExportController,
    TimeMachineView) {
  /**
   * represents a whole team tab
   *
   * TODO write a TabView superclass with common functions
   *
   * TODO isolate common tab-related function
   *
   * @param $tab
   *          the tab DOM element
   */
  function SettingsTab($tab) {
    SettingsTab.superconstructor.call(this, undefined, $tab);

    this.init();
  }
  extend(SettingsTab, View);

  /**
   * initialize the tab functionality
   *
   * TODO maybe split it into multiple autodetected functions?
   */
  SettingsTab.prototype.init = function() {
    var $container;

    /*
     * CSV buttons
     */
    $container = this.$view.find('.csv');
    this.csvExportController = new CSVExportController(new View(undefined,
        $container));

    /*
     * Time Machine
     */
    $container = this.$view.find('.timemachineview');
    this.timeMachineView = new TimeMachineView($container);

  };

  // FIXME CHEAP HACK AHEAD
  $(function($) {
    var $tab;

    $tab = $('#tabs > [data-tab="settings"]');
    if ($tab.length && $('#testmain').length === 0) {
      return new SettingsTab($tab);
    }
  });

  return SettingsTab;
});
