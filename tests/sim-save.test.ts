import { describe, expect, it } from 'vitest';
import { createBattle, stepBattle } from '../src/sim/battle';
import { waveFor } from '../src/content/waves';
import { units } from '../src/content/units';
import { Game } from '../src/core/game';
import { BALANCE as B } from '../src/config/balance';
import { initialMeta, migrate, SAVE_VERSION } from '../src/save/migrations';
import { load, recordRun, save } from '../src/save';

describe('headless simulation',()=>{
  function battle(seed:number){const b=createBattle([{definition:units.cinder,count:6,hpBonus:0,damageBonus:0}],[10],waveFor(4),120,seed,0);for(let i=0;i<5000&&!b.done;i++)stepBattle(b,B.step);return b;}
  it('is exactly deterministic, including damage and targeting',()=>{const a=battle(72);expect(a.done).toBe(true);expect(a).toEqual(battle(72));expect(a).not.toEqual(battle(73));});
  it('scales waves and strengthens every fifth year',()=>{expect(waveFor(2).hp).toBeGreaterThan(waveFor(1).hp);expect(waveFor(20).count).toBeGreaterThan(waveFor(1).count);expect(waveFor(5).boss).toBe(true);expect(waveFor(5).hp).toBeGreaterThan(waveFor(6).hp);expect(waveFor(20).boss).toBe(true);});
  it('resolves empty armies and uses the siege timeout',()=>{const b=createBattle([],[],waveFor(1),120,1,10000);stepBattle(b,B.step);expect(b.won).toBe(true);const siege=createBattle([],[],waveFor(1),1,1,0);for(let i=0;i<3000&&!siege.done;i++)stepBattle(siege,B.step);expect(siege.done).toBe(true);expect(siege.won).toBe(false);});
  it('can complete all 20 years with an established upgraded kingdom',()=>{
    const g=Game.create('ember',42);for(const t of g.run.tiles)if(t.x||t.y){t.cardId=t.x===1?'ember-spire':'ember-guard';t.level=3;}
    while(g.run.phase!=='victory'&&g.run.phase!=='defeat'){
      if(g.run.phase==='planning')g.startBattle();
      else if(g.run.phase==='battle')g.tick(B.step);
      else if(g.run.phase==='reward')g.chooseReward(1);
      else if(g.run.phase==='perk')g.choosePerk('steel');
    }
    expect(g.run.phase).toBe('victory');expect(g.run.year).toBe(20);
  });
});
describe('versioned saves and progression',()=>{
  it('migrates v1 without mutating input, and rejects unsupported/corrupt saves',()=>{
    const old={version:1,run:Game.create('ember',1).run,meta:{runs:1,wins:0,bestYear:3,unlockedFactions:['ember']}};
    expect(migrate(old).version).toBe(SAVE_VERSION);expect(migrate(old).meta.unlockedCards).toEqual([]);expect(old.version).toBe(1);
    expect(()=>migrate({...old,version:99})).toThrow('Unsupported');
    expect(()=>migrate({...old,run:{...old.run,tiles:[]}})).toThrow('Invalid run');
    expect(()=>migrate({...old,run:{...old.run,hp:NaN}})).toThrow('Invalid run');
  });
  it('round-trips a run, preserves planning checkpoint during battle, and handles storage denial',()=>{
    let raw:string|null=null;const storage={getItem:()=>raw,setItem:(_key:string,value:string)=>{raw=value;}};
    const g=Game.create('ember',2),meta=initialMeta();expect(save(g.run,meta,storage)).toBe(true);expect(load(storage).run).toEqual(g.run);
    g.startBattle();save(g.run,meta,storage);expect(load(storage).run?.phase).toBe('planning');
    raw='broken';expect(load(storage).run).toBeNull();expect(save(null,meta,{setItem:()=>{throw new Error('quota');}})).toBe(false);
  });
  it('unlocks factions on completed runs and carries captured cards into new runs',()=>{
    const meta=initialMeta(),r=Game.create('ember',1).run;r.phase='defeat';r.deck.push('verdant-guard');recordRun(meta,r);expect(meta.unlockedFactions).toEqual(['ember','verdant']);expect(meta.unlockedCards).toEqual(['verdant-guard']);recordRun(meta,r);expect(meta.unlockedFactions).toContain('tide');expect(Game.create('tide',1,meta.unlockedCards).run.deck).toContain('verdant-guard');
  });
});
