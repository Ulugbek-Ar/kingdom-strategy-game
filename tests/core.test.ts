import { describe, expect, it } from 'vitest';
import { RNG, seedFrom } from '../src/core/rng';
import { EventBus } from '../src/core/events';
import { Game } from '../src/core/game';
import { cards, factions } from '../src/content';
import { createEffects } from '../src/effects';
import { EffectRegistry, tileKey } from '../src/effects/registry';
import type { EffectContext } from '../src/effects/registry';
import type { Trigger } from '../src/core/types';
import { BALANCE as B } from '../src/config/balance';

describe('seeded core',()=>{
  it('reproduces randomness and faction draws',()=>{
    const a=new RNG(seedFrom('oak')),b=new RNG(seedFrom('oak'));
    expect(Array.from({length:100},()=>a.next())).toEqual(Array.from({length:100},()=>b.next()));
    expect(Game.create('ember',24).run).toEqual(Game.create('ember',24).run);
    expect(Game.create('ember',24).run.hand).not.toEqual(Game.create('ember',25).run.hand);
  });
  it('provides unsubscribe and typed events',()=>{const bus=new EventBus<{gold:number}>();let gold=0;const off=bus.on('gold',n=>gold+=n);bus.emit('gold',4);off();bus.emit('gold',9);expect(gold).toBe(4);});
});
describe('content and effect composition',()=>{
  it('contains three original ten-card decks and valid handlers',()=>{
    expect(Object.keys(cards)).toHaveLength(30);
    for(const f of Object.values(factions)){expect(new Set(f.deck).size).toBe(10);for(const id of f.deck){const game=Game.create(f.id,1);for(const e of cards[id].effects)expect(()=>game.effects.execute(e.trigger,{run:game.run,card:cards[id],level:1})).not.toThrow();}}
  });
  it('routes every supported trigger only to its matching effects',()=>{
    const triggers:Trigger[]=['onPlace','onUpgrade','onYearStart','onBattleStart','onUnitSpawn','onUnitDeath','onYearEnd'];
    const registry=new EffectRegistry();let calls=0;registry.register('test',()=>calls++);
    const run=Game.create('ember',1).run;
    for(const trigger of triggers){registry.execute(trigger,{run,level:1,card:{...cards['ember-guard'],effects:[{kind:'test',trigger,amount:1}]}});}
    expect(calls).toBe(7);expect(()=>registry.register('test',()=>{})).toThrow('Duplicate');
    expect(()=>registry.execute('onPlace',{run,level:1,card:{...cards['ember-guard'],effects:[{kind:'missing',trigger:'onPlace',amount:1}]}})).toThrow('Unknown');
  });
  it('buffs cardinal neighbors only and scales by level',()=>{
    const game=Game.create('ember',1),r=game.run,tile=r.tiles.find(t=>t.x===-1&&t.y===0)!;
    tile.cardId='ember-forge';tile.level=2;
    const north=r.tiles.find(t=>t.x===-1&&t.y===-1)!,diagonal=r.tiles.find(t=>t.x===0&&t.y===-1)!;
    north.cardId=diagonal.cardId='ember-guard';north.level=diagonal.level=1;
    const bonuses:NonNullable<EffectContext['bonuses']>=new Map();
    game.trigger('onBattleStart',{bonuses});expect(bonuses.get(tileKey(north))?.damage).toBeCloseTo(0.4);expect(bonuses.has(tileKey(diagonal))).toBe(false);
  });
  it('executes gold, healing, spell and expansion effects',()=>{
    const r=Game.create('ember',2).run,registry=createEffects();r.hp=20;
    registry.execute('onPlace',{run:r,card:cards['ember-heal'],level:1});expect(r.hp).toBe(20+B.heal);
    registry.execute('onPlace',{run:r,card:cards['ember-blast'],level:1});expect(r.waveDamage).toBe(B.spellDamage);
    registry.execute('onPlace',{run:r,card:cards['ember-expand'],tile:{x:2,y:0,cardId:null,level:0},level:1});expect(r.tiles).toHaveLength(10);expect(new Set(r.tiles.map(tileKey)).size).toBe(10);
    const gold=r.gold;registry.execute('onYearStart',{run:r,card:cards['ember-treasury'],level:3});expect(r.gold).toBe(gold+B.incomeAmount*3);
  });
});
describe('card placement and year flow',()=>{
  it('upgrades identical cards to level 3 and rejects illegal moves without spending',()=>{
    const g=Game.create('ember',9);g.placeCastle(0,0);g.run.gold=100;g.run.hand=Array(5).fill('ember-guard');
    expect(g.play(0,0,0)).toBeTruthy();expect(g.run.gold).toBe(100);
    for(let i=0;i<3;i++)expect(g.play(0,-1,0)).toBeNull();
    expect(g.run.tiles.find(t=>t.x===-1&&t.y===0)?.level).toBe(3);
    expect(g.run.phase).toBe('battle');g.run.phase='planning';g.run.playsThisYear=0;expect(g.play(0,-1,0)).toContain('level 3');g.run.hand[0]='ember-spire';expect(g.play(0,-1,0)).toContain('identical');
    g.run.gold=0;expect(g.play(0,1,0)).toContain('gold');
  });
  it('handles battle, rewards, periodic perks, yearly gold and refreshed hands',()=>{
    const g=Game.create('tide',18);g.placeCastle(0,0);g.run.waveDamage=10000;g.startBattle();g.tick(B.step);expect(g.run.phase).toBe('reward');
    const gold=g.run.gold;g.chooseReward(2);expect(g.run.year).toBe(2);expect(g.run.gold).toBe(gold+B.yearlyGold+B.passiveGold);expect(g.run.deck).toContain(g.run.deck.at(-1));expect(g.run.hand).toHaveLength(5);
    g.run.year=3;g.run.waveDamage=10000;g.startBattle();g.tick(B.step);g.chooseReward(0);expect(g.run.phase).toBe('perk');g.choosePerk('walls');expect(g.run.maxHP).toBe(B.castleHP+B.perkHP);expect(g.run.year).toBe(4);
  });
  it('finishes at year 20 and prevents actions during a battle',()=>{const g=Game.create('ember',7);g.placeCastle(0,0);g.run.year=20;g.run.waveDamage=10000;g.startBattle();expect(g.play(0,1,0)).toBeTruthy();g.tick(B.step);expect(g.run.phase).toBe('victory');});
  it('loses an undefended kingdom and emits one finish event',()=>{const g=Game.create('ember',7);g.placeCastle(0,0);g.run.hp=1;let finished=0;g.events.on('finished',()=>finished++);g.startBattle();for(let i=0;i<4000;i++)g.tick(B.step);expect(g.run.phase).toBe('defeat');expect(finished).toBe(1);});
});
