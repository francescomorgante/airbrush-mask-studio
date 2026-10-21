import test from 'node:test';
import assert from 'node:assert/strict';
import {selectRegions} from '../src/engine/selection.js';

const pixels=values=>new Uint8ClampedArray(values.flatMap(v=>[v,v,v,255]));
test('flood fill selects only the contiguous colour region',()=>{const data=pixels([10,10,200,10,200,200]);const mask=selectRegions(data,3,2,{tolerance:0,contiguous:true,seeds:[{x:0,y:0,operation:'add'}]});assert.deepEqual([...mask],[255,255,0,255,0,0]);});
test('non-contiguous mode selects matching pixels across gaps',()=>{const data=pixels([10,200,10]);const mask=selectRegions(data,3,1,{tolerance:0,contiguous:false,seeds:[{x:0,y:0,operation:'add'}]});assert.deepEqual([...mask],[255,0,255]);});
test('selection operations add, subtract and intersect without changing source pixels',()=>{const data=pixels([10,12,100,102]);const original=new Uint8ClampedArray(data),base={tolerance:3,contiguous:false};assert.deepEqual([...selectRegions(data,4,1,{...base,seeds:[{x:0,y:0,operation:'add'},{x:1,y:0,operation:'subtract'}]})],[0,0,0,0]);assert.deepEqual([...selectRegions(data,4,1,{...base,seeds:[{x:0,y:0,operation:'add'},{x:1,y:0,operation:'intersect'}]})],[255,255,0,0]);assert.deepEqual(data,original);});
