/**
 * Unit tests
 *
 * @return a test function
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
define(function() {
  return function(QUnit, getModule) {
    var ListModel, VectorModel, extend;

    extend = getModule('lib/extend');
    ListModel = getModule('core/listmodel');
    VectorModel = getModule('core/vectormodel');

    QUnit.test('VectorModel tests', function() {
      var vec, vec2, retvec, ref;

      QUnit.ok(extend.isSubclass(VectorModel, ListModel),
          'VectorModel is subclass of ListModel');

      vec = new VectorModel();

      QUnit.equal(vec.length, 0, 'empty initialization: length is 0');

      vec.resize(123);
      QUnit.equal(vec.length, 123, 'resize() expands to the wanted length');

      QUnit.equal(vec.get(0), 0, 'resize() fills with 0 (beg)');
      QUnit.equal(vec.get(55), 0, 'resize() fills with 0 (mid)');
      QUnit.equal(vec.get(122), 0, 'resize() fills with 0 (end)');

      vec.resize(5);
      QUnit.equal(vec.length, 5, 'resize() crops to the wanted length');
      QUnit.equal(vec.get(122), undefined,
          'get() reads removed elements as undefined');

      vec.resize(-5);
      QUnit.equal(vec.length, 0,
          'resize() to negative number crops to length 0');

      vec = new VectorModel(10);

      QUnit.equal(vec.sum(), 0, 'sum() of an empty/new vector is 0');

      vec.push(1);
      vec.push(2);
      vec.push(3);
      vec.push(4);
      vec.push(5);
      vec.push(6);
      vec.push(7);
      vec.push(8);

      QUnit.equal(vec.sum(), 36, 'sum() returns the correct sum');

      retvec = new VectorModel();
      vec2 = new VectorModel(vec.length);
      vec2.map(function(elem, index) {
        vec2.set(index, index);
      });

      QUnit.equal(retvec.setProduct(vec, vec2), retvec,
          'setProduct does not fail');
      QUnit.equal(retvec.length, vec.length, 'setProduct resizes target');
      ref = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 22, 36, 52, 70, 90, 112, 136];
      QUnit.deepEqual(retvec.asArray(), ref,
          'setProduct calculates the vector product');

      QUnit.equal(vec.dot(vec2), 528, 'dot() calculates the dot product');
    });
  };
});
