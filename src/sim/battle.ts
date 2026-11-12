import { BALANCE as B } from '../config/balance';
import type { Battle, Direction, FactionId, Point, Tower } from '../core/types';
import { RNG } from '../core/rng';
import { acquire, makePool } from './pool';
import { SpatialHash } from './spatial';
import { enemyPosition, UnitPool, type Army } from './units';
export type { Army } from './units';
export interface BattleSetup { army:Army[]; towers:Tower[]; wave:{count:number;hp:number;damage:number;faction:FactionId;sprite:string}; castle:Point; castleHP:number; seed:number; spellDamage:number; direction:Direction; pool?:UnitPool }
export interface Simulation extends Battle { spatial:SpatialHash }
export function createBattle(input:BattleSetup):Simulation {
  const {army,wave,castle,castleHP,seed,spellDamage,direction}=input,pool=input.pool??new UnitPool();pool.reset();
  const units:Battle['units']=[];
  for(const group of army)for(let i=0;i<group.count && units.length<B.poolCapacity-wave.count;i++) {
    const d=group.definition,hp=d.hp*(1+group.hpBonus);
    units.push(pool.take('ally',d.faction,d.icon,group.origin.x+(i%4-1.5)*3,group.origin.y+(Math.floor(i/4)-1)*3,hp,d.damage*(1+group.damageBonus),d.range,d.speed,i*B.spawnDelay));
  }
  const allyCount=units.length;
  for(let i=0;i<wave.count && units.length<B.poolCapacity;i++){
    const p=enemyPosition(i,direction);
    units.push(pool.take('enemy',wave.faction,i===0?'king':i%5===0?'archer':wave.sprite,p.x,p.y,Math.max(0,wave.hp-spellDamage),wave.damage,i%5===0?B.rangedRange:B.meleeRange,B.unitSpeed,0));
  }
  const killed=spellDamage>=wave.hp?units.length-allyCount:0;
  return {units,towers:input.towers,time:0,castle,castleHP,done:false,won:false,kills:killed,deaths:killed,rng:seed,spatial:new SpatialHash(),serial:0,shake:0,slowMotion:0,aliveAllies:allyCount,aliveEnemies:units.length-allyCount-killed,
    hits:makePool(B.hitCapacity,()=>({active:false,x:0,y:0,damage:0,life:0,kind:'hit',serial:0})),
    projectiles:makePool(B.projectileCapacity,()=>({active:false,x:0,y:0,fromX:0,fromY:0,target:0,damage:0,speed:0,kind:'arrow',life:0}))};
}
export function stepBattle(b:Simulation,dt:number):void {
  if(b.done)return;
  const realDt=dt;
  if(b.slowMotion>0){b.slowMotion=Math.max(0,b.slowMotion-dt);dt*=B.finalKillFactor;}
  b.time+=dt;b.shake=Math.max(0,b.shake-realDt*10);
  const rng=new RNG(b.rng);
  const feedback=(x:number,y:number,damage:number,kind:'hit'|'death'|'tower'):void=>{
    const h=acquire(b.hits);h.x=x;h.y=y;h.damage=damage;h.kind=kind;h.life=B.hitLife;h.serial=++b.serial;
  };
  const hit=(id:number,damage:number):void=>{
    const u=b.units[id];if(!u||u.hp<=0)return;
    const amount=damage*(rng.next()<B.critChance?B.critMultiplier:1);
    u.hp=Math.max(0,u.hp-amount);u.flash=B.flashLife;
    feedback(u.x,u.y,Math.round(amount),'hit');
    if(amount>=B.bigHit)b.shake=Math.max(b.shake,1.2);
    if(u.hp===0){u.state='die';u.deathAt=b.time;b.deaths++;feedback(u.x,u.y,0,'death');
      if(u.side==='enemy'){b.kills++;b.aliveEnemies--;if(b.aliveEnemies===0)b.slowMotion=B.finalKillSlow;}
      else b.aliveAllies--;
    }
  };
  const shoot=(x:number,y:number,target:number,damage:number,kind:'arrow'|'bolt'):void=>{
    const p=acquire(b.projectiles);Object.assign(p,{x,y,fromX:x,fromY:y,target,damage,kind,speed:B.projectileSpeed,life:B.projectileLife});
    if(kind==='bolt'){b.shake=Math.max(b.shake,0.8);feedback(x,y,0,'tower');}
  };
  for(const h of b.hits.items)if(h.active){h.life-=realDt;if(h.life<=0)h.active=false;}
  b.spatial.rebuild(b.units,b.time);
  for(const tower of b.towers){
    tower.cooldown-=dt;if(tower.cooldown>0)continue;
    const id=b.spatial.nearest(tower.x,tower.y,'enemy',b.units,B.towerRange);
    if(id>=0){shoot(tower.x,tower.y-5,id,tower.damage,'bolt');tower.cooldown=B.towerInterval;}
  }
  for(const u of b.units){
    if(u.hp<=0||u.born>b.time)continue;
    u.cooldown-=dt;u.flash=Math.max(0,u.flash-realDt);u.retarget-=dt;
    if(u.target<0||b.units[u.target].hp<=0){
      if(u.retarget<=0){u.target=b.spatial.nearest(u.x,u.y,u.side==='ally'?'enemy':'ally',b.units);u.retarget=B.retargetInterval;}
    }
    const target=u.target>=0?b.units[u.target]:undefined;
    const tx=target&&target.hp>0?target.x:b.castle.x,ty=target&&target.hp>0?target.y:b.castle.y;
    if((!target||target.hp<=0)&&u.side==='ally'){u.state='move';continue;}
    const dx=tx-u.x,dy=ty-u.y,d2=dx*dx+dy*dy,range=target?u.range:B.meleeRange;
    u.facing=dx<0?-1:1;
    if(d2<=range*range){
      u.state='attack';if(u.cooldown<=0){
        if(target&&target.hp>0){if(u.range>B.meleeRange)shoot(u.x,u.y-3,target.id,u.damage,'arrow');else hit(target.id,u.damage);}
        else {b.castleHP=Math.max(0,b.castleHP-u.damage);b.shake=1;feedback(b.castle.x,b.castle.y,Math.round(u.damage),'hit');}
        u.cooldown=B.attackInterval;
      }
    }else{
      u.state='move';const distance=Math.sqrt(d2),travel=Math.min(u.speed*dt,distance-range*0.8);
      u.x+=dx/distance*travel;u.y+=dy/distance*travel;
      // Deterministic lane offsets prevent the whole squad occupying one pixel.
      if(distance>range*2){u.x+=((u.id%3)-1)*dt*2;u.y+=((u.id%5)-2)*dt;}
    }
  }
  for(const p of b.projectiles.items){
    if(!p.active)continue;const target=b.units[p.target];p.life-=dt;
    if(!target||target.hp<=0||p.life<=0){p.active=false;continue;}
    const dx=target.x-p.x,dy=target.y-p.y,distance=Math.hypot(dx,dy),travel=p.speed*dt;
    if(distance<=travel+2){hit(target.id,p.damage);p.active=false;}else{p.x+=dx/distance*travel;p.y+=dy/distance*travel;}
  }
  b.rng=rng.state;
  if(b.castleHP<=0 || (b.aliveEnemies===0 && b.slowMotion<=0) || b.time>=B.battleLimit){
    if(b.aliveEnemies>0 && b.time>=B.battleLimit)for(const u of b.units)if(u.side==='enemy'&&u.hp>0)b.castleHP=Math.max(0,b.castleHP-u.damage);
    b.done=true;b.won=b.castleHP>0;
  }
}
