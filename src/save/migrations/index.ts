import type { Meta, Run } from '../../core/types';
import { BALANCE as B } from '../../config/balance';
import { cards, factions } from '../../content';
export const SAVE_VERSION = 3;
export interface SaveData { version: number; run: Run | null; meta: Meta }
export function initialMeta(): Meta { return { runs:0,wins:0,bestYear:0,unlockedFactions:['ember'],unlockedCards:[] }; }
const object = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(x => typeof x === 'string');
function isRun(v: unknown): v is Run {
  if (!object(v) || !finite(v.year) || v.year < 1 || v.year > 20 || !Number.isInteger(v.year) || !finite(v.hp) || !finite(v.maxHP) || v.maxHP <= 0 || v.hp < 0 || v.hp > v.maxHP || !finite(v.gold) || v.gold < 0) return false;
  for (const key of ['seed','rng','kills','cardsPlayed','waveDamage']) if (!finite(v[key])) return false;
  if (typeof v.faction !== 'string' || !(v.faction in factions) || typeof v.enemy !== 'string' || !(v.enemy in factions)) return false;
  if (!['castle','planning','reward','perk','victory','defeat'].includes(String(v.phase)) || ![3,5].includes(Number(v.size))) return false;
  if (!strings(v.deck) || !strings(v.hand) || ![...v.deck,...v.hand].every(id => id in cards) || v.deck.length === 0 || !strings(v.perks) || !v.perks.every(id => ['steel','trade','walls'].includes(id))) return false;
  if (!Array.isArray(v.tiles) || v.tiles.length < B.initialSize**2 || v.tiles.length > B.maxSize**2) return false;
  const keys = new Set<string>();
  for (const tile of v.tiles) {
    if (!object(tile) || !finite(tile.x) || !finite(tile.y) || !Number.isInteger(tile.x) || !Number.isInteger(tile.y) || Math.abs(tile.x) > (Number(v.size)-1)/2 || Math.abs(tile.y) > (Number(v.size)-1)/2 || !finite(tile.level)) return false;
    const key = `${tile.x},${tile.y}`; if (keys.has(key)) return false; keys.add(key);
    if (tile.cardId !== null && (typeof tile.cardId !== 'string' || !(tile.cardId in cards) || !['building','tower','enchantment'].includes(cards[tile.cardId].type) || !Number.isInteger(tile.level) || tile.level < 1 || tile.level > 3 || (object(v.castle) && tile.x === v.castle.x && tile.y === v.castle.y))) return false;
    if (tile.cardId === null && tile.level !== 0) return false;
  }
  if (!finite(v.playsThisYear) || !Number.isInteger(v.playsThisYear) || v.playsThisYear < 0 || v.playsThisYear > B.playsPerYear || !['N','E','S','W'].includes(String(v.direction))) return false;
  if (v.phase === 'castle') { if (v.castle !== null) return false; }
  else if (!object(v.castle) || !v.tiles.some(t => object(t) && t.x === (v.castle as Record<string, unknown>).x && t.y === (v.castle as Record<string, unknown>).y && t.cardId === null)) return false;
  return Array.isArray(v.rewards) && (v.phase !== 'reward' || v.rewards.length === 3) && v.rewards.every(r => object(r) && r.kind === 'card' && typeof r.id === 'string' && r.id in cards && typeof r.label === 'string');
}
export function migrate(input: unknown): SaveData {
  if (!object(input) || !Number.isInteger(input.version)) throw new Error('Invalid save');
  let data = structuredClone(input);
  if (data.version === 1) { data = { ...data,version:2,meta:{ ...initialMeta(),...(object(data.meta) ? data.meta : {}),unlockedCards:[] } }; }
  if (data.version === 2) {
    if (object(data.run)) {
      const r=data.run;
      data.run={...r,castle:{x:0,y:0},playsThisYear:0,direction:['N','E','S','W'][Number(r.seed)>>>0 & 3],
        rewards:r.phase==='reward' && typeof r.enemy==='string' && r.enemy in factions ? factions[r.enemy as keyof typeof factions].deck.slice(0,3).map(id=>({kind:'card',id,label:cards[id].name})) : []};
    }
    data.version=3;
  }
  if (data.version !== SAVE_VERSION) throw new Error('Unsupported save version');
  if (!object(data.meta)) throw new Error('Invalid progression');
  const m = data.meta;
  if (![m.runs,m.wins,m.bestYear].every(n => finite(n) && n >= 0) || !strings(m.unlockedFactions) || !m.unlockedFactions.includes('ember') || !m.unlockedFactions.every(id => id in factions) || !strings(m.unlockedCards) || !m.unlockedCards.every(id => id in cards)) throw new Error('Invalid progression');
  if (data.run !== null && !isRun(data.run)) throw new Error('Invalid run');
  return data as unknown as SaveData;
}
