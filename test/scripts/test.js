/**
 * Run every available test
 *
 * This file is automatically created on build. Do not attempt manual changes
 *
 * @author Erik E. Lorenz <erik.e.lorenz@gmail.com>
 * @license MIT License
 * @see LICENSE
 */
require(['config'], function() {
  require(['core/config'], function() {
    require(['core/common', 'qunit',
  'core/test/absolutematrix',
  'core/test/antisymmetricmatrixmodel',
  'core/test/delegatematrix',
  'core/test/emitter',
  'core/test/indexedlistmodel',
  'core/test/indexedmodel',
  'core/test/listener',
  'core/test/listmodel',
  'core/test/listupdatelistener',
  'core/test/maplistmodel',
  'core/test/matchmodel',
  'core/test/matchreferencelistmodel',
  'core/test/matchreferencemodel',
  'core/test/matchresult',
  'core/test/matrixmodel',
  'core/test/model',
  'core/test/positivematrix',
  'core/test/propertymodel',
  'core/test/rankingcomponentindex',
  'core/test/rankingdatalistenerindex',
  'core/test/rankingheadtohead',
  'core/test/rankingmapper',
  'core/test/rankingmodel',
  'core/test/rankingsonneborn',
  'core/test/rankingtac',
  'core/test/readonlylistmodel',
  'core/test/rle',
  'core/test/roundtournamentmodel',
  'core/test/selectionvaluemodel',
  'core/test/statevaluemodel',
  'core/test/symmetricmatrixmodel',
  'core/test/tournamentindex',
  'core/test/tournamentmodel',
  'core/test/transposedifferencematrix',
  'core/test/transposesummatrix',
  'core/test/trianglematrixmodel',
  'core/test/type',
  'core/test/uniquelistmodel',
  'core/test/valuemodel',
  'core/test/vectormodel',
  'backend/test/gameresultscorrection',
  'backend/test/kotournament',
  'backend/test/map',
  'backend/test/matrix',
  'backend/test/random',
  'backend/test/ranking',
  'backend/test/rleblobber',
  'backend/test/swisstournament',
  'backend/test/vector',

  'ui/test/blobs',
  'ui/test/csv',
  'ui/test/listcollectormodel',
  'ui/test/playermodel',
  'ui/test/tab',
  'ui/test/teammodel'
], function(Common, QUnit) {
          var i;
          for (i = 2; i < arguments.length; i += 1) {
            try {
              arguments[i](QUnit, Common);
            } catch (e) {
              QUnit.test('Loading Error', function() {
                var source = e.stack.split('\n')[2].replace(/^ *at */, '')
                  .replace(/\?bust=[0-9]*/, '');
                console.error(e.message);
                console.error(source);
                QUnit.ok(false, 'cannot load module ' +
                  e.message.match(/"[^"]+"/) + '. Possible typo?\n' +
                  source);
              });
            }
          }
          QUnit.load();
          QUnit.start();
        });
  });
});
