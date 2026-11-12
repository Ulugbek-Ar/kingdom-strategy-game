import { BALANCE as B } from '../config/balance';
import type { Battle, Unit, UnitDefinition } from '../core/types';
import { RNG } from '../core/rng';
export interface Army { definition: UnitDefinition; count: number; hpBonus: number; damageBonus: number }
export function createBattle(army: Army[], towers: number[], wave: { count: number; hp: number; damage: number }, castleHP: number, seed: number, spellDamage: number): Battle {
  const units: Unit[] = []; let id = 0;
  for (const group of army) for (let i = 0; i < group.count; i++) {
    const d = group.definition, hp = d.hp * (1 + group.hpBonus);
    units.push({ id: id++, side:'ally', x:B.spawnX + (i % 3) * B.formationGap, y:45 + (id % 8) * B.formationGap, hp, maxHP:hp, damage:d.damage * (1 + group.damageBonus), range:d.range, speed:d.speed, cooldown:0, flash:0, icon:d.icon });
  }
  for (let i = 0; i < wave.count; i++) units.push({ id:id++, side:'enemy', x:B.enemyX + (i % 3) * B.formationGap, y:45 + (i % 8) * B.formationGap, hp:Math.max(0, wave.hp - spellDamage), maxHP:wave.hp, damage:wave.damage, range:B.meleeRange, speed:B.unitSpeed, cooldown:0, flash:0, icon:'♟' });
  return { units, towers:towers.map(damage => ({ damage, cooldown:0 })), time:0, castleHP, done:false, won:false, kills:units.filter(u => u.side === 'enemy' && u.hp <= 0).length, rng:seed, hits:[] };
}
export function stepBattle(battle: Battle, dt: number): void {
  if (battle.done) return;
  const rng = new RNG(battle.rng); battle.time += dt;
  battle.hits = battle.hits.filter(h => (h.life -= dt) > 0);
  const hit = (target: Unit, damage: number): void => {
    const amount = damage * (rng.next() < B.critChance ? B.critMultiplier : 1);
    const alive = target.hp > 0; target.hp = Math.max(0, target.hp - amount); target.flash = 0.15;
    battle.hits.push({ x:target.x, y:target.y, damage:Math.round(amount), life:0.7 });
    if (alive && target.hp === 0 && target.side === 'enemy') battle.kills++;
  };
  for (const tower of battle.towers) {
    tower.cooldown -= dt;
    const target = battle.units.filter(u => u.side === 'enemy' && u.hp > 0 && u.x < B.towerRange).sort((a,b) => a.x - b.x)[0];
    if (target && tower.cooldown <= 0) { hit(target, tower.damage); tower.cooldown = B.towerInterval; }
  }
  for (const unit of battle.units) {
    if (unit.hp <= 0) continue;
    unit.cooldown -= dt; unit.flash = Math.max(0, unit.flash - dt);
    const target = battle.units.filter(u => u.side !== unit.side && u.hp > 0).sort((a,b) => Math.hypot(a.x-unit.x,a.y-unit.y) - Math.hypot(b.x-unit.x,b.y-unit.y))[0];
    if (target) {
      const distance = Math.hypot(target.x-unit.x,target.y-unit.y);
      if (distance <= unit.range) { if (unit.cooldown <= 0) { hit(target, unit.damage); unit.cooldown = B.attackInterval; } }
      else { unit.x += (target.x-unit.x) / distance * unit.speed * dt; unit.y += (target.y-unit.y) / distance * unit.speed * dt; }
    } else if (unit.side === 'enemy') {
      if (unit.x > B.castleX + B.meleeRange) unit.x -= unit.speed * dt;
      else if (unit.cooldown <= 0) { battle.castleHP = Math.max(0, battle.castleHP - unit.damage); unit.cooldown = B.attackInterval; }
    }
  }
  battle.rng = rng.state;
  const enemiesAlive = battle.units.some(u => u.side === 'enemy' && u.hp > 0);
  if (!enemiesAlive || battle.castleHP <= 0 || battle.time >= B.battleLimit) {
    // A time limit resolves remaining invaders as a siege, preventing softlocks.
    if (enemiesAlive && battle.time >= B.battleLimit) battle.castleHP = Math.max(0, battle.castleHP - battle.units.filter(u => u.side === 'enemy' && u.hp > 0).reduce((sum,u) => sum + u.damage, 0));
    battle.done = true; battle.won = battle.castleHP > 0;
  }
}
