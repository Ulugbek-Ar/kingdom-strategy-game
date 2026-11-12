import { BALANCE as B } from '../config/balance';
import { cards } from '../content';
import type { Card } from '../core/types';
import { spriteURL } from '../render/sprites';
export function effectText(card:Card,level=1):string {
  return card.effects.map(e=>{
    const n=e.amount*level;
    switch(e.kind){
      case 'spawnUnits':return `${B.squadSizes[level-1]*(e.amount/B.baseSpawn)} troops / battle`;
      case 'tower':return `${n} damage / ${B.towerInterval}s`;
      case 'buffAdjacent':return `Neighbors: +${e.stat==='spawn'?n:Math.round(n*100)+'%'} ${e.stat}`;
      case 'gainGold':return `+${n} gold ${e.trigger==='onYearStart'?'each year':'now'}`;
      case 'healCastle':return `Heal ${n} castle HP`;
      case 'dealDamage':return `${n} damage to all invaders`;
      case 'expand':return 'Add 1 neighboring plot';
      default:return card.description;
    }
  }).join('; ');
}
export function cardHTML(id:string,index:number,selected:boolean,gold:number,attribute='card'):string {
  const c=cards[id];return `<button class="card ${selected?'selected':''} ${gold<c.cost?'unaffordable':''}" data-${attribute}="${index}" ${attribute==='card'?'draggable="true"':''} aria-label="${c.name}. ${c.cost} gold. ${effectText(c)}" title="${effectText(c)}"><span class="card-cost">${c.cost}<i class="coin"></i></span><img src="${spriteURL(c.icon,c.faction)}" alt="" draggable="false"><strong>${c.name}</strong><small>${effectText(c)}</small></button>`;
}
