function validate(data,width,height,config){
 if(data.length!==width*height*4||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1)throw Error('Immagine di selezione non valida.');
 if(!config||!Number.isInteger(config.tolerance)||config.tolerance<0||config.tolerance>255||typeof config.contiguous!=='boolean'||!Array.isArray(config.seeds)||config.seeds.length>500)throw Error('Parametri di selezione non validi.');
 for(const seed of config.seeds)if(!Number.isInteger(seed.x)||!Number.isInteger(seed.y)||seed.x<0||seed.y<0||seed.x>=width||seed.y>=height||!['add','subtract','intersect'].includes(seed.operation))throw Error('Punto di selezione non valido.');
}

function candidate(data,width,height,seed,tolerance,contiguous){
 const out=new Uint8Array(width*height),origin=(seed.y*width+seed.x)*4,limit=tolerance*tolerance*3;
 const matches=i=>{const j=i*4;if(!data[j+3])return false;const dr=data[j]-data[origin],dg=data[j+1]-data[origin+1],db=data[j+2]-data[origin+2];return dr*dr+dg*dg+db*db<=limit;};
 if(!contiguous){for(let i=0;i<out.length;i++)if(matches(i))out[i]=1;return out;}
 const start=seed.y*width+seed.x;if(!matches(start))return out;const queue=[start];out[start]=1;
 for(let head=0;head<queue.length;head++){const i=queue[head],x=i%width,y=Math.floor(i/width);for(const n of [i-1,i+1,i-width,i+width]){const nx=n%width,ny=Math.floor(n/width);if(n>=0&&n<out.length&&!out[n]&&Math.abs(nx-x)+Math.abs(ny-y)===1&&matches(n)){out[n]=1;queue.push(n);}}}
 return out;
}

export function selectRegions(data,width,height,config){
 validate(data,width,height,config);const selected=new Uint8ClampedArray(width*height);
 config.seeds.forEach((seed,index)=>{const next=candidate(data,width,height,seed,config.tolerance,config.contiguous);if(seed.operation==='intersect'&&index===0)for(let i=0;i<selected.length;i++)selected[i]=next[i]?data[i*4+3]:0;else for(let i=0;i<selected.length;i++){if(seed.operation==='add'&&next[i])selected[i]=data[i*4+3];else if(seed.operation==='subtract'&&next[i])selected[i]=0;else if(seed.operation==='intersect'&&!next[i])selected[i]=0;}});
 return selected;
}
