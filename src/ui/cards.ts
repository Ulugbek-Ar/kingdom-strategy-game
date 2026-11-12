import { cards, factions } from '../content';
import type { Card } from '../core/types';
export function effectText(card: Card, level=1): string {
  return card.effects.map(e => {
    const amount=e.amount*level;
    switch(e.kind){
      case 'spawnUnits':return `Spawn ${e.amount+level-1} ${e.unit} per battle`;
      case 'tower':return `${amount} tower damage / 1.2s`;
      case 'buffAdjacent':return `Adjacent ${e.stat}: +${e.stat==='spawn'?amount:`${Math.round(amount*100)}%`}`;
      case 'gainGold':return `+${amount} gold ${e.trigger==='onYearStart'?'each year':'now'}`;
      case 'healCastle':return `Restore ${amount} castle HP`;
      case 'dealDamage':return `${amount} damage to ALL next-wave enemies`;
      case 'expand':return 'Unlock all 25 kingdom tiles';
      default:return card.description;
    }
  }).join(' · ');
}
export function cardHTML(id:string,index:number,selected:boolean,gold:number):string {
  const c=cards[id];return `<button class="card ${selected?'selected':''} ${gold<c.cost?'unaffordable':''}" data-card="${index}" draggable="true" title="${c.name}: ${effectText(c)}. ${c.type==='spell'||c.type==='expand'?'Select to cast.':'Select, then click a tile. Same card upgrades to level 3.'}" style="--faction:${factions[c.faction].color}"><div class="card-top"><span>${c.type}</span><b>${c.cost}<small> ◉</small></b></div><div class="card-art art-${c.type}"><span>${c.icon}</span><i></i></div><strong>${c.name}</strong><p>${effectText(c)}</p><div class="card-bottom">${factions[c.faction].name}<span>${index+1}</span></div></button>`;
}
