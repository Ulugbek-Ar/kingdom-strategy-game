import type { FactionId } from '../core/types';
export const palettes = {
  ember:{dark:'#513d43',cloth:'#b75b43',light:'#efaf69',metal:'#c1bfa4',skin:'#e6bb90',flag:'#ea9051'},
  verdant:{dark:'#304849',cloth:'#58866a',light:'#b1c783',metal:'#9faf96',skin:'#e1bc8e',flag:'#9dc16d'},
  tide:{dark:'#3b425e',cloth:'#568692',light:'#a8d6ce',metal:'#bdcbd0',skin:'#debc9d',flag:'#77bec5'},
} as const;
const cache=new Map<string,HTMLCanvasElement>();
const unitKinds=['soldier','archer','guardian','spirit','sentinel','mage','king'];
export function sprite(kind:string,faction:FactionId,frame=0,flash=false):HTMLCanvasElement {
  const key=`${kind}:${faction}:${frame}:${flash}`;
  const found=cache.get(key);if(found)return found;
  const unit=unitKinds.includes(kind),size=unit?16:24,c=document.createElement('canvas');c.width=c.height=size;
  const ctx=c.getContext('2d')!;ctx.imageSmoothingEnabled=false;const p=palettes[faction],ink='#222f31';
  const r=(x:number,y:number,w:number,h:number,color:string):void=>{ctx.fillStyle=color;ctx.fillRect(x,y,w,h);};
  if(unit){
    const bob=frame===1?1:0,step=frame===1?1:frame===2?-1:0;
    r(4,13,8,2,'#213a2b');r(5,11,2,3+step,ink);r(9,11,2,3-step,ink);
    r(4,6+bob,8,6,ink);r(5,7+bob,6,5,p.cloth);r(5,3+bob,6,5,ink);r(6,4+bob,4,3,p.skin);
    r(5,2+bob,6,3,p.metal);r(4,4+bob,2,2,p.dark);r(9,5+bob,1,1,ink);
    r(6,8+bob,2,1,p.light);r(3,8+bob,2,4,p.metal);
    if(kind==='archer'||kind==='mage'){
      r(11,4+bob,1,8,p.light);r(12,5+bob,1,6,ink);r(10,6+bob,3,1,p.light);
      if(kind==='mage'){r(4,1,8,2,p.cloth);r(6,0,4,2,p.light);r(11,3,2,2,'#e2f0cf');}
    }else{r(12,3+bob,1,8,p.metal);r(11,8+bob,3,1,p.light);r(2,7+bob,3,5,p.cloth);r(2,7+bob,1,5,p.light);}
    if(kind==='guardian'){r(4,1,1,4,p.light);r(10,1,1,4,p.light);r(2,8,4,5,p.dark);r(3,9,2,2,p.light);}
    if(kind==='spirit'){r(5,0,2,3,p.light);r(10,1,2,3,p.light);r(6,5,1,1,'#eff6ca');r(9,5,1,1,'#eff6ca');}
    if(kind==='sentinel'){r(5,1,6,2,p.light);r(6,2,4,2,p.dark);r(4,8,2,5,p.metal);}
    if(kind==='king'){r(4,0,2,4,'#eaca78');r(7,1,2,3,'#f8e4a0');r(10,0,2,4,'#eaca78');r(3,7,2,7,p.cloth);r(11,7,2,7,p.cloth);}
  }else{
    r(2,20,20,3,'#263a2b');
    if(kind==='castle'){
      r(2,7,20,14,ink);r(4,8,16,12,'#bcb7a1');r(6,10,12,9,'#d4c9a9');
      for(const x of [1,16]){r(x,4,7,17,p.dark);r(x+1,5,5,15,p.metal);r(x,3,2,3,p.light);r(x+5,3,2,3,p.light);r(x+3,8,1,3,ink);}
      r(9,14,6,7,ink);r(10,15,4,6,p.dark);r(11,1,1,9,ink);r(12,1,6,4,p.flag);r(12,1,4,1,p.light);
    }else if(kind==='tower'){
      r(6,4,12,17,ink);r(7,5,10,15,p.metal);r(8,6,3,14,'#d0ccb0');r(13,7,3,13,p.dark);
      r(4,3,16,5,ink);r(5,4,14,3,p.cloth);for(let x=4;x<20;x+=5)r(x,1,3,4,p.light);
      r(10,10,3,4,ink);r(10,17,3,4,ink);r(3,21,18,1,p.dark);
    }else if(kind==='shrine'||kind==='beacon'){
      r(4,18,16,3,p.dark);r(6,15,12,3,p.metal);r(9,8,6,9,p.dark);r(10,7,4,9,p.light);
      if(kind==='shrine'){r(10,2,4,2,p.light);r(8,4,8,6,p.dark);r(10,4,4,7,p.flag);r(11,4,2,5,'#e5efb9');}
      else{r(11,1,2,15,ink);r(13,2,8,7,p.cloth);r(13,2,7,2,p.light);r(13,5,5,1,p.light);}
      r(3,20,18,2,'#9c9e7a');
    }else if(kind==='spell'){
      r(6,3,12,17,ink);r(7,4,10,15,'#d9ca98');r(9,6,6,1,p.cloth);r(10,8,4,6,p.cloth);r(8,10,8,2,p.light);r(9,16,6,1,p.dark);
    }else if(kind==='expand'){
      r(3,7,18,14,ink);r(4,8,16,11,'#9baf6c');r(5,10,14,1,'#bec77f');r(11,11,2,7,p.light);r(8,13,8,2,p.light);r(5,5,2,6,p.dark);r(5,4,10,3,p.cloth);
    }else{
      r(3,9,18,12,ink);r(4,10,16,10,'#c0af83');r(5,10,3,10,'#d5c297');r(17,10,2,10,p.dark);
      for(let y=3;y<=8;y++)r(12-y,y,2*y+1,2,y%2?p.dark:p.cloth);
      r(10,14,5,7,ink);r(5,12,3,3,p.dark);r(16,12,3,3,p.dark);r(1,20,22,1,p.dark);
      if(kind==='archery'){r(18,10,3,10,p.light);r(19,11,1,7,ink);r(18,13,4,1,p.dark);}
      if(kind==='market'){r(3,9,18,4,p.cloth);for(let x=4;x<20;x+=4)r(x,9,2,4,p.light);r(5,17,3,3,'#d1b66f');r(16,17,4,3,'#9b784e');}
      if(kind==='barracks'){r(2,4,1,7,ink);r(3,4,4,3,p.flag);r(20,17,2,5,p.metal);}
    }
  }
  if(flash){ctx.globalCompositeOperation='source-atop';ctx.fillStyle='#fffbe1';ctx.fillRect(0,0,size,size);}
  cache.set(key,c);return c;
}
export function spriteURL(kind:string,faction:FactionId):string { return sprite(kind,faction).toDataURL(); }
export function banner(ctx:CanvasRenderingContext2D,faction:FactionId,x:number,y:number):void {
  const p=palettes[faction];ctx.fillStyle='#293130';ctx.fillRect(x,y,1,21);ctx.fillStyle=p.dark;ctx.fillRect(x+1,y,13,15);ctx.fillStyle=p.flag;ctx.fillRect(x+2,y+1,11,12);
  ctx.fillStyle=p.light;
  if(faction==='ember'){ctx.fillRect(x+6,y+3,3,7);ctx.fillRect(x+4,y+5,7,3);}
  else if(faction==='verdant'){ctx.fillRect(x+7,y+2,2,9);ctx.fillRect(x+4,y+4,7,2);ctx.fillRect(x+5,y+7,5,2);}
  else{ctx.fillRect(x+7,y+2,2,9);ctx.fillRect(x+4,y+5,8,3);ctx.fillStyle=p.dark;ctx.fillRect(x+7,y+5,2,3);}
}
