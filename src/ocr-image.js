// Keep preprocessing local. Do not guess or replace recognized digits.
export async function prepareOCRImage(file, quarterTurns=0, enhance=true) {
 const image=await createImageBitmap(file);
 try {
  const turns=((quarterTurns%4)+4)%4;
  const scale=Math.min(1,2600/Math.max(image.width,image.height));
  const width=Math.max(1,Math.round(image.width*scale)),height=Math.max(1,Math.round(image.height*scale));
  const canvas=document.createElement('canvas');
  canvas.width=turns%2?height:width;canvas.height=turns%2?width:height;
  const ctx=canvas.getContext('2d',{willReadFrequently:enhance});
  ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(turns*Math.PI/2);
  ctx.drawImage(image,-width/2,-height/2,width,height);
  if(enhance){
   const pixels=ctx.getImageData(0,0,canvas.width,canvas.height),histogram=new Uint32Array(256);
   for(let i=0;i<pixels.data.length;i+=4){const gray=Math.round(.299*pixels.data[i]+.587*pixels.data[i+1]+.114*pixels.data[i+2]);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=gray;histogram[gray]++;}
   const count=canvas.width*canvas.height;
   let low=0,high=255,sum=0;
   for(let i=0;i<256;i++){sum+=histogram[i];if(sum>=count*.01){low=i;break;}}
   sum=0;for(let i=255;i>=0;i--){sum+=histogram[i];if(sum>=count*.01){high=i;break;}}
   if(high-low>=30)for(let i=0;i<pixels.data.length;i+=4){const gray=Math.max(0,Math.min(255,Math.round((pixels.data[i]-low)*255/(high-low))));pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=gray;}
   ctx.putImageData(pixels,0,0);
  }
  return canvas;
 } finally {image.close();}
}
