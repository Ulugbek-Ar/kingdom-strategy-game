export class RNG {
  constructor(public state: number) { this.state >>>= 0; }
  next(): number { this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0; return this.state / 4294967296; }
  pick<T>(items: readonly T[]): T { if (!items.length) throw new Error('Empty RNG choice'); return items[Math.floor(this.next() * items.length)]; }
}
export function seedFrom(text: string): number { let n = 2166136261; for (const c of text) n = Math.imul(n ^ c.charCodeAt(0), 16777619); return n >>> 0; }
