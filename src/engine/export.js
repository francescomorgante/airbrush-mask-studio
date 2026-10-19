import {renderLayer} from './render.js';
export function composeMask(project,image,layerIds){
 const {width,height}=project.image,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true}),mask=new Uint8Array(width*height);
 for(const layer of project.layers){if(!layerIds.includes(layer.id))continue;renderLayer(ctx,layer,image,width,height);const data=ctx.getImageData(0,0,width,height).data;for(let i=0;i<mask.length;i++)if(data[i*4+3]>=128)mask[i]=1;}
 if(!mask.some(Boolean))throw Error('La maschera è vuota. Seleziona un livello con aree dipinte o generate.');
 const pixels=ctx.createImageData(width,height);for(let i=0;i<mask.length;i++){const v=mask[i]?0:255;pixels.data[i*4]=pixels.data[i*4+1]=pixels.data[i*4+2]=v;pixels.data[i*4+3]=255;}ctx.putImageData(pixels,0,0);
 return {mask,canvas,width,height};
}
function crc32(bytes){let c=0xffffffff;for(const b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
// pHYs sets pixels/metre so printing software can recover the user-defined mm size.
export function withPhysicalSize(png,width,height,widthMm,heightMm){
 if(![width,height,widthMm,heightMm].every(n=>Number.isFinite(n)&&n>0)||png.length<33||png[0]!==137||png[1]!==80)throw Error('PNG o dimensioni non validi.');
 const chunk=new Uint8Array(21),view=new DataView(chunk.buffer);view.setUint32(0,9);chunk.set([112,72,89,115],4);view.setUint32(8,Math.round(width/widthMm*1000));view.setUint32(12,Math.round(height/heightMm*1000));chunk[16]=1;view.setUint32(17,crc32(chunk.subarray(4,17)));
 // Replace existing pHYs if any; keep all other chunks in their original order.
 const parts=[png.subarray(0,33),chunk];let offset=33;while(offset<png.length){if(offset+12>png.length)throw Error('PNG incompleto.');const length=new DataView(png.buffer,png.byteOffset+offset,4).getUint32(0);const end=offset+length+12;if(end>png.length)throw Error('PNG incompleto.');if(String.fromCharCode(...png.subarray(offset+4,offset+8))!=='pHYs')parts.push(png.subarray(offset,end));offset=end;}
 const out=new Uint8Array(parts.reduce((n,p)=>n+p.length,0));let i=0;for(const part of parts){out.set(part,i);i+=part.length;}return out;
}
export async function maskPng(canvas,widthMm,heightMm){const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw Error('Impossibile generare il PNG.');return new Blob([withPhysicalSize(new Uint8Array(await blob.arrayBuffer()),canvas.width,canvas.height,widthMm,heightMm)],{type:'image/png'});}
