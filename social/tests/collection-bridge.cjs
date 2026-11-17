'use strict';
const assert=require('node:assert/strict');
const {buildSnapshot,diffSnapshots,makeKey}=require('../collection-bridge.js');
const baseline={series:[
 {id:'op',title:'One Piece',edition:'Edizione standard',publisher:'Star Comics',total:3,owned:[3,1,1,2,0],
  notes:'PRIVATE NOTE NEVER PUBLISH',purchasePlans:{4:{price:99}}},
 {id:'op2',title:'One Piece',edition:'Edizione standard',publisher:'Star Comics',total:3,owned:[2],
  specialVolumes:[{number:1,label:'Variant Cover',owned:true},{number:2,label:'Altro speciale',owned:false}]},
 {id:'op3',title:'One Piece',edition:'Perfect Edition',publisher:'Star Comics',total:1,owned:[1]},
 {id:'op4',title:'One Piece',edition:'Edizione standard',publisher:'Altro editore',total:1,owned:[1]},
 {id:'one',title:'Volume Unico',edition:'Standard',publisher:'Test',total:1,owned:[1]},
 {id:'empty',title:'Serie vuota',total:22,owned:[]}
],wishlist:[{title:'Secret wishlist'}],activity:[{secret:'never copy'}]};
const rows=buildSnapshot(baseline);
assert.equal(rows.length,7,'Regular 3 + special 1 + other edition 1 + other publisher 1 + oneshot 1');
assert.equal(rows.filter(x=>x.series_title==='One Piece').length,5);
assert.equal(rows.filter(x=>x.series_title==='One Piece — Variant Cover').length,1);
assert.equal(rows.filter(x=>x.series_title==='Volume Unico').length,1);
assert.notEqual(makeKey('One Piece','Standard','Star Comics'),makeKey('One Piece','Perfect Edition','Star Comics'));
assert.notEqual(makeKey('One Piece','Standard','Star Comics'),makeKey('One Piece','Standard','Altro editore'));
assert.notEqual(makeKey('One Piece','Standard','Star Comics'),makeKey('One Piece','Standard','Star Comics','Variant Cover'));
assert(!JSON.stringify(rows).includes('PRIVATE NOTE'));
assert(!JSON.stringify(rows).includes('Secret wishlist'));
assert(!JSON.stringify(rows).includes('price'));
assert(!rows.some(x=>x.series_title==='Serie vuota'));
assert.deepEqual(buildSnapshot({series:[]}),[]);
assert.throws(()=>buildSnapshot({}),/series valida/);
const update=buildSnapshot({series:[{title:'One Piece',edition:'Edizione standard',publisher:'Star Comics',owned:[1,3,4]}]});
const changes=diffSnapshots(rows,update);
assert.equal(changes.upsert.length,1,'Only new volume 4 to insert');
assert.equal(changes.remove.length,5,'Removed volume 2 plus other edition, publisher, special and oneshot');
assert.equal(makeKey('F'.repeat(140),'E'.repeat(140),'P'.repeat(140)).length,160);
assert.deepEqual(buildSnapshot({series:[{title:'B',owned:[-1,0,2,2,2.5,10001]}]}).map(x=>x.volume_number),[2]);
console.log('PASS: existing MangaLog owned volumes projection, editions, one-shots, specials, privacy, idempotence, additions and removals');
