import { BALANCE as B } from '../config/balance';
import { cards, factions } from '../content';
import { perks } from '../content/perks';
import { units } from '../content/units';
import { waveFor } from '../content/waves';
import { createEffects } from '../effects';
import { tileKey, type EffectContext } from '../effects/registry';
import { createBattle, stepBattle, type Army } from '../sim/battle';
import { EventBus } from './events';
import { RNG } from './rng';
import type { Battle, FactionId, GameEvents, Run, Tile, Trigger } from './types';
export class Game {
  readonly events = new EventBus<GameEvents>();
  readonly effects = createEffects();
  battle?: Battle;
  constructor(public run: Run) {}
  static create(faction: FactionId, seed: number, unlockedCards: string[] = []): Game {
    const tiles: Tile[] = [];
    for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) tiles.push({ x,y,cardId:null,level:0 });
    const run: Run = { seed,rng:seed,faction,year:1,gold:B.initialGold,hp:B.castleHP,maxHP:B.castleHP,size:B.initialSize,tiles,deck:[...factions[faction].deck,...unlockedCards.filter(id => cards[id] && cards[id].faction !== faction)],hand:[],perks:[],phase:'planning',enemy:'ember',rewards:[],kills:0,cardsPlayed:0,waveDamage:0 };
    const game = new Game(run); game.draw();
    // Guaranteed opening troop and adjacency card, with three seeded draws.
    run.hand[0] = factions[faction].deck[0]; run.hand[1] = factions[faction].deck[3];
    game.chooseEnemy(); return game;
  }
  private random<T>(items: readonly T[]): T { const rng = new RNG(this.run.rng), result = rng.pick(items); this.run.rng = rng.state; return result; }
  private draw(): void { this.run.hand = Array.from({ length:B.handSize }, () => this.random(this.run.deck)); }
  private chooseEnemy(): void { this.run.enemy = this.random((Object.keys(factions) as FactionId[]).filter(id => id !== this.run.faction)); }
  changed(): void { this.events.emit('changed', this.run); }
  trigger(trigger: Trigger, extra: Partial<EffectContext> = {}): void {
    for (const tile of this.run.tiles) if (tile.cardId) {
      this.effects.execute(trigger, { run:this.run,tile,card:cards[tile.cardId],level:tile.level,...extra });
      this.events.emit('trigger', { trigger,cardId:tile.cardId });
    }
  }
  play(index: number, x?: number, y?: number): string | null {
    const r = this.run, card = cards[r.hand[index]];
    if (r.phase !== 'planning' || !card) return 'Choose a card during planning.';
    if (r.gold < card.cost) return 'Not enough gold.';
    const permanent = card.type === 'building' || card.type === 'tower' || card.type === 'enchantment';
    const tile = r.tiles.find(t => t.x === x && t.y === y);
    if (permanent && (!tile || (x === 0 && y === 0))) return 'Choose a tile beside your castle.';
    if (permanent && tile?.cardId && tile.cardId !== card.id) return 'Only identical cards can stack.';
    if (permanent && tile && tile.level >= B.maxLevel) return 'This tile is already level 3.';
    if (card.type === 'expand' && r.size === B.maxSize) return 'Your kingdom is already fully expanded.';
    r.gold -= card.cost; r.hand.splice(index,1); r.cardsPlayed++;
    const upgrade = permanent && tile?.cardId === card.id;
    if (permanent && tile) { tile.cardId = card.id; tile.level++; }
    this.effects.execute(upgrade ? 'onUpgrade' : 'onPlace', { run:r,card,tile,level:permanent ? tile!.level : 1 });
    this.events.emit('trigger', { trigger:upgrade ? 'onUpgrade' : 'onPlace',cardId:card.id }); this.changed(); return null;
  }
  startBattle(): void {
    const r = this.run; if (r.phase !== 'planning') return;
    const bonuses: NonNullable<EffectContext['bonuses']> = new Map(), spawns: NonNullable<EffectContext['spawns']> = [], towers: NonNullable<EffectContext['towers']> = [];
    this.trigger('onBattleStart', { bonuses,spawns,towers });
    const damage = (r.faction === 'ember' ? B.passiveDamage : 0) + r.perks.reduce((sum,id) => sum + (perks.find(p => p.id === id)?.stat === 'damage' ? B.perkDamage : 0),0);
    const army: Army[] = spawns.map(s => { const bonus = bonuses.get(tileKey(s.tile)); return { definition:units[s.unit], count:s.count + (bonus?.spawn ?? 0), hpBonus:(bonus?.hp ?? 0) + (r.faction === 'verdant' ? B.passiveHP : 0), damageBonus:damage + (bonus?.damage ?? 0) }; });
    this.battle = createBattle(army,towers.map(t => t.damage * (1 + damage + (bonuses.get(tileKey(t.tile))?.damage ?? 0))),waveFor(r.year),r.hp,r.rng,r.waveDamage);
    this.battle.units.forEach(() => this.trigger('onUnitSpawn'));
    r.phase = 'battle'; this.changed();
  }
  tick(dt: number): void {
    const b = this.battle; if (!b || this.run.phase !== 'battle') return;
    const alive = b.units.filter(u => u.hp > 0).length;
    stepBattle(b,dt);
    for (let i = b.units.filter(u => u.hp > 0).length; i < alive; i++) this.trigger('onUnitDeath');
    this.events.emit('battle',b);
    if (!b.done) return;
    const r = this.run; r.hp = b.castleHP; r.rng = b.rng; r.kills += b.kills; r.waveDamage = 0;
    this.trigger('onYearEnd');
    if (!b.won) { r.phase = 'defeat'; this.events.emit('finished',r); }
    else if (r.year >= B.finalYear) { r.phase = 'victory'; this.events.emit('finished',r); }
    else {
      r.gold += B.victoryGold; r.phase = 'reward';
      const card = cards[this.random(factions[r.enemy].deck)], perk = this.random(perks);
      r.rewards = [{ kind:'card',id:card.id,label:card.name },{ kind:'perk',id:perk.id,label:perk.name },{ kind:'gold',id:'gold',label:`${B.rewardGold} gold` }];
    }
    this.changed();
  }
  addPerk(id: string): void {
    const perk = perks.find(p => p.id === id); if (!perk) return;
    this.run.perks.push(id); if (perk.stat === 'hp') { this.run.maxHP += perk.amount; this.run.hp += perk.amount; }
  }
  chooseReward(index: number): void {
    const r = this.run; if (r.phase !== 'reward') return;
    const reward = r.rewards[index]; if (!reward) return;
    if (reward.kind === 'card') { r.deck.push(reward.id); }
    if (reward.kind === 'perk') this.addPerk(reward.id);
    if (reward.kind === 'gold') r.gold += B.rewardGold;
    if (r.year % B.perkEvery === 0) { r.phase = 'perk'; this.changed(); } else this.nextYear();
  }
  choosePerk(id: string): void { if (this.run.phase !== 'perk' || !perks.some(p => p.id === id)) return; this.addPerk(id); this.nextYear(); }
  private nextYear(): void {
    const r = this.run; r.year++; r.phase = 'planning'; r.rewards = [];
    r.gold += B.yearlyGold + (r.faction === 'tide' ? B.passiveGold : 0) + r.perks.reduce((sum,id) => sum + (perks.find(p => p.id === id)?.stat === 'income' ? B.perkIncome : 0),0);
    this.trigger('onYearStart'); this.draw(); this.chooseEnemy(); this.changed();
  }
}
