/**
 * tests
 *
 * @return a test function
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(function() {
  return function(QUnit, getModule) {
    var Emitter, Listener;

    Emitter = getModule('core/emitter');
    Listener = getModule('core/listener');

    QUnit.test('Listener', function() {
      var emitter, emitter2, listener, ref;

      emitter = new Emitter();
      emitter2 = new Emitter();
      emitter2.numListeners = function() {
        return this.listeners.length;
      };

      listener = new Listener(emitter);
      listener.updatecount = 0;
      listener.onupdate = function() {
        this.updatecount += 1;
      };
      listener.numEmitters = function() {
        return this.emitters.length;
      };

      QUnit.equal(listener.numEmitters(), 1,
          'listener initializes with an emitter');

      emitter.emit('update');
      QUnit.equal(listener.updatecount, 1,
          'update event received from emitter1');

      emitter2.registerListener(listener);
      QUnit.equal(listener.numEmitters(), 2, 'registerListener adds emitter2');

      emitter2.emit('update');
      QUnit.equal(listener.updatecount, 2, 'receiving events from emitter2');

      emitter.unregisterListener(listener);
      QUnit.equal(listener.numEmitters(), 1,
          'emitter.destroy() unregisters the listener');

      emitter.registerListener(listener);
      QUnit.equal(listener.numEmitters(), 2, 're-registering the emitter');

      emitter.destroy();
      QUnit.equal(listener.numEmitters(), 1,
          'emitter.destroy() unregisters the listener');

      listener.destroy();
      QUnit.equal(listener.numEmitters(), 0,
          'listener.destroy() unregisters all emitters');
      QUnit.equal(emitter2.numListeners(), 0,
          'listener.destroy() unregisters the listener from all emitters');

      /*
       * Listener.bind
       */
      emitter = new Emitter();
      ref = 0;
      Listener.bind(emitter, 'update', function() {
        ref += 1;
      });

      emitter.emit('update');
      emitter.emit('reset');
      QUnit.ok(emitter, 'bind-created listener works');

      emitter.destroy();
      emitter = new Emitter();
      ref = 0;
      Listener.bind(emitter, 'update,reset', function(e, evt, data) {
        ref += (data || 1);
      });

      emitter.emit('reset');
      emitter.emit('update', 123);

      QUnit.equal(ref, 124, 'bind-listening for multiple event types '
          + 'with data object');

      emitter.destroy();
      emitter = new Emitter();

      ref = undefined;
      Listener.bind(emitter, 'reset', function() {
        ref = this;
      }, emitter);

      emitter.emit('reset');

      QUnit.equal(ref, emitter, 'bind(): thisArg works');

      /*
       * testing memory leak due to invalid forEach call
       */
      emitter = new Emitter();
      emitter2 = new Emitter();
      listener = new Listener(emitter);
      emitter2.registerListener(listener);
      listener.destroy();

      QUnit.equal(emitter.listeners.length, 0,
          'memleak: first emitter was unregistered');
      QUnit.equal(emitter2.listeners.length, 0,
          'memleak: second emitter was unregistered');

      /**
       * double-listening test
       */
      emitter = new Emitter();
      listener = new Listener(emitter);
      emitter.registerListener(listener);
      QUnit.equal(listener.emitters.length, 1,
          'double registration of a listener is prevented');

      listener.resetcount = 0;
      listener.onreset = function() {
        this.resetcount += 1;
      }
      emitter.emit('reset');
      QUnit.equal(listener.resetcount, 1,
          'double invocation of a listener is prevented');
    });
  };
});
