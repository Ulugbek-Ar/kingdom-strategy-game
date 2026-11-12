export type FactionId = 'ember' | 'verdant' | 'tide';
export type Trigger = 'onPlace' | 'onUpgrade' | 'onYearStart' | 'onBattleStart' | 'onUnitSpawn' | 'onUnitDeath' | 'onYearEnd';
export type CardType = 'building' | 'tower' | 'enchantment' | 'spell' | 'expand';
export interface Effect { kind: string; trigger: Trigger; amount: number; stat?: 'damage' | 'hp' | 'spawn'; unit?: string }
export interface Card { id: string; name: string; faction: FactionId; type: CardType; cost: number; icon: string; description: string; effects: Effect[] }
export interface Faction { id: FactionId; name: string; subtitle: string; color: string; icon: string; passive: string; deck: string[] }
export interface Tile { x: number; y: number; cardId: string | null; level: number }
export type Phase = 'planning' | 'battle' | 'reward' | 'perk' | 'victory' | 'defeat';
export interface Reward { kind: 'card' | 'perk' | 'gold'; id: string; label: string }
export interface Run { seed: number; rng: number; faction: FactionId; year: number; gold: number; hp: number; maxHP: number; size: number; tiles: Tile[]; deck: string[]; hand: string[]; perks: string[]; phase: Phase; enemy: FactionId; rewards: Reward[]; kills: number; cardsPlayed: number; waveDamage: number }
export interface UnitDefinition { id: string; hp: number; damage: number; range: number; speed: number; icon: string }
export interface Unit { id: number; side: 'ally' | 'enemy'; x: number; y: number; hp: number; maxHP: number; damage: number; range: number; speed: number; cooldown: number; flash: number; icon: string }
export interface Battle { units: Unit[]; towers: { damage: number; cooldown: number }[]; time: number; castleHP: number; done: boolean; won: boolean; kills: number; rng: number; hits: { x: number; y: number; damage: number; life: number }[] }
export interface Meta { runs: number; wins: number; bestYear: number; unlockedFactions: FactionId[]; unlockedCards: string[] }
export interface GameEvents { changed: Run; notice: string; battle: Battle; finished: Run; trigger: { trigger: Trigger; cardId: string } }
