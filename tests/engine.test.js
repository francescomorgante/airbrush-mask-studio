import test from 'node:test';
import assert from 'node:assert/strict';
import {createProject,serializeProject,parseProject,screenToImage} from '../src/engine/project.js';
import {drawStroke} from '../src/engine/render.js';
const image={src:'data:image/png;base64,aGVsbG8=',width:800,height:400};
test('round trip preserves embedded image, physical size, hidden layers and erasing',()=>{const p=createProject(image);p.layers[0].visible=false;p.layers[0].strokes.push({tool:'erase',size:12,points:[{x:20,y:30},{x:25,y:35}]});assert.deepEqual(parseProject(serializeProject(p)),p);assert.equal(p.heightMm,105);});
test('pan and zoom convert pointer into source pixels',()=>{assert.deepEqual(screenToImage(110,90,{x:10,y:30,zoom:2}),{x:50,y:30});});
test('rejects incompatible and malformed local documents',()=>{for(const change of [{version:99},{widthMm:0},{image:{...image,src:'https://example.com/a.png'}},{layers:[]},{heightMm:Infinity}])assert.throws(()=>serializeProject({...createProject(image),...change}));const p=createProject(image);p.layers[0].strokes=[{tool:'paint',size:3,points:[{x:NaN,y:0}]}];assert.throws(()=>serializeProject(p));});
test('eraser affects layer alpha and restores normal composition',()=>{const operations=[];const ctx={set globalCompositeOperation(v){operations.push(v)},beginPath(){},arc(){},fill(){},moveTo(){},lineTo(){},stroke(){}};drawStroke(ctx,{tool:'erase',size:8,points:[{x:1,y:2},{x:2,y:3}]},'#ffffff');assert.deepEqual(operations,['destination-out','source-over']);});
