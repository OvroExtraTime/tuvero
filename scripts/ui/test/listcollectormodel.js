/**
 * unit tests
 *
 * @return a test function
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(function() {
  return function(QUnit, getModule) {
    var ListModel, ListCollectorModel, ValueModel;

    ValueModel = getModule('core/valuemodel');
    ListModel = getModule('core/listmodel');
    ListCollectorModel = getModule('ui/listcollectormodel');

    QUnit.test('ListCollectorModel', function() {
      var model, list, listener, obj;

      listener = {
        updatecount: 0,
        onupdate: function() {
          listener.updatecount += 1;
        },
        emitters: []
      };

      list = new ListModel();
      model = new ListCollectorModel(list, ValueModel);
      model.registerListener(listener);

      QUnit.equal(model.emitters.length, 0, 'starting without any emitters');

      list.push(new ValueModel());

      QUnit.equal(model.emitters.length, 1, 'automatically adding emitters');

      list.get(0).set(5);
      QUnit.equal(listener.updatecount, 1,
          'recieving update events from inside the list');

      obj = list.pop();
      QUnit.equal(model.emitters.length, 0,
          'unregistering from emitters when they are removed from the list');
      return;

      listener.updatecount = 0;
      obj.set(8);
      QUnit.equal(listener.updatecount, 0,
          'removed emitters are unregistered from');

      list.push(obj);
      list.push(obj);
      list.push(obj);
      listener.updatecount = 0;
      obj.set(13);
      QUnit.equal(listener.updatecount, 1,
          'events of multiply inserted emitters are re-emitted exactly once');

      list.pop();
      listener.updatecount = 0;
      obj.set(20);
      QUnit.equal(listener.updatecount, 1,
          'not unregistering a multiply inserted element if removed once');
    });
  };
});
