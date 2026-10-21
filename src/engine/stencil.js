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

// Multi-source Dijkstra in physical space. This avoids preferring a path merely
// because an axis has more pixels and keeps automatic bridges short in mm.
function exteriorDistance(mask,width,height,widthMm,heightMm){
 const distance=new Float64Array(mask.length);distance.fill(Infinity);const previous=new Int32Array(mask.length),heap=[];previous.fill(-1);
 const push=(i,d)=>{heap.push([d,i]);let n=heap.length-1;while(n){const p=(n-1)>>1;if(heap[p][0]<=d)break;heap[n]=heap[p];n=p;}heap[n]=[d,i];};
 const pop=()=>{const root=heap[0],last=heap.pop();if(heap.length){let n=0;heap[0]=last;while(true){let c=n*2+1;if(c>=heap.length)break;if(c+1<heap.length&&heap[c+1][0]<heap[c][0])c++;if(heap[n][0]<=heap[c][0])break;[heap[n],heap[c]]=[heap[c],heap[n]];n=c;}}return root;};
 const add=i=>{if(distance[i]===Infinity&&!mask[i]){distance[i]=0;push(i,0);}};
 for(let x=0;x<width;x++){add(x);add((height-1)*width+x);}for(let y=0;y<height;y++){add(y*width);add(y*width+width-1);}
 const sx=widthMm/width,sy=heightMm/height;
 while(heap.length){const [d,i]=pop();if(d!==distance[i])continue;const x=i%width,y=Math.floor(i/width);for(const [dx,dy] of directions){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=width||ny>=height)continue;const ni=ny*width+nx,nd=d+(dx?sx:sy);if(nd+1e-9<distance[ni]){distance[ni]=nd;previous[ni]=i;push(ni,nd);}}}
 return {distance,previous};
}

function compactPath(points){return points.filter((p,i)=>{if(i===0||i===points.length-1)return true;const a=points[i-1],b=points[i+1];return (p.x-a.x)*(b.y-p.y)!==(p.y-a.y)*(b.x-p.x);});}

export function generateBridges(mask,width,height,widthMm,heightMm,bridgeWidthMm=2){
 validate(mask,width,height);if(![widthMm,heightMm,bridgeWidthMm].every(n=>Number.isFinite(n)&&n>0))throw Error('Misure dei raccordi non valide.');
 const islands=detectIslands(mask,width,height),{distance,previous}=exteriorDistance(mask,width,height,widthMm,heightMm),bridges=[],usedExits=[];
 const pathFor=start=>{const points=[];let cursor=start,guard=0;while(cursor>=0&&guard++<mask.length){points.push({x:cursor%width+.5,y:Math.floor(cursor/width)+.5});if(distance[cursor]===0)break;cursor=previous[cursor];}return compactPath(points);};
 // Smaller/nearer islands are resolved first. Each island receives exactly one
 // bridge; a soft spacing penalty prevents a visually dense cluster of exits.
 const nearest=island=>{let best=Infinity;for(const i of island.pixels)best=Math.min(best,distance[i]);return best;};
 const ordered=[...islands].sort((a,b)=>nearest(a)-nearest(b));
 for(const island of ordered){let best=null,candidates=[];for(const i of island.pixels){if(!Number.isFinite(distance[i]))continue;candidates.push(i);candidates.sort((a,b)=>distance[a]-distance[b]);if(candidates.length>32)candidates.length=32;}for(const i of candidates){const points=pathFor(i);if(points.length<2)continue;const exit=points.at(-1),ex=exit.x*widthMm/width,ey=exit.y*heightMm/height,minGap=usedExits.reduce((m,p)=>Math.min(m,Math.hypot(ex-p.x,ey-p.y)),Infinity),penalty=minGap<bridgeWidthMm*1.5?(bridgeWidthMm*1.5-minGap)*4:0,score=distance[i]+penalty;if(!best||score<best.score)best={score,points,exit:{x:ex,y:ey}};}
  if(best){usedExits.push(best.exit);bridges.push({id:`bridge-${island.id}`,islandId:island.id,enabled:true,automatic:true,widthMm:bridgeWidthMm,points:best.points});}
 }
 bridges.sort((a,b)=>(a.islandId??Infinity)-(b.islandId??Infinity));
 return {islands,bridges};
}

export function bridgeLengthMm(bridge,width,height,widthMm,heightMm){
 if(!bridge?.points?.length)return 0;const sx=widthMm/width,sy=heightMm/height;let length=0;for(let i=1;i<bridge.points.length;i++)length+=Math.hypot((bridge.points[i].x-bridge.points[i-1].x)*sx,(bridge.points[i].y-bridge.points[i-1].y)*sy);return length;
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
