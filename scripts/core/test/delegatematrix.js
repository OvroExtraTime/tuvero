/**
 * unit tests
 *
 * @return a test function
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */

/*
 * Various Matrix Tests
 */
define(function() {
  return function(QUnit, getModule) {
    var DelegateMatrix;

    DelegateMatrix = getModule('core/delegatematrix');
    MatrixModel = getModule('core/matrixmodel');
    extend = getModule('lib/extend');

    QUnit.test('DelegateMatrix', function() {
      // constructor validation
      var a, m, state;

      QUnit.ok(extend.isSubclass(DelegateMatrix, MatrixModel),
          'DelegateMatrix is a MatrixModel subclass');

      state = true;
      try {
        a = new DelegateMatrix();
      } catch (e) {
        state = false;
      }
      QUnit.equal(state, false, 'empty initialization fails');

      state = true;
      try {
        a = new DelegateMatrix(5);
      } catch (e) {
        state = false;
      }
      QUnit.equal(state, false, 'initialization with size fails');

      m = new MatrixModel(5);
      a = new DelegateMatrix(m);
      QUnit.ok(a, 'proper initialization');

      state = true;
      try {
        a.set(1, 2, 3);
      } catch (e) {
        state = false;
      }
      QUnit.equal(state, false, 'set() throws');

      state = true;
      try {
        a.remove(1);
      } catch (e) {
        state = false;
      }
      QUnit.equal(state, false, 'remove() throws');

      state = true;
      try {
        a.resize(1);
      } catch (e) {
        state = false;
      }
      QUnit.equal(state, false, 'resize() throws');

      state = true;
      try {
        a.fill(1);
      } catch (e) {
        state = false;
      }
      QUnit.equal(state, false, 'fill() throws');

      [0, 1, 2, 3, 4].forEach(function(row) {
        [0, 1, 2, 3, 4].forEach(function(col) {
          m.set(row, col, 12 - (row * a.length + col));
        });
      });

      QUnit.equal(a.get(0, 0), 12, 'get() delegates to the linked matrix');
      QUnit.equal(a.get(3, 2), -5, 'get() delegates to the linked matrix');
      QUnit.equal(a.get(1, 0), 7, 'get() delegates to the linked matrix');
      QUnit.equal(a.get(4, 4), -12, 'get() delegates to the linked matrix');

      QUnit.equal(a.get(-1, 2), undefined, 'get() out of bounds (row low)');
      QUnit.equal(a.get(2, -9), undefined, 'get() out of bounds (col low)');
      QUnit.equal(a.get(5, 3), undefined, 'get() out of bounds (row high)');
      QUnit.equal(a.get(3, 7531), undefined, 'get() out of bounds (col high)');
    });
  };
});
