import { RNG } from '../core/rng';
export function terrain(seed:number,width=480,height=270):HTMLCanvasElement {
  const c=document.createElement('canvas');c.width=width;c.height=height;const ctx=c.getContext('2d')!,rng=new RNG(seed^0x93ad5);
  ctx.fillStyle='#58764b';ctx.fillRect(0,0,width,height);const cx=width/2,cy=height/2-9;
  const colors=['#5d7b4f','#608051','#527249','#638151'];
  for(let y=0;y<height;y+=8)for(let x=0;x<width;x+=8){ctx.fillStyle=colors[Math.floor(rng.next()*colors.length)];ctx.fillRect(x,y,8,8);}
  // The crossing dirt road anchors the grid in a continuous battlefield.
  for(let i=0;i<width;i+=3){const y=cy+1+Math.floor(Math.sin(i*0.04)*3);ctx.fillStyle=i%2?'#8f8a5c':'#989162';ctx.fillRect(i,y-5,3,13);ctx.fillStyle='#a49b6b';ctx.fillRect(i,y+1,2,1);}
  for(let y=0;y<height;y+=3){ctx.fillStyle=y%2?'#8f8a5c':'#989162';ctx.fillRect(cx-4+Math.floor(Math.sin(y*0.08)*2),y,8,3);}
  for(let i=0;i<Math.ceil(width*height/81);i++){const x=Math.floor(rng.next()*width),y=Math.floor(rng.next()*height);ctx.fillStyle=rng.next()<0.5?'#718d59':'#42653e';ctx.fillRect(x,y,2,1);if(i%7===0)ctx.fillRect(x+1,y-1,1,2);if(i%39===0){ctx.fillStyle='#c7bd7a';ctx.fillRect(x,y,1,1);}}
  for(let i=0;i<Math.ceil(width*height/1296);i++){
    const x=Math.floor(rng.next()*width),y=Math.floor(rng.next()*height);
    if((x>cx-177&&x<cx+177&&y>cy-93&&y<cy+100)||Math.abs(x-cx)<22||Math.abs(y-cy)<23)continue;
    if(i%4===0)rock(ctx,x,y);else tree(ctx,x,y,i%3);
  }
  return c;
}
function rock(c:CanvasRenderingContext2D,x:number,y:number):void {
  c.fillStyle='#3c5940';c.fillRect(x-6,y+3,13,3);c.fillStyle='#626e60';c.fillRect(x-5,y-3,10,8);c.fillRect(x-3,y-5,6,2);c.fillStyle='#9a9d80';c.fillRect(x-3,y-4,5,2);c.fillStyle='#424f48';c.fillRect(x+2,y-2,3,7);
}
function tree(c:CanvasRenderingContext2D,x:number,y:number,type:number):void {
  c.fillStyle='#3c5b3e';c.fillRect(x-11,y+2,22,6);c.fillStyle='#5d5039';c.fillRect(x-2,y-6,4,11);
  for(let layer=0;layer<3;layer++){
    const size=9-layer*2,cy=y-8-layer*5;c.fillStyle=type===0?'#294d3d':'#355b3f';c.fillRect(x-size,cy-4,size*2,7);c.fillRect(x-size+3,cy-7,size*2-6,3);
    c.fillStyle=type===0?'#3c6b48':'#4a7249';c.fillRect(x-size+2,cy-4,size-1,2);c.fillRect(x-2,cy-7,3,2);
  }
}
