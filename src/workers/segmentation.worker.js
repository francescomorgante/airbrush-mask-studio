import{segmentColors}from'../engine/segmentation.js';
self.onmessage=e=>{try{const{data,width,height,colorCount}=e.data,result=segmentColors(new Uint8ClampedArray(data),width,height,colorCount);self.postMessage({ok:true,result},[result.labels.buffer,result.regions.ids.buffer]);}catch(error){self.postMessage({ok:false,error:error.message||'Segmentazione non riuscita.'});}};
