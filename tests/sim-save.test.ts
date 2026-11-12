import { describe, expect, it } from 'vitest';
import { createBattle, stepBattle } from '../src/sim/battle';
import { SpatialHash } from '../src/sim/spatial';
import { waveFor } from '../src/content/waves';
import { units } from '../src/content/units';
import { Game } from '../src/core/game';
import { BALANCE as B } from '../src/config/balance';
import { initialMeta, migrate, SAVE_VERSION } from '../src/save/migrations';
import { load, recordRun, save } from '../src/save';
import { tilePosition } from '../src/core/geometry';
import type { Direction, Run } from '../src/core/types';
function fixture(count=12,direction:Direction='E',seed=72){
  return createBattle({army:[{definition:units.cinder,count,hpBonus:0,damageBonus:0,origin:{x:215,y:125}}],towers:[{x:240,y:100,damage:22,cooldown:0,faction:'ember'}],wave:{...waveFor(4),count},castle:{x:240,y:126},castleHP:180,seed,spellDamage:0,direction});
}
function complete(b:ReturnType<typeof fixture>){for(let i=0;i<5000&&!b.done;i++)stepBattle(b,B.step);return b;}
describe('headless simulation',()=>{
  it('is exactly deterministic, including damage, projectiles and targeting',()=>{const a=complete(fixture());expect(a.done).toBe(true);expect(a).toEqual(complete(fixture()));expect(a.rng).not.toBe(complete(fixture(12,'E',73)).rng);});
  it('scales from ten invaders to over 150, with fifth-year bosses',()=>{expect(waveFor(1).count).toBe(10);expect(waveFor(20).count).toBeGreaterThanOrEqual(150);expect(waveFor(5).boss).toBe(true);expect(waveFor(5).hp).toBeGreaterThan(waveFor(6).hp);});
  it.each<Direction>(['N','E','S','W'])('marches from %s toward the placed castle',direction=>{
    const b=fixture(1,direction);b.units[0].hp=0;b.aliveAllies=0;const enemy=b.units[1],before=Math.hypot(enemy.x-b.castle.x,enemy.y-b.castle.y);
    for(let i=0;i<30;i++)stepBattle(b,B.step);
    expect(Math.hypot(enemy.x-b.castle.x,enemy.y-b.castle.y)).toBeLessThan(before);
  });
  it('spawns each squad and tower at its own tile with level sizes 4, 8, 14',()=>{
    for(const level of [1,2,3]){
      const g=Game.create('ember',1);g.placeCastle(1,1);const t=g.run.tiles.find(t=>t.x===-1&&t.y===0)!;t.cardId='ember-guard';t.level=level;
      const tower=g.run.tiles.find(t=>t.x===0&&t.y===-1)!;tower.cardId='ember-spire';tower.level=1;g.startBattle();
      const allies=g.battle!.units.filter(u=>u.side==='ally');expect(allies).toHaveLength(B.squadSizes[level-1]);
      expect(allies[0].x).toBeCloseTo(tilePosition(t).x-4.5);expect(g.battle!.towers[0].x).toBe(tilePosition(tower).x);expect(g.battle!.castle).toEqual(tilePosition({x:1,y:1}));
    }
  });
  it('creates ranged arrows, tower bolts, death puffs and final-kill slow motion',()=>{
    const b=fixture(2);b.units[0].range=B.rangedRange;b.units[2].x=b.units[0].x+40;b.units[3].x=b.units[0].x+45;
    for(let i=0;i<5;i++)stepBattle(b,B.step);expect(b.projectiles.items.some(p=>p.active&&p.kind==='arrow')).toBe(true);expect(b.projectiles.items.some(p=>p.kind==='bolt'&&p.damage>0)).toBe(true);
    let slow=false,death=false;for(let i=0;i<2000&&!b.done;i++){stepBattle(b,B.step);slow||=b.slowMotion>0;death||=b.hits.items.some(h=>h.active&&h.kind==='death');}expect(death).toBe(true);expect(slow).toBe(true);
  });
  it('matches brute-force nearest targeting without sorting',()=>{
    const b=fixture(150);for(let i=0;i<b.units.length;i++){b.units[i].x=(i*31)%480;b.units[i].y=(i*17)%270;b.units[i].born=0;}
    const hash=new SpatialHash();hash.rebuild(b.units,0);
    for(let x=10;x<480;x+=41)for(let y=10;y<270;y+=43){
      let id=-1,d=Infinity;for(const u of b.units)if(u.side==='enemy'){const dist=(u.x-x)**2+(u.y-y)**2;if(dist<d||(dist===d&&u.id<id)){d=dist;id=u.id;}}
      expect(hash.nearest(x,y,'enemy',b.units)).toBe(id);
    }
  });
  it('resolves an undefended siege',()=>{const b=fixture(0);b.units=[];stepBattle(b,B.step);expect(b.won).toBe(true);const g=Game.create('ember',7);g.placeCastle(-1,1);g.run.hp=1;g.startBattle();complete(g.battle!);expect(g.battle!.won).toBe(false);});
  it('runs a complete 300-unit battle under 100 ms',()=>{
    // Warm the same code paths before measuring; creation + full fixed-step battle is timed.
    complete(fixture(150));const start=performance.now(),b=complete(fixture(150));const elapsed=performance.now()-start;
    console.log(`300-unit full battle: ${elapsed.toFixed(2)} ms; ${b.time.toFixed(2)} simulated seconds`);
    expect(b.done).toBe(true);expect(b.units).toHaveLength(300);expect(elapsed).toBeLessThan(100);
  });
  it('supports more than 400 units and reuses bounded pool slots',()=>{
    const b=fixture(220),hitItems=b.hits.items,projectileItems=b.projectiles.items;for(let i=0;i<120;i++)stepBattle(b,B.step);
    expect(b.units).toHaveLength(440);expect(b.hits.items).toBe(hitItems);expect(b.projectiles.items).toBe(projectileItems);expect(b.hits.items).toHaveLength(B.hitCapacity);
  });
  it('can finish 20 years with a developed kingdom',()=>{
    const g=Game.create('ember',42);g.placeCastle(0,0);g.run.size=5;
    for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++){if(!g.run.tiles.some(t=>t.x===x&&t.y===y))g.run.tiles.push({x,y,cardId:null,level:0});}
    for(const t of g.run.tiles)if(t.x||t.y){t.cardId=t.x===2?'ember-spire':'ember-guard';t.level=3;}
    for(let i=0;i<100000&&g.run.phase!=='victory'&&g.run.phase!=='defeat';i++){
      if(g.run.phase==='planning')g.startBattle();else if(g.run.phase==='battle')g.tick(B.step);else if(g.run.phase==='reward')g.chooseReward(1);else if(g.run.phase==='perk')g.choosePerk('steel');
    }
    expect(g.run.phase).toBe('victory');expect(g.run.year).toBe(20);
  });
});
function legacyRun():Omit<Run,'castle'|'playsThisYear'|'direction'> {
  const {castle:_castle,playsThisYear:_plays,direction:_direction,...r}=Game.create('ember',2).run;return {...r,phase:'planning'};
}
describe('v3 saves and progression',()=>{
  it('migrates v1 and v2 without changing decks, random state, placed tiles or meta',()=>{
    const run=legacyRun();run.tiles[0].cardId='ember-guard';run.tiles[0].level=2;
    const meta={...initialMeta(),runs:3,unlockedCards:['verdant-guard']};
    const old={version:2,run,meta},result=migrate(old);
    expect(result.version).toBe(SAVE_VERSION);expect(result.run?.castle).toEqual({x:0,y:0});expect(result.run?.direction).toBe('S');expect(result.run?.playsThisYear).toBe(0);expect(result.run?.rng).toBe(run.rng);expect(result.run?.tiles).toEqual(run.tiles);expect(result.meta).toEqual(meta);expect(old.version).toBe(2);expect(migrate({version:1,run,meta:initialMeta()}).version).toBe(3);
  });
  it('converts old mixed rewards to three usable enemy cards',()=>{const run={...legacyRun(),phase:'reward',rewards:[{kind:'gold',id:'gold',label:'9 gold'}]};const r=migrate({version:2,run,meta:initialMeta()}).run!;expect(r.rewards).toHaveLength(3);expect(r.rewards.every(w=>w.kind==='card'&&w.id.startsWith(r.enemy))).toBe(true);});
  it('rejects future versions and malformed castle, plays, tiles and HP',()=>{
    const old={version:3,run:Game.create('ember',1).run,meta:initialMeta()};
    expect(()=>migrate({...old,version:99})).toThrow('Unsupported');
    for(const update of [{tiles:[]},{hp:NaN},{castle:{x:9,y:9},phase:'planning'},{playsThisYear:4},{direction:'UP'}])expect(()=>migrate({...old,run:{...old.run,...update}})).toThrow('Invalid run');
  });
  it('round-trips castle placement and added plots, and preserves planning during battles',()=>{
    let raw:string|null=null;const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}};
    const g=Game.create('ember',2),meta=initialMeta();save(g.run,meta,storage);expect(load(storage).run?.phase).toBe('castle');g.placeCastle(1,1);g.run.hand=['ember-expand'];g.play(0,2,0);
    expect(save(g.run,meta,storage)).toBe(true);expect(load(storage).run).toEqual(g.run);g.startBattle();save(g.run,meta,storage);expect(load(storage).run?.phase).toBe('planning');
    raw='broken';expect(load(storage).run).toBeNull();expect(save(null,meta,{setItem:()=>{throw new Error('quota');}})).toBe(false);
  });
  it('preserves faction and card unlock behavior',()=>{const meta=initialMeta(),r=Game.create('ember',1).run;r.phase='defeat';r.deck.push('verdant-guard');recordRun(meta,r);expect(meta.unlockedFactions).toContain('verdant');expect(meta.unlockedCards).toContain('verdant-guard');recordRun(meta,r);expect(meta.unlockedFactions).toContain('tide');});
});
