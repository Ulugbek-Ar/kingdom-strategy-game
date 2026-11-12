import type { Pool, Pooled } from '../core/types';
export function makePool<T extends Pooled>(size: number, factory: () => T): Pool<T> {
  return { items:Array.from({ length:size }, factory),cursor:0 };
}
export function acquire<T extends Pooled>(pool: Pool<T>): T {
  // Ring reuse caps allocations and discards the oldest cosmetic/projectile on overflow.
  const item=pool.items[pool.cursor]; pool.cursor=(pool.cursor+1)%pool.items.length;
  item.active=true; return item;
}
