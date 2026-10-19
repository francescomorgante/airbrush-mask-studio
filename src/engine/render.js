import {generateMask} from './generate.js';
const generatedCache=new WeakMap();
function generatedCanvas(image,config,color,width,height){
 const cached=generatedCache.get(config);if(cached?.image===image&&cached.color===color)return cached.canvas;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,width,height),alpha=generateMask(pixels.data,width,height,config),rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 for(let i=0;i<alpha.length;i++){pixels.data[i*4]=rgb[0];pixels.data[i*4+1]=rgb[1];pixels.data[i*4+2]=rgb[2];pixels.data[i*4+3]=alpha[i];}ctx.putImageData(pixels,0,0);generatedCache.set(config,{image,color,canvas});return canvas;
}
export function drawStroke(ctx,s,color){
 ctx.globalCompositeOperation=s.tool==='erase'?'destination-out':'source-over';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=s.size;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.arc(s.points[0].x,s.points[0].y,s.size/2,0,Math.PI*2);ctx.fill();
 if(s.points.length>1){ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);for(const p of s.points.slice(1))ctx.lineTo(p.x,p.y);ctx.stroke();}ctx.globalCompositeOperation='source-over';
}
export function renderProject(ctx,project,image,view,scratch,previewLayer=null){
 const {width,height}=ctx.canvas;ctx.clearRect(0,0,width,height);if(!project||!image)return;
 ctx.save();ctx.translate(view.x,view.y);ctx.scale(view.zoom,view.zoom);ctx.drawImage(image,0,0);
 scratch.width=project.image.width;scratch.height=project.image.height;const sc=scratch.getContext('2d');
 const layers=previewLayer?[previewLayer]:project.layers;
 for(const l of layers){if(!l.visible)continue;sc.clearRect(0,0,scratch.width,scratch.height);if(l.generated)sc.drawImage(generatedCanvas(image,l.generated,l.color,scratch.width,scratch.height),0,0);for(const s of l.strokes)drawStroke(sc,s,l.color);ctx.globalAlpha=.58;ctx.drawImage(scratch,0,0);}ctx.restore();
}
