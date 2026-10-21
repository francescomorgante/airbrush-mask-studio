export const MAX_PIXELS=24000000;
export function layer(name='Maschera 1'){return {id:crypto.randomUUID(),name,visible:true,color:'#e8ad55',strokes:[]};}
export function createProject(image){return {format:'airbrush-mask-studio',version:3,name:'Senza titolo',image,widthMm:210,heightMm:210*image.height/image.width,layers:[layer()],stencil:{enabled:false,widthMm:2,bridges:[]}};}
export function screenToImage(x,y,view){return {x:(x-view.x)/view.zoom,y:(y-view.y)/view.zoom};}
export function validateProject(p){
 if(!p||p.format!=='airbrush-mask-studio'||![1,2,3].includes(p.version))throw Error('Formato progetto non supportato.');
 if(typeof p.name!=='string'||p.name.length>200)throw Error('Nome progetto non valido.');
 const im=p.image;
 if(!im||!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=\r\n]+$/.test(im.src)||![im.width,im.height].every(n=>Number.isInteger(n)&&n>0)||im.width*im.height>MAX_PIXELS)throw Error('Immagine non valida o troppo grande.');
 if(![p.widthMm,p.heightMm].every(n=>Number.isFinite(n)&&n>0&&n<=10000))throw Error('Dimensioni reali non valide.');
 if(!Array.isArray(p.layers)||!p.layers.length||p.layers.length>100)throw Error('Livelli non validi.');
 const ids=new Set();let count=0;
 for(const l of p.layers){
 if(typeof l.id!=='string'||ids.has(l.id)||typeof l.name!=='string'||l.name.length>200||typeof l.visible!=='boolean'||!/^#[0-9a-f]{6}$/i.test(l.color)||!Array.isArray(l.strokes))throw Error('Livello non valido.');ids.add(l.id);
 if(l.generated){const g=l.generated;if(p.version<2||!Number.isInteger(g.threshold)||g.threshold<0||g.threshold>255||typeof g.invert!=='boolean'||!Number.isInteger(g.detail)||g.detail<0||g.detail>4)throw Error('Generazione non valida.');}
 if(l.regions){const r=l.regions;if(!Number.isInteger(r.tolerance)||r.tolerance<0||r.tolerance>255||typeof r.contiguous!=='boolean'||!Array.isArray(r.seeds)||r.seeds.length>500)throw Error('Selezione regioni non valida.');for(const seed of r.seeds)if(!Number.isInteger(seed.x)||!Number.isInteger(seed.y)||seed.x<0||seed.y<0||seed.x>=im.width||seed.y>=im.height||!['add','subtract','intersect'].includes(seed.operation))throw Error('Punto di selezione non valido.');}
 if(l.bitmap){const b=l.bitmap;if(!Number.isInteger(b.width)||!Number.isInteger(b.height)||b.width<1||b.height<1||b.width*b.height>MAX_PIXELS||!Array.isArray(b.runs)||!b.runs.length||b.runs.length>MAX_PIXELS*2||b.runs.length%2)throw Error('Maschera raster non valida.');let total=0;for(let i=0;i<b.runs.length;i+=2){if(!Number.isInteger(b.runs[i])||b.runs[i]<1||![0,1].includes(b.runs[i+1]))throw Error('Maschera raster non valida.');total+=b.runs[i];}if(total!==b.width*b.height)throw Error('Maschera raster incompleta.');}
 for(const s of l.strokes){if(!['paint','erase'].includes(s.tool)||!Number.isFinite(s.size)||s.size<=0||s.size>10000||!Array.isArray(s.points)||!s.points.length)throw Error('Tratto non valido.');
 for(const pt of s.points){if(!Number.isFinite(pt.x)||!Number.isFinite(pt.y)||Math.abs(pt.x)>100000||Math.abs(pt.y)>100000||++count>2000000)throw Error('Punti non validi o troppi punti.');}}
 }
 if(p.version===3){const s=p.stencil;if(!s||typeof s.enabled!=='boolean'||!Number.isFinite(s.widthMm)||s.widthMm<=0||s.widthMm>100||!Array.isArray(s.bridges)||s.bridges.length>1000)throw Error('Raccordi stencil non validi.');for(const b of s.bridges){if(typeof b.id!=='string'||typeof b.enabled!=='boolean'||typeof b.automatic!=='boolean'||!Number.isFinite(b.widthMm)||b.widthMm<=0||b.widthMm>100||!Array.isArray(b.points)||b.points.length<2||b.points.length>10000)throw Error('Raccordo non valido.');for(const pt of b.points)if(!Number.isFinite(pt.x)||!Number.isFinite(pt.y)||Math.abs(pt.x)>100000||Math.abs(pt.y)>100000)throw Error('Punti raccordo non validi.');}}
 return p;
}
export function serializeProject(p){return JSON.stringify(validateProject(p));}
export function parseProject(text){const p=validateProject(JSON.parse(text));return p.version===3?p:{...p,version:3,stencil:{enabled:false,widthMm:2,bridges:[]}};}
