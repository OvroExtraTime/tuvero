/**
 * BoxView for collapsing boxes on click events
 *
 * @return BoxView
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */

define(['lib/extend', 'core/view', './boxcontroller'], function(extend, View,
    BoxController) {
  /**
   * Set the current tabbing state. This forbids tabbing into a collapsed box.
   *
   * @param $box
   *          the .boxview jQuery object
   */
  function setTabbing($box) {
    var i, $inputs, $input, enable;

    enable = !$box.hasClass('collapsed');

    $inputs = $box.find('a, button, input, select, textarea');

    for (i = 0; i < $inputs.length; i += 1) {
      $input = $inputs.eq(i);

      if (enable) {
        if ($input.data().tabindex === undefined) {
          $input.removeAttr('tabindex');
        } else {
          $input.attr('tabindex', $input.data().tabindex);
        }
        delete $input.data().tabindex;
      } else {
        $input.data().tabindex = $input.attr('tabindex');
        $input.attr('tabindex', -1);
      }
    }
  }

  /**
   * Constructor, which also creates the BoxController
   *
   * @param $box
   *          the .boxview jQuery object
   */
  function BoxView($box) {
    BoxView.superconstructor.call(this, undefined, $box);
    this.model.EVENTS = BoxView.EVENTS;

    if (this.$view.hasClass('collapsed')) {
      // start collapsed, if specified
      setTabbing(this.$view.css('height', 0));
    }

    this.controller = new BoxController(this);
  }
  extend(BoxView, View);

  BoxView.EVENTS = {
    toggle: true
  };

  /**
   * reset to the expanded state
   */
  BoxView.prototype.reset = function() {
    setTabbing(this.$view.removeClass('collapsed').css('height', '').css(
        'transition', ''));
  };

  /**
   * update the box with a transition, e.g. after toggling its state
   */
  BoxView.prototype.update = function() {
    var $box, oldheight, targetheight;

    $box = this.$view;

    if ($box.hasClass('collapsed')) {
      targetheight = 0;
    } else {
      oldheight = $box.height();
      $box.css('transition', '');
      $box.css('height', '');
      $box[0].offsetHeight;

      targetheight = $box.height();
      $box.css('height', oldheight);
      $box[0].offsetHeight;
    }
    $box.css('height', $box.height());
    $box.css('transition', 'height 0.5s');
    $box[0].offsetHeight;
    $box.css('height', targetheight);

    setTabbing($box);

    // reset the transition value
    setTimeout(function() {
      $box.css('transition', '');
      if (!$box.hasClass('collapsed')) {
        $box.css('height', '');
      }
    }, 500);
  };

  /**
   * toggle callback function
   */
  BoxView.prototype.ontoggle = function() {
    this.$view.toggleClass('collapsed');
    this.update();
  };

  return BoxView;
});
