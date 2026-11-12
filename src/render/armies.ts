import type { Battle, Unit } from '../core/types';
import { sprite } from './sprites';
interface Batch { image:HTMLCanvasElement; units:Unit[] }
export class ArmyRenderer {
  private batches=new Map<string,Batch>();
  draw(c:CanvasRenderingContext2D,b:Battle):void {
    for(const batch of this.batches.values())batch.units.length=0;
    c.fillStyle='#314d35';c.beginPath();
    for(const u of b.units){
      if(u.hp<=0||u.born>b.time)continue;
      const frame=u.state==='move'?Math.floor(b.time*8+u.id)%3:u.state==='attack'?1:0,flash=u.flash>0;
      const key=`${u.side}/${u.faction}/${u.sprite}/${frame}/${flash}`;
      let batch=this.batches.get(key);
      if(!batch){batch={image:sprite(u.sprite,u.faction,frame,flash),units:[]};this.batches.set(key,batch);}
      batch.units.push(u);c.rect(Math.round(u.x)-5,Math.round(u.y)+3,10,3);
    }
    c.fill();
    // Draw each cached sprite variant consecutively. All shadows/health bars are batched.
    for(const batch of this.batches.values())for(const u of batch.units){
      const x=Math.round(u.x),y=Math.round(u.y);c.globalAlpha=Math.min(1,(b.time-u.born)*6);
      c.drawImage(batch.image,x-8,y-10);
      if(u.state==='attack'&&u.range<20&&u.cooldown>0.5){c.fillStyle='#f8ecc3';c.fillRect(x+u.facing*7,y-5,1,6);}
    }
    c.globalAlpha=1;c.fillStyle='#283731';c.beginPath();
    for(const u of b.units)if(u.hp>0&&u.hp<u.maxHP&&u.born<=b.time)c.rect(Math.round(u.x)-5,Math.round(u.y)-12,10,2);
    c.fill();
    for(const side of ['ally','enemy'] as const){c.fillStyle=side==='ally'?'#bdcb79':'#e99d7e';c.beginPath();
      for(const u of b.units)if(u.side===side&&u.hp>0&&u.hp<u.maxHP&&u.born<=b.time)c.rect(Math.round(u.x)-5,Math.round(u.y)-12,Math.ceil(10*u.hp/u.maxHP),1);
      c.fill();
    }
  }
}
