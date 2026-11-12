export type FactionId = 'ember' | 'verdant' | 'tide';
export type Direction = 'N' | 'E' | 'S' | 'W';
export type Trigger = 'onPlace' | 'onUpgrade' | 'onYearStart' | 'onBattleStart' | 'onUnitSpawn' | 'onUnitDeath' | 'onYearEnd';
export type CardType = 'building' | 'tower' | 'enchantment' | 'spell' | 'expand';
export interface Point { x: number; y: number }
export interface Effect { kind: string; trigger: Trigger; amount: number; stat?: 'damage' | 'hp' | 'spawn'; unit?: string }
export interface Card { id: string; name: string; faction: FactionId; type: CardType; cost: number; icon: string; description: string; effects: Effect[] }
export interface Faction { id: FactionId; name: string; subtitle: string; color: string; icon: string; passive: string; deck: string[] }
export interface Tile extends Point { cardId: string | null; level: number }
export type Phase = 'castle' | 'planning' | 'battle' | 'reward' | 'perk' | 'victory' | 'defeat';
export interface Reward { kind: 'card'; id: string; label: string }
export interface Run { seed: number; rng: number; faction: FactionId; year: number; gold: number; hp: number; maxHP: number; size: number; tiles: Tile[]; castle: Point | null; playsThisYear: number; direction: Direction; deck: string[]; hand: string[]; perks: string[]; phase: Phase; enemy: FactionId; rewards: Reward[]; kills: number; cardsPlayed: number; waveDamage: number }
export interface UnitDefinition { id: string; hp: number; damage: number; range: number; speed: number; icon: string; faction: FactionId }
export interface Unit extends Point { id: number; side: 'ally' | 'enemy'; faction: FactionId; sprite: string; hp: number; maxHP: number; damage: number; range: number; speed: number; cooldown: number; flash: number; state: 'move' | 'attack' | 'die'; target: number; retarget: number; born: number; facing: number; deathAt: number }
export interface Pooled { active: boolean }
export interface Hit extends Point, Pooled { damage: number; life: number; kind: 'hit' | 'death' | 'tower'; serial: number }
export interface Projectile extends Point, Pooled { fromX: number; fromY: number; target: number; damage: number; speed: number; kind: 'arrow' | 'bolt'; life: number }
export interface Tower extends Point { damage: number; cooldown: number; faction: FactionId }
export interface Pool<T extends Pooled> { items: T[]; cursor: number }
export interface Battle { units: Unit[]; towers: Tower[]; time: number; castle: Point; castleHP: number; done: boolean; won: boolean; kills: number; deaths: number; rng: number; hits: Pool<Hit>; projectiles: Pool<Projectile>; serial: number; shake: number; slowMotion: number; aliveAllies: number; aliveEnemies: number }
export interface Meta { runs: number; wins: number; bestYear: number; unlockedFactions: FactionId[]; unlockedCards: string[] }
export interface GameEvents { changed: Run; notice: string; battle: Battle; finished: Run; placed: { tile: Point; cardId: string | null }; trigger: { trigger: Trigger; cardId: string } }
