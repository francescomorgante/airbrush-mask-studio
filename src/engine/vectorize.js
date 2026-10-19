// Trace pixel boundaries with selected cells on the right of every directed edge.
// At diagonal contacts, prefer a right turn to keep separate islands separate.
export function traceContours(mask,width,height){
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||mask.length!==width*height)throw Error('Maschera non valida.');
 const edges=new Map(),stride=width+1;let edgeCount=0;
 const add=(x,y,nx,ny,dir)=>{if(++edgeCount>200000)throw Error('Troppi contorni per SVG. Riduci i dettagli della maschera oppure esporta PNG.');const key=y*stride+x;const list=edges.get(key)||[];list.push({to:ny*stride+nx,dir});edges.set(key,list);};
 const selected=(x,y)=>x>=0&&y>=0&&x<width&&y<height&&mask[y*width+x]!==0;
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){if(!selected(x,y))continue;if(!selected(x,y-1))add(x,y,x+1,y,0);if(!selected(x+1,y))add(x+1,y,x+1,y+1,1);if(!selected(x,y+1))add(x+1,y+1,x,y+1,2);if(!selected(x-1,y))add(x,y+1,x,y,3);}
 const rings=[];
 while(edges.size){const start=edges.keys().next().value;let key=start,dir=edges.get(start)[0].dir;const points=[];
 do{points.push({x:key%stride,y:Math.floor(key/stride)});const list=edges.get(key);if(!list)throw Error('Contorno aperto non esportabile.');const turns=[(dir+1)%4,dir,(dir+3)%4,(dir+2)%4];list.sort((a,b)=>turns.indexOf(a.dir)-turns.indexOf(b.dir));const edge=list.shift();if(!list.length)edges.delete(key);key=edge.to;dir=edge.dir;}while(key!==start);
 const compact=points.filter((b,i)=>{const a=points[(i+points.length-1)%points.length],c=points[(i+1)%points.length];return (b.x-a.x)*(c.y-b.y)!==(b.y-a.y)*(c.x-b.x);});
 if(compact.length>=3)rings.push(compact);
 }
 return rings;
}
function distanceSquared(p,a,b){const dx=b.x-a.x,dy=b.y-a.y,t=dx||dy?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy))):0;return (p.x-a.x-t*dx)**2+(p.y-a.y-t*dy)**2;}
function simplifyLine(points,tolerance){const keep=new Uint8Array(points.length);keep[0]=keep[points.length-1]=1;const stack=[[0,points.length-1]];while(stack.length){const [a,b]=stack.pop();let max=tolerance*tolerance,index=-1;for(let i=a+1;i<b;i++){const d=distanceSquared(points[i],points[a],points[b]);if(d>max){max=d;index=i;}}if(index!==-1){keep[index]=1;stack.push([a,index],[index,b]);}}return points.filter((_,i)=>keep[i]);}
function area(ring){return ring.reduce((sum,p,i)=>{const q=ring[(i+1)%ring.length];return sum+p.x*q.y-q.x*p.y;},0)/2;}
function inside(p,ring){let hit=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const a=ring[i],b=ring[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)hit=!hit;}return hit;}
function safeTopology(original,rings){
 const segments=[];let work=0;
 rings.forEach((r,id)=>r.forEach((a,i)=>{const b=r[(i+1)%r.length];segments.push({a,b,id,i,n:r.length,minX:Math.min(a.x,b.x),maxX:Math.max(a.x,b.x),minY:Math.min(a.y,b.y),maxY:Math.max(a.y,b.y)});}));
 segments.sort((a,b)=>a.minX-b.minX);let active=[];
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 for(const s of segments){active=active.filter(t=>t.maxX>=s.minX);for(const t of active){if(++work>1000000)return false;if(s.id===t.id&&(Math.abs(s.i-t.i)===1||Math.abs(s.i-t.i)===s.n-1))continue;if(s.maxY<t.minY||t.maxY<s.minY)continue;if(cross(s.a,s.b,t.a)*cross(s.a,s.b,t.b)<=0&&cross(t.a,t.b,s.a)*cross(t.a,t.b,s.b)<=0)return false;}active.push(s);}
 for(let i=0;i<rings.length;i++)for(let j=0;j<rings.length;j++){if(i===j)continue;work+=original[j].length+rings[j].length;if(work>1000000)return false;if(inside(original[i][0],original[j])!==inside(rings[i][0],rings[j]))return false;}
 return true;
}
export function simplifyContours(rings,tolerance=0){
 if(!Number.isFinite(tolerance)||tolerance<0||tolerance>3)throw Error('Semplificazione non valida.');
 if(tolerance===0)return rings;
 // Preserve all loops, including tiny holes. Fallback when a loop collapses or flips.
 const simplified=rings.map(ring=>{let split=1;for(let i=2;i<ring.length;i++)if(distanceSquared(ring[i],ring[0],ring[0])>distanceSquared(ring[split],ring[0],ring[0]))split=i;const a=simplifyLine(ring.slice(0,split+1),tolerance),b=simplifyLine([...ring.slice(split),ring[0]],tolerance);const result=[...a.slice(0,-1),...b.slice(0,-1)];return result.length>=3&&area(result)*area(ring)>0?result:ring;});
 return safeTopology(rings,simplified)?simplified:rings;
}
export function maskToSvg(mask,width,height,widthMm,heightMm,tolerance=0,name='Maschera'){
 if(![widthMm,heightMm].every(n=>Number.isFinite(n)&&n>0&&n<=10000))throw Error('Dimensioni reali non valide.');
 const exact=traceContours(mask,width,height),rings=simplifyContours(exact,tolerance);
 if(!rings.length)throw Error('La maschera è vuota. Dipingi o genera delle aree prima di esportare.');
 const d=rings.map(r=>`M${r.map(p=>`${p.x} ${p.y}`).join('L')}Z`).join('');
 const title=String(name).replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
 return {svg:`<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" viewBox="0 0 ${width} ${height}"><title>${title}</title><path fill="black" fill-rule="evenodd" d="${d}"/></svg>`,contours:rings.length,vertices:rings.reduce((n,r)=>n+r.length,0)};
}
