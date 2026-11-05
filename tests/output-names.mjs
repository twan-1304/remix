import assert from 'node:assert/strict';
import test from 'node:test';
import {defaultNaming,normalizeNaming,outputExtension,exportedExtension,planOutputNames} from '../output-names.js';
import {uniqueOutputNames} from '../remix-engine.js';
import {defaultPreferences,normalizePreferences,loadPreferences,savePreferences,PREFERENCES_KEY} from '../preferences.js';
const file=(name,format='WebP',extra={})=>({name,format,...extra});
const names=(items,p)=>planOutputNames(items,p).map(i=>i.name);

test('default, original basename, prefix/suffix and per-file override',()=>{
 assert.deepEqual(names([file('holiday.jpg')]),['holiday-remix.webp']);
 assert.deepEqual(names([file('holiday.jpg')],{suffix:''}),['holiday.webp']);
 assert.deepEqual(names([file('holiday.jpg')],{prefix:'site-',suffix:'-final'}),['site-holiday-final.webp']);
 assert.deepEqual(names([file('source.jpg','WebP',{customName:'my-banner.webp'}),file('clip.mov','MP4',{customName:'holiday-cut.mp4'})]),['my-banner.webp','holiday-cut.mp4']);
 assert.deepEqual(names([file('a.jpg','PNG',{customName:'banner.mp4'})]),['banner.png']);
 assert.deepEqual(names([file('a.jpg','PNG',{customName:'  '})]),['a-remix.png']);
});
test('templates, literal extensions, numbering and token text in filenames',()=>{
 assert.deepEqual(names([file('a.jpg')],{mode:'template',template:'{name}-final.{ext}'}),['a-final.webp']);
 assert.deepEqual(names([file('a.jpg')],{mode:'template',template:'{name}.mp4'}),['a.webp']);
 assert.deepEqual(names([file('report.png.jpg')],{mode:'template',template:'{name}.{ext}'}),['report.png.webp']);
 assert.deepEqual(names([file('{ext}-{index}.png')],{mode:'template',template:'{name}.{ext}'}),['{ext}-{index}.webp']);
 assert.deepEqual(names([file('a.jpg'),file('b.jpg')],{suffix:'',numbering:true,start:9,padding:3}),['a-009.webp','b-010.webp']);
 assert.deepEqual(names([file('a.jpg'),file('b.jpg','PNG')],{mode:'template',template:'shot-{index}.{ext}',numbering:true,start:10,padding:4}),['shot-0010.webp','shot-0011.png']);
 assert.deepEqual(names([file('a.jpg','PNG',{customName:'own'})],{mode:'template',template:'{index}',numbering:true}),['own-001.png']);
 assert.deepEqual(names([file('a.jpg')],{mode:'template',template:' '}),['a-remix.webp']);
});
test('true output MIME wins over settings and typed extensions',()=>{
 const pairs=[['MP4','video/mp4','mp4'],['MOV','video/quicktime','mov'],['WebM','video/webm','webm'],['PNG','image/png','png'],['JPEG','image/jpeg','jpg'],['WebP','image/webp','webp']];
 for(const [format,type,ext] of pairs){
  assert.equal(outputExtension({format}),ext);
  assert.deepEqual(names([file('source.png','PNG',{blob:new Blob(['bytes'],{type}),customName:'name.jpg'})]),['name.'+ext]);
 }
 assert.throws(()=>outputExtension({blob:new Blob([]),format:'PNG'}),/Unknown output/);
 assert.throws(()=>outputExtension({format:'bogus'}),/Unknown output/);
});
test('duplicates, case folding, normalization and collisions with numbered source names',()=>{
 const input=['photo.jpg','PHOTO.png','photo (2).png','photo.jpg','café.jpg','cafe\u0301.jpg'].map(n=>file(n));
 const output=planOutputNames(input,{suffix:''});
 assert.deepEqual(output.map(i=>i.name),['photo.webp','PHOTO (2).webp','photo (2) (2).webp','photo (3).webp','café.webp','café (2).webp']);
 assert.deepEqual(uniqueOutputNames(output),output,'a second pass in separate/ZIP exports must not change names');
 assert.deepEqual(names([file('same.jpg','PNG'),file('same.png','JPEG'),file('same.jpg','PNG')],{suffix:''}),['same.png','same.jpg','same (2).png']);
});
test('path traversal, invalid/control/bidi characters, Unicode, reserved devices, empty names',()=>{
 for(const customName of ['../../CON','..\\NUL.png','aux.txt','LPT1','a\x00b\u202Ec\u2066d<>:"|?*','...',' / ','東京🌸é','<img src=x onerror=alert(1)>']){
  const [name]=names([file('x.jpg','PNG',{customName})],{suffix:''});
  assert.match(name,/\.png$/);assert.doesNotMatch(name,/[\\/\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069<>:"|?*]/);
  assert.doesNotMatch(name,/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i);
  assert.notEqual(name,'.png');assert.notEqual(name,'..png');
 }
 assert.deepEqual(names([file('東京🌸.jpg')],{suffix:''}),['東京🌸.webp']);
});
test('long Unicode names and large duplicate batches survive ZIP sanitization',()=>{
 assert.match(names([file('x'.repeat(500)+'.jpg')],{numbering:true})[0],/-001\.webp$/);
 for(const stem of ['x'.repeat(500),'🌸'.repeat(100),'界'.repeat(200)]){
  const output=planOutputNames(Array.from({length:150},()=>file(stem+'.png')));
  assert.equal(new Set(output.map(i=>i.name.toLowerCase())).size,150);
  for(const {name} of output){assert.ok(new TextEncoder().encode(name).length<255);assert.doesNotMatch(name,/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/);}
  assert.deepEqual(uniqueOutputNames(output),output);
 }
});
test('partial completion, cancellation/retry and repeated exports reserve queue positions',()=>{
 const queue=[file('same.png','PNG',{id:1,status:'canceled'}),file('same.png','PNG',{id:2,status:'complete'}),file('same.png','PNG',{id:3,status:'error'})];
 const p={suffix:'',numbering:true,start:5};
 const planned=planOutputNames(queue,p);
 assert.equal(planned.filter(i=>i.status==='complete')[0].name,'same-006.png');
 queue[0].status='complete';queue[2].status='complete';
 assert.deepEqual(names(queue,p),planned.map(i=>i.name));
 assert.deepEqual(names(queue,{suffix:''}),['same.png','same (2).png','same (3).png']);
 assert.deepEqual(names(queue,p),names(queue,p));
});
test('preferences migrate, round-trip, reset, validate and tolerate blocked storage',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)};
 const p=defaultPreferences();p.theme='paper';p.naming={mode:'template',template:'{index}-{name}',prefix:'x',suffix:'',numbering:true,start:5,padding:2};
 assert.equal(savePreferences(p,storage),true);assert.deepEqual(loadPreferences(storage),p);
 data.set(PREFERENCES_KEY,JSON.stringify({theme:'paper',features:{hints:false}}));
 assert.deepEqual(loadPreferences(storage).naming,defaultNaming());assert.equal(loadPreferences(storage).features.hints,false);
 assert.deepEqual(normalizePreferences({naming:null}).naming,defaultNaming());
 assert.deepEqual(normalizeNaming({mode:'bad',prefix:5,suffix:null,start:-5,padding:999,numbering:'yes'}),{...defaultNaming(),start:1,padding:6});
 data.set(PREFERENCES_KEY,'broken JSON');assert.deepEqual(loadPreferences(storage).naming,defaultNaming());
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};
 assert.equal(savePreferences(p,blocked),false);assert.deepEqual(loadPreferences(blocked),defaultPreferences());
 assert.deepEqual(defaultPreferences().naming,defaultNaming());
});

test('disk-backed outputs derive their extension from file signatures, once per result',async()=>{
 const fixtures=[['png',[137,80,78,71,13,10,26,10]],['jpg',[255,216,255,224]],['webp',[...Buffer.from('RIFF0000WEBP')]],['webm',[26,69,223,163]],['mp4',[...Buffer.from('0000ftypisom')]],['mov',[...Buffer.from('0000ftypqt  ')]]];
 for(const [extension,header] of fixtures){const blob=new Blob([new Uint8Array(header)]);assert.equal(await exportedExtension(blob),extension);assert.deepEqual(names([file('a.png','PNG',{blob,extension})]),['a-remix.'+extension]);}
 await assert.rejects(exportedExtension(new Blob(['invalid bytes'])),/Unknown output/);
 assert.equal(await exportedExtension(new Blob(['bytes'],{type:'image/webp'})),'webp');
});
