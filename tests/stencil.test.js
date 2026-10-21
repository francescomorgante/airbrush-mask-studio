import test from 'node:test';
import assert from 'node:assert/strict';
import {applyBridges,bridgeLengthMm,detectIslands,generateBridges} from '../src/engine/stencil.js';
import {maskToSvg} from '../src/engine/vectorize.js';
import {createProject,parseProject,serializeProject} from '../src/engine/project.js';

function donut(size=9){return Uint8Array.from({length:size*size},(_,i)=>{const x=i%size,y=Math.floor(i/size);return x>=1&&y>=1&&x<size-1&&y<size-1&&!(x>=3&&x<=5&&y>=3&&y<=5)?1:0;});}
test('detects only empty components enclosed by mask material',()=>{const islands=detectIslands(donut(),9,9);assert.equal(islands.length,1);assert.equal(islands[0].areaPx,9);assert.deepEqual(islands[0].bounds,{minX:3,minY:3,maxX:6,maxY:6});});
test('automatic bridge connects an island to the exterior and removes it',()=>{const mask=donut(),result=generateBridges(mask,9,9,90,90,10);assert.equal(result.islands.length,1);assert.equal(result.bridges.length,1);const joined=applyBridges(mask,9,9,90,90,result.bridges);assert.equal(detectIslands(joined,9,9).length,0);assert.ok(joined.reduce((a,b)=>a+b,0)<mask.reduce((a,b)=>a+b,0));assert.match(maskToSvg(joined,9,9,90,90).svg,/width="90mm"/);});
test('bridge width is interpreted in physical millimetres on non-square documents',()=>{const mask=new Uint8Array(200).fill(1),bridge={id:'b',enabled:true,automatic:false,widthMm:10,points:[{x:5,y:5},{x:15,y:5}]},out=applyBridges(mask,20,10,200,50,[bridge]);assert.equal(out[5*20+10],0);assert.equal(out[7*20+10],1);});
test('disabled bridges are non-destructive and invalid dimensions are rejected',()=>{const mask=donut(),bridge={id:'b',enabled:false,widthMm:2,points:[{x:4,y:4},{x:0,y:4}]};assert.deepEqual(applyBridges(mask,9,9,90,90,[bridge]),mask);assert.throws(()=>generateBridges(mask,9,9,0,90,2),/Misure/);});
test('bridge metrics use document millimetres rather than raw pixel distance',()=>{const bridge={points:[{x:0,y:0},{x:10,y:0},{x:10,y:10}]};assert.equal(bridgeLengthMm(bridge,20,20,200,100),150);});
test('v0.4 bridges survive project round trip',()=>{const p=createProject({src:'data:image/png;base64,aGVsbG8=',width:20,height:10});p.stencil={enabled:true,widthMm:2.5,bridges:[{id:'b1',enabled:true,automatic:false,widthMm:3,points:[{x:1,y:2},{x:18,y:8}]}]};assert.deepEqual(parseProject(serializeProject(p)),p);});
