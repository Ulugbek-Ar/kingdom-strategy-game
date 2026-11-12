import { FEATURES } from '../config/features';
import type { Meta, Run } from '../core/types';
import { initialMeta, migrate, SAVE_VERSION, type SaveData } from './migrations';
const KEY = 'crown-of-the-wild';
export function load(storage: Pick<Storage, 'getItem'> = localStorage): SaveData {
  try { const raw = storage.getItem(KEY); return raw ? migrate(JSON.parse(raw) as unknown) : { version:SAVE_VERSION,run:null,meta:initialMeta() }; }
  catch { return { version:SAVE_VERSION,run:null,meta:initialMeta() }; }
}
export function save(run: Run | null, meta: Meta, storage: Pick<Storage, 'setItem'> = localStorage): boolean {
  if (run?.phase === 'battle') return true; // Last planning checkpoint survives interruption.
  try { storage.setItem(KEY,JSON.stringify({ version:SAVE_VERSION,run,meta })); return true; } catch { return false; }
}
export function recordRun(meta: Meta, run: Run): void {
  if (!FEATURES.metaProgression) return;
  meta.runs++; if (run.phase === 'victory') meta.wins++;
  meta.bestYear = Math.max(meta.bestYear,run.year);
  if (!meta.unlockedFactions.includes('verdant')) meta.unlockedFactions.push('verdant');
  if ((meta.runs >= 2 || meta.wins > 0) && !meta.unlockedFactions.includes('tide')) meta.unlockedFactions.push('tide');
  const captured = run.deck.filter(id => !id.startsWith(run.faction));
  for (const id of captured) if (!meta.unlockedCards.includes(id)) meta.unlockedCards.push(id);
}
