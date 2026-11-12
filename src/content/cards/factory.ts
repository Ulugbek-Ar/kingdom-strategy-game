import type { Card, FactionId, Effect } from '../../core/types';
import { units } from '../units';
import { BALANCE as B } from '../../config/balance';
export type CardSpec = [string, string, Card['type'], string, Effect[]];
export function makeDeck(faction: FactionId, specs: CardSpec[]): Card[] {
  return specs.map(([slug, name, type, description, effects]) => ({ id: `${faction}-${slug}`, name, type, faction, description, effects, cost: type === 'building' ? B.buildingCost : type === 'tower' ? B.towerCost : type === 'enchantment' ? B.enchantCost : type === 'expand' ? B.expandCost : B.spellCost, icon: type === 'building' ? (effects.some(e => e.kind === 'gainGold') ? 'market' : effects.some(e => e.unit && units[e.unit]?.range > B.meleeRange) ? 'archery' : 'barracks') : type === 'enchantment' ? (effects.some(e => e.stat === 'spawn') ? 'beacon' : 'shrine') : type }));
}
export const spawn = (unit: string): Effect[] => [{ kind: 'spawnUnits', trigger: 'onBattleStart', amount: B.baseSpawn, unit }];
export const buff = (stat: 'damage' | 'hp' | 'spawn'): Effect[] => [{ kind: 'buffAdjacent', trigger: 'onBattleStart', amount: stat === 'spawn' ? 1 : B.adjacency, stat }];
export const tower: Effect[] = [{ kind: 'tower', trigger: 'onBattleStart', amount: B.towerDamage }];
export const treasury: Effect[] = [{ kind: 'gainGold', trigger: 'onYearStart', amount: B.incomeAmount }];
export const heal: Effect[] = [{ kind: 'healCastle', trigger: 'onPlace', amount: B.heal }];
export const blast: Effect[] = [{ kind: 'dealDamage', trigger: 'onPlace', amount: B.spellDamage }];
export const gold: Effect[] = [{ kind: 'gainGold', trigger: 'onPlace', amount: B.rewardGold }];
export const expand: Effect[] = [{ kind: 'expand', trigger: 'onPlace', amount: 1 }, { kind: 'healCastle', trigger: 'onPlace', amount: B.expandingHeal }];
