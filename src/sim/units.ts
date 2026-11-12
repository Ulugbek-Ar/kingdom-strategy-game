import { BALANCE as B } from '../config/balance';
import type { Direction, FactionId, Point, Unit, UnitDefinition } from '../core/types';
export interface Army { definition: UnitDefinition; count: number; hpBonus: number; damageBonus: number; origin: Point }
export class UnitPool {
  private items: Unit[]=[];
  private cursor=0;
  reset():void { this.cursor=0; }
  take(side:Unit['side'],faction:FactionId,sprite:string,x:number,y:number,hp:number,damage:number,range:number,speed:number,born:number):Unit {
    const id=this.cursor++;
    const u=this.items[id] ?? (this.items[id]={} as Unit);
    Object.assign(u,{id,side,faction,sprite,x,y,hp,maxHP:hp,damage,range,speed,cooldown:(id%5)*0.03,flash:0,state:hp>0?'move':'die',target:-1,retarget:0,born,facing:side==='ally'?1:-1,deathAt:hp>0?-1:0});
    return u;
  }
}
export function enemyPosition(i:number,direction:Direction):Point {
  const across=(i%B.formationColumns-(B.formationColumns-1)/2)*B.formationGap,depth=Math.floor(i/B.formationColumns)*B.formationGap;
  switch(direction){
    case 'N':return {x:B.centerX+across,y:B.worldTop-depth};
    case 'S':return {x:B.centerX+across,y:B.worldBottom+depth};
    case 'W':return {x:B.worldLeft-depth,y:B.centerY+across};
    case 'E':return {x:B.worldRight+depth,y:B.centerY+across};
  }
}
