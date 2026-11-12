import { expect, it } from 'vitest';
import { Game } from '../src/core/game';
import { BALANCE as B } from '../src/config/balance';
import { factions } from '../src/content';
it('requires a player-placed castle and accepts every initial plot',()=>{
  for(let y=-1;y<=1;y++)for(let x=-1;x<=1;x++){
    const g=Game.create('ember',5);g.startBattle();expect(g.battle).toBeUndefined();expect(g.play(0,x,y)).toBeTruthy();expect(g.placeCastle(x,y)).toBeNull();expect(g.run.castle).toEqual({x,y});expect(g.play(0,x,y)).toContain('castle');
  }
});
it('draws five, allows at most three plays, then starts automatically',()=>{
  const g=Game.create('ember',5);g.placeCastle(0,0);g.run.hand=Array(5).fill('ember-guard');
  for(let i=0;i<3;i++)expect(g.play(0,-1,0)).toBeNull();
  expect(g.run.phase).toBe('battle');expect(g.run.hand).toHaveLength(2);expect(g.run.playsThisYear).toBe(3);expect(g.play(0,1,0)).toBeTruthy();
});
it('offers three distinct cards from the defeated king and adds the selected card',()=>{
  const g=Game.create('ember',5);g.placeCastle(0,0);g.run.waveDamage=10000;g.startBattle();g.tick(B.step);
  expect(g.run.rewards).toHaveLength(3);expect(new Set(g.run.rewards.map(r=>r.id)).size).toBe(3);
  expect(g.run.rewards.every(r=>factions[g.run.enemy].deck.includes(r.id))).toBe(true);
  const selected=g.run.rewards[2].id;g.chooseReward(2);expect(g.run.deck.at(-1)).toBe(selected);expect(g.run.hand).toHaveLength(5);expect(g.run.playsThisYear).toBe(0);
});
it('expands one connected plot, rejects gaps and outside the 5 x 5 boundary',()=>{
  const g=Game.create('ember',5);g.placeCastle(0,0);g.run.hand=Array(5).fill('ember-expand');
  expect(g.play(0,2,2)).toBeTruthy();expect(g.play(0,3,0)).toBeTruthy();expect(g.play(0,2,0)).toBeNull();expect(g.run.tiles).toHaveLength(10);expect(g.play(0,2,0)).toBeTruthy();expect(g.run.playsThisYear).toBe(1);
});
