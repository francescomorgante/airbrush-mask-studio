import test from 'node:test';
import assert from 'node:assert/strict';
import {generateMask} from '../src/engine/generate.js';
import {createProject,parseProject,serializeProject} from '../src/engine/project.js';
const rgba=(...values)=>new Uint8ClampedArray(values.flatMap(v=>[v,v,v,255]));
test('threshold includes dark boundary; inverse selects complementary bright pixels',()=>{
 const pixels=rgba(0,127,128,255);assert.deepEqual([...generateMask(pixels,4,1,{threshold:128})],[255,255,255,0]);assert.deepEqual([...generateMask(pixels,4,1,{threshold:128,invert:true})],[0,0,0,255]);
});
test('transparent pixels remain clear in both modes; semitransparent pixels use white backing',()=>{const data=new Uint8ClampedArray([0,0,0,0,0,0,0,128]);assert.deepEqual([...generateMask(data,2,1,{threshold:128})],[0,128]);assert.deepEqual([...generateMask(data,2,1,{threshold:128,invert:true})],[0,0]);});
test('detail reduction removes isolated dark specks and handles small dimensions',()=>{const data=rgba(255,255,255,255,0,255,255,255,255);assert.equal(generateMask(data,3,3,{threshold:128})[4],255);assert.equal(generateMask(data,3,3,{threshold:128,detail:1})[4],0);assert.deepEqual([...generateMask(rgba(0),1,1,{detail:4})],[255]);});
test('smoothing preserves uniform images and rejects invalid settings',()=>{assert.deepEqual([...generateMask(rgba(80,80,80,80),2,2,{threshold:100,detail:4})],[255,255,255,255]);assert.throws(()=>generateMask(rgba(0),1,1,{detail:5}));assert.throws(()=>generateMask(rgba(0),1,1,{threshold:256}));});
test('generated mask parameters and manual corrections survive project round trip',()=>{const p=createProject({src:'data:image/png;base64,aGVsbG8=',width:2,height:2});p.layers[0].generated={threshold:120,invert:true,detail:2};p.layers[0].strokes=[{tool:'erase',size:2,points:[{x:1,y:1}]}];assert.deepEqual(parseProject(serializeProject(p)),p);p.layers[0].generated.threshold=-1;assert.throws(()=>serializeProject(p));});
test('legacy v0.1 documents open and upgrade without changing their layers',()=>{const p=createProject({src:'data:image/png;base64,aGVsbG8=',width:2,height:2});p.version=1;const next=parseProject(JSON.stringify(p));assert.equal(next.version,2);assert.deepEqual(next.layers,p.layers);});
