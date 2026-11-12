import { BALANCE as B } from '../config/balance';
import { adjacent, EffectRegistry, tileKey } from './registry';
export function createEffects(): EffectRegistry {
  const registry = new EffectRegistry();
  registry.register('gainGold', (e, c) => { c.run.gold += e.amount * c.level; });
  registry.register('healCastle', (e, c) => { c.run.hp = Math.min(c.run.maxHP, c.run.hp + e.amount * c.level); });
  registry.register('dealDamage', (e, c) => { c.run.waveDamage += e.amount * c.level; });
  registry.register('expand', (_e, c) => {
    if (!c.tile || c.run.tiles.some(t => t.x === c.tile!.x && t.y === c.tile!.y)) return;
    c.run.tiles.push({ ...c.tile }); c.run.size = B.maxSize;
  });
  registry.register('buffAdjacent', (e, c) => {
    if (!c.tile || !c.bonuses || !e.stat) return;
    for (const tile of c.run.tiles.filter(t => t.cardId && adjacent(t, c.tile!))) {
      const key = tileKey(tile), bonus = c.bonuses.get(key) ?? { damage: 0, hp: 0, spawn: 0 };
      bonus[e.stat] += e.amount * c.level; c.bonuses.set(key, bonus);
    }
  });
  registry.register('spawnUnits', (e, c) => { if (c.tile && e.unit) c.spawns?.push({ unit: e.unit, count: B.squadSizes[c.level - 1] * (e.amount / B.baseSpawn), tile: c.tile }); });
  registry.register('tower', (e, c) => { if (c.tile) c.towers?.push({ damage: e.amount * c.level, tile: c.tile }); });
  return registry;
}
