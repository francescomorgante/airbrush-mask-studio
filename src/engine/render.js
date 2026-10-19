export function drawStroke(ctx,s,color){
 ctx.globalCompositeOperation=s.tool==='erase'?'destination-out':'source-over';ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=s.size;ctx.lineCap='round';ctx.lineJoin='round';
 ctx.beginPath();ctx.arc(s.points[0].x,s.points[0].y,s.size/2,0,Math.PI*2);ctx.fill();
 if(s.points.length>1){ctx.beginPath();ctx.moveTo(s.points[0].x,s.points[0].y);for(const p of s.points.slice(1))ctx.lineTo(p.x,p.y);ctx.stroke();}ctx.globalCompositeOperation='source-over';
}
export function renderProject(ctx,project,image,view,scratch){
 const {width,height}=ctx.canvas;ctx.clearRect(0,0,width,height);if(!project||!image)return;
 ctx.save();ctx.translate(view.x,view.y);ctx.scale(view.zoom,view.zoom);ctx.drawImage(image,0,0);
 scratch.width=project.image.width;scratch.height=project.image.height;const sc=scratch.getContext('2d');
 for(const l of project.layers){if(!l.visible)continue;sc.clearRect(0,0,scratch.width,scratch.height);for(const s of l.strokes)drawStroke(sc,s,l.color);ctx.globalAlpha=.58;ctx.drawImage(scratch,0,0);}ctx.restore();
}
