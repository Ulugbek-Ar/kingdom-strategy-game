import type { Card, Effect, Run, Tile, Trigger } from '../core/types';
export interface EffectContext { run: Run; tile?: Tile; card: Card; level: number; bonuses?: Map<string, { damage: number; hp: number; spawn: number }>; spawns?: { unit: string; count: number; tile: Tile }[]; towers?: { damage: number; tile: Tile }[] }
export type EffectHandler = (effect: Effect, context: EffectContext) => void;
export class EffectRegistry {
  private handlers = new Map<string, EffectHandler>();
  register(kind: string, handler: EffectHandler): void { if (this.handlers.has(kind)) throw new Error(`Duplicate effect ${kind}`); this.handlers.set(kind, handler); }
  execute(trigger: Trigger, context: EffectContext): void {
    for (const effect of context.card.effects) if (effect.trigger === trigger) {
      const handler = this.handlers.get(effect.kind); if (!handler) throw new Error(`Unknown effect ${effect.kind}`); handler(effect, context);
    }
  }
}
export const tileKey = (tile: Pick<Tile, 'x' | 'y'>): string => `${tile.x},${tile.y}`;
export const adjacent = (a: Tile, b: Tile): boolean => Math.abs(a.x - b.x) + Math.abs(a.y - b.y) === 1;
