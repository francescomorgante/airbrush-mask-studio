export function encodeMask(mask,width,height){
 if(mask.length!==width*height||width<1||height<1)throw Error('Maschera raster non valida.');const runs=[];let value=mask[0]?1:0,count=0;
 for(const pixel of mask){const next=pixel?1:0;if(next===value&&count<65535)count++;else{runs.push(count,value);value=next;count=1;}}runs.push(count,value);return{width,height,runs};
}
export function decodeMask(bitmap){
 if(!bitmap||!Number.isInteger(bitmap.width)||!Number.isInteger(bitmap.height)||bitmap.width<1||bitmap.height<1||!Array.isArray(bitmap.runs)||bitmap.runs.length%2)throw Error('Maschera raster non valida.');const out=new Uint8ClampedArray(bitmap.width*bitmap.height);let offset=0;
 for(let i=0;i<bitmap.runs.length;i+=2){const count=bitmap.runs[i],value=bitmap.runs[i+1];if(!Number.isInteger(count)||count<1||!['number'].includes(typeof value)||![0,1].includes(value)||offset+count>out.length)throw Error('Maschera raster non valida.');if(value)out.fill(255,offset,offset+count);offset+=count;}if(offset!==out.length)throw Error('Maschera raster incompleta.');return out;
}
