// Pure image processing. Alpha is composited on white before measuring brightness.
export function generateMask(data,width,height,{threshold=128,invert=false,detail=0}={}){
 if(data.length!==width*height*4||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||!Number.isInteger(threshold)||threshold<0||threshold>255||typeof invert!=='boolean'||!Number.isInteger(detail)||detail<0||detail>4)throw Error('Parametri generazione non validi.');
 const gray=new Uint8Array(width*height),temp=new Uint8Array(width*height),alpha=new Uint8ClampedArray(width*height);
 for(let i=0;i<gray.length;i++){const j=i*4,a=data[j+3]/255;gray[i]=Math.round((.2126*data[j]+.7152*data[j+1]+.0722*data[j+2])*a+255*(1-a));}
 if(detail){
 const r=detail,n=r*2+1;
 for(let y=0;y<height;y++){let sum=0;for(let k=-r;k<=r;k++)sum+=gray[y*width+Math.max(0,Math.min(width-1,k))];for(let x=0;x<width;x++){temp[y*width+x]=Math.round(sum/n);sum+=gray[y*width+Math.min(width-1,x+r+1)]-gray[y*width+Math.max(0,x-r)];}}
 for(let x=0;x<width;x++){let sum=0;for(let k=-r;k<=r;k++)sum+=temp[Math.max(0,Math.min(height-1,k))*width+x];for(let y=0;y<height;y++){gray[y*width+x]=Math.round(sum/n);sum+=temp[Math.min(height-1,y+r+1)*width+x]-temp[Math.max(0,y-r)*width+x];}}
 }
 for(let i=0;i<alpha.length;i++){const selected=invert?gray[i]>threshold:gray[i]<=threshold;alpha[i]=selected?data[i*4+3]:0;}
 return alpha;
}
