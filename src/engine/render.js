import {generateMask} from './generate.js';
import {selectRegions,visitSelectionEdges} from './selection.js';
const generatedCache=new WeakMap();
function generatedCanvas(image,config,color,width,height){
 const cached=generatedCache.get(config);if(cached?.image===image&&cached.color===color)return cached.canvas;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,width,height),alpha=generateMask(pixels.data,width,height,config),rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 for(let i=0;i<alpha.length;i++){pixels.data[i*4]=rgb[0];pixels.data[i*4+1]=rgb[1];pixels.data[i*4+2]=rgb[2];pixels.data[i*4+3]=alpha[i];}ctx.putImageData(pixels,0,0);generatedCache.set(config,{image,color,canvas});return canvas;
}
function selectionCanvas(image,config,color,width,height){
 const cached=generatedCache.get(config);if(cached?.image===image&&cached.color===color)return cached.canvas;
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);const pixels=ctx.getImageData(0,0,width,height),alpha=selectRegions(pixels.data,width,height,config),rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 for(let i=0;i<alpha.length;i++){pixels.data[i*4]=rgb[0];pixels.data[i*4+1]=rgb[1];pixels.data[i*4+2]=rgb[2];pixels.data[i*4+3]=alpha[i];}ctx.putImageData(pixels,0,0);generatedCache.set(config,{image,color,canvas});return canvas;
}
function selectionPreview(image,config,color,width,height){
 const cached=generatedCache.get(config);if(cached?.image===image&&cached.previewColor===color)return cached;
 const source=document.createElement('canvas');source.width=width;source.height=height;const sourceCtx=source.getContext('2d',{willReadFrequently:true});sourceCtx.drawImage(image,0,0);const pixels=sourceCtx.getImageData(0,0,width,height),mask=selectRegions(pixels.data,width,height,config),rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 const fill=document.createElement('canvas');fill.width=width;fill.height=height;const fillCtx=fill.getContext('2d'),paint=fillCtx.createImageData(width,height);
 for(let i=0;i<mask.length;i++)if(mask[i]){const x=i%width,y=Math.floor(i/width),j=i*4,hatch=(x+y)%12<3;paint.data[j]=hatch?255:rgb[0];paint.data[j+1]=hatch?255:rgb[1];paint.data[j+2]=hatch?255:rgb[2];paint.data[j+3]=hatch?112:255;}
 fillCtx.putImageData(paint,0,0);const path=new Path2D(),edgeCount=visitSelectionEdges(mask,width,height),step=Math.max(1,Math.ceil(edgeCount/800000));visitSelectionEdges(mask,width,height,(x1,y1,x2,y2)=>{path.moveTo(x1,y1);path.lineTo(x2,y2);},step);
 const result={image,previewColor:color,mask,fill,path};generatedCache.set(config,result);return result;
}
function renderSelectionPreview(ctx,image,config,color,width,height,view,style,phase){
 const preview=selectionPreview(image,config,color,width,height),opacity=Math.min(1,Math.max(0,style.opacity));
 if(style.dim){ctx.save();ctx.fillStyle=`rgba(5,9,11,${style.dimOpacity})`;ctx.fillRect(0,0,width,height);ctx.globalCompositeOperation='destination-out';ctx.drawImage(preview.fill,0,0);ctx.restore();}
 ctx.save();ctx.globalAlpha=opacity;ctx.drawImage(preview.fill,0,0);ctx.restore();
 const unit=1/view.zoom;ctx.save();ctx.lineCap='butt';ctx.lineJoin='miter';ctx.lineWidth=3*unit;ctx.strokeStyle='#000';ctx.setLineDash([7*unit,7*unit]);ctx.lineDashOffset=-phase*unit;ctx.stroke(preview.path);ctx.lineWidth=1.5*unit;ctx.strokeStyle='#fff';ctx.lineDashOffset=(-phase+7)*unit;ctx.stroke(preview.path);ctx.restore();
}
export function drawStroke(ctx,s,color){
 ctx.globalCompositeOperation=s.tool==='erase'?'destination-out':'source-over';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=s.size;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.arc(s.points[0].x,s.points[0].y,s.size/2,0,Math.PI*2);ctx.fill();
 if(s.points.length>1){ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);for(const p of s.points.slice(1))ctx.lineTo(p.x,p.y);ctx.stroke();}ctx.globalCompositeOperation='source-over';
}
export function renderLayer(ctx,l,image,width,height){
 ctx.clearRect(0,0,width,height);
 if(l.generated)ctx.drawImage(generatedCanvas(image,l.generated,l.color,width,height),0,0);
 if(l.regions)ctx.drawImage(selectionCanvas(image,l.regions,l.color,width,height),0,0);
 for(const s of l.strokes)drawStroke(ctx,s,l.color);
}
export function renderProject(ctx,project,image,view,scratch,previewLayer=null,selectionStyle=null,phase=0){
 const {width,height}=ctx.canvas;ctx.clearRect(0,0,width,height);if(!project||!image)return;
 ctx.save();ctx.translate(view.x,view.y);ctx.scale(view.zoom,view.zoom);ctx.drawImage(image,0,0);
 scratch.width=project.image.width;scratch.height=project.image.height;const sc=scratch.getContext('2d');
 const layers=previewLayer?[previewLayer]:project.layers;
 for(const l of layers){if(!l.visible)continue;if(selectionStyle&&l.regions){renderLayer(sc,{...l,regions:null},image,scratch.width,scratch.height);ctx.globalAlpha=.58;ctx.drawImage(scratch,0,0);ctx.globalAlpha=1;renderSelectionPreview(ctx,image,l.regions,l.color,scratch.width,scratch.height,view,selectionStyle,phase);}else{renderLayer(sc,l,image,scratch.width,scratch.height);ctx.globalAlpha=.58;ctx.drawImage(scratch,0,0);}}ctx.restore();
}
