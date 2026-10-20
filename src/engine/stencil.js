const directions=[[1,0],[-1,0],[0,1],[0,-1]];

function validate(mask,width,height){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||mask.length!==width*height)throw Error('Maschera stencil non valida.');
}

// A stencil island is an empty component completely surrounded by cut/painted pixels.
export function detectIslands(mask,width,height){
 validate(mask,width,height);const seen=new Uint8Array(mask.length),islands=[];
 for(let start=0;start<mask.length;start++){
  if(mask[start]||seen[start])continue;const queue=[start],pixels=[];seen[start]=1;let head=0,touchesEdge=false,minX=width,minY=height,maxX=0,maxY=0,sumX=0,sumY=0;
  while(head<queue.length){const i=queue[head++],x=i%width,y=Math.floor(i/width);pixels.push(i);sumX+=x+.5;sumY+=y+.5;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);if(x===0||y===0||x===width-1||y===height-1)touchesEdge=true;
   for(const [dx,dy] of directions){const nx=x+dx,ny=y+dy,ni=ny*width+nx;if(nx>=0&&ny>=0&&nx<width&&ny<height&&!mask[ni]&&!seen[ni]){seen[ni]=1;queue.push(ni);}}
  }
  if(!touchesEdge)islands.push({id:islands.length+1,areaPx:pixels.length,centroid:{x:sumX/pixels.length,y:sumY/pixels.length},bounds:{minX,minY,maxX:maxX+1,maxY:maxY+1},pixels});
 }
 return islands;
}

function exteriorDistance(mask,width,height){
 const distance=new Int32Array(mask.length);distance.fill(-1);const previous=new Int32Array(mask.length);previous.fill(-1);const queue=[];
 const add=i=>{if(distance[i]===-1&&!mask[i]){distance[i]=0;queue.push(i);}};
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
 let head=0;while(head<queue.length){const i=queue[head++],x=i%width,y=Math.floor(i/width);for(const [dx,dy] of directions){const nx=x+dx,ny=y+dy,ni=ny*width+nx;if(nx>=0&&ny>=0&&nx<width&&ny<height&&distance[ni]===-1){distance[ni]=distance[i]+1;previous[ni]=i;queue.push(ni);}}}
 return {distance,previous};
}

function compactPath(points){return points.filter((p,i)=>{if(i===0||i===points.length-1)return true;const a=points[i-1],b=points[i+1];return (p.x-a.x)*(b.y-p.y)!==(p.y-a.y)*(b.x-p.x);});}

export function generateBridges(mask,width,height,widthMm,heightMm,bridgeWidthMm=2){
 validate(mask,width,height);if(![widthMm,heightMm,bridgeWidthMm].every(n=>Number.isFinite(n)&&n>0))throw Error('Misure dei raccordi non valide.');
 const islands=detectIslands(mask,width,height),{distance,previous}=exteriorDistance(mask,width,height),bridges=[];
 for(const island of islands){let cursor=island.pixels[0];for(const i of island.pixels)if(distance[i]>=0&&distance[i]<distance[cursor])cursor=i;if(distance[cursor]<0)continue;
  const points=[];let guard=0;while(cursor>=0&&guard++<mask.length){points.push({x:cursor%width+.5,y:Math.floor(cursor/width)+.5});if(distance[cursor]===0)break;cursor=previous[cursor];}
  if(points.length>1)bridges.push({id:`bridge-${island.id}`,islandId:island.id,enabled:true,automatic:true,widthMm:bridgeWidthMm,points:compactPath(points)});
 }
 return {islands,bridges};
}

function segmentDistanceMm(px,py,a,b,sx,sy){const ax=a.x*sx,ay=a.y*sy,bx=b.x*sx,by=b.y*sy,x=px*sx,y=py*sy,dx=bx-ax,dy=by-ay,t=dx||dy?Math.max(0,Math.min(1,((x-ax)*dx+(y-ay)*dy)/(dx*dx+dy*dy))):0;return Math.hypot(x-ax-t*dx,y-ay-t*dy);}

export function applyBridges(mask,width,height,widthMm,heightMm,bridges=[]){
 validate(mask,width,height);const out=new Uint8Array(mask),sx=widthMm/width,sy=heightMm/height;
 for(const bridge of bridges){if(bridge.enabled===false||!Array.isArray(bridge.points)||bridge.points.length<2||!Number.isFinite(bridge.widthMm)||bridge.widthMm<=0)continue;const r=bridge.widthMm/2,rx=r/sx+1,ry=r/sy+1;
  for(let s=1;s<bridge.points.length;s++){const a=bridge.points[s-1],b=bridge.points[s],minX=Math.max(0,Math.floor(Math.min(a.x,b.x)-rx)),maxX=Math.min(width-1,Math.ceil(Math.max(a.x,b.x)+rx)),minY=Math.max(0,Math.floor(Math.min(a.y,b.y)-ry)),maxY=Math.min(height-1,Math.ceil(Math.max(a.y,b.y)+ry));
   for(let y=minY;y<=maxY;y++)for(let x=minX;x<=maxX;x++)if(segmentDistanceMm(x+.5,y+.5,a,b,sx,sy)<=r)out[y*width+x]=0;
  }
 }
 return out;
}
