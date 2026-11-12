import { cards, factions } from '../content';
import { adjacent } from '../effects/registry';
import { FEATURES } from '../config/features';
import type { Run, Tile } from '../core/types';
export const GRID = { width:600,height:420,tile:66,cx:300,cy:210 };
export function pointToTile(canvas: HTMLCanvasElement, clientX: number, clientY: number): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  return { x:Math.round(((clientX-rect.left) / rect.width * GRID.width-GRID.cx)/GRID.tile), y:Math.round(((clientY-rect.top) / rect.height * GRID.height-GRID.cy)/GRID.tile) };
}
function tree(ctx: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  ctx.fillStyle = '#29473b'; ctx.fillRect(x-2,y,4,size/2); ctx.fillStyle = '#3d5c47';
  ctx.beginPath(); ctx.moveTo(x,y-size); ctx.lineTo(x-size/2,y+5); ctx.lineTo(x+size/2,y+5); ctx.fill();
  ctx.fillStyle = '#496950'; ctx.beginPath(); ctx.moveTo(x,y-size); ctx.lineTo(x,y+5); ctx.lineTo(x+size/2,y+5); ctx.fill();
}
export function drawKingdom(canvas: HTMLCanvasElement, run: Run, hovered?: { x:number;y:number }, selected?: string): void {
  const ctx = canvas.getContext('2d'); if (!ctx) return;
  ctx.clearRect(0,0,GRID.width,GRID.height);
  for (let i=0;i<36;i++) { const x=(i*139+31)%600, y=(i*97+21)%420; if (Math.abs(x-300)>205 || Math.abs(y-210)>175) tree(ctx,x,y,12+i%12); }
  const card = selected ? cards[selected] : undefined;
  const hoverTile = hovered ? run.tiles.find(t => t.x===hovered.x && t.y===hovered.y) : undefined;
  for (const tile of run.tiles) {
    const x=GRID.cx+tile.x*GRID.tile,y=GRID.cy+tile.y*GRID.tile;
    const isHover = hoverTile===tile, synergy = FEATURES.synergyPreview && hoverTile && card?.type==='enchantment' && adjacent(tile,hoverTile);
    ctx.fillStyle='#12221c'; ctx.fillRect(x-30,y-26,60,62);
    ctx.fillStyle=synergy ? '#526247' : isHover ? '#546347' : tile.cardId ? '#3b513e' : '#304535';
    ctx.fillRect(x-30,y-30,60,57); ctx.strokeStyle=synergy || isHover ? '#e0c987' : '#63705a'; ctx.strokeRect(x-30.5,y-30.5,61,58);
    ctx.fillStyle='#66805b'; for(let i=0;i<4;i++) ctx.fillRect(x-23+i*13,y+19+(i%2)*2,3,2);
    if (tile.x===0 && tile.y===0) { drawCastle(ctx,x,y,run.hp/run.maxHP); continue; }
    if (tile.cardId) drawBuilding(ctx,tile,x,y);
    else { ctx.fillStyle=isHover ? '#d6c18c' : '#738066'; ctx.font='18px Georgia'; ctx.textAlign='center'; ctx.fillText('+',x,y+4); }
  }
  ctx.fillStyle='#b6bc9b'; ctx.textAlign='center'; ctx.font='11px sans-serif'; ctx.fillText('N',300,18);
  ctx.fillStyle='#7a8e71'; ctx.fillRect(299,25,2,16);
}
function drawCastle(ctx: CanvasRenderingContext2D,x:number,y:number,hp:number): void {
  ctx.fillStyle='#d5c9a3'; ctx.fillRect(x-19,y-13,38,32); ctx.fillStyle='#eee0b5'; ctx.fillRect(x-24,y-23,13,39); ctx.fillRect(x+11,y-23,13,39);
  ctx.fillStyle='#c16e4e'; ctx.beginPath(); ctx.moveTo(x-27,y-23);ctx.lineTo(x-17,y-39);ctx.lineTo(x-7,y-23);ctx.fill();
  ctx.beginPath();ctx.moveTo(x+7,y-23);ctx.lineTo(x+17,y-39);ctx.lineTo(x+27,y-23);ctx.fill();
  ctx.fillStyle='#314234';ctx.fillRect(x-5,y+3,10,16);ctx.fillStyle='#1c2a23';ctx.fillRect(x-23,y+24,46,3);ctx.fillStyle='#c3cd89';ctx.fillRect(x-23,y+24,46*hp,3);
}
function drawBuilding(ctx:CanvasRenderingContext2D,tile:Tile,x:number,y:number):void {
  const card=cards[tile.cardId!];ctx.fillStyle=factions[card.faction].color;
  if(card.type==='tower'){ctx.fillRect(x-9,y-20,18,34);ctx.fillRect(x-15,y-23,30,8);ctx.clearRect(x-2,y-24,4,5);}
  else if(card.type==='enchantment'){ctx.beginPath();ctx.moveTo(x,y-25);ctx.lineTo(x+13,y-3);ctx.lineTo(x,y+13);ctx.lineTo(x-13,y-3);ctx.closePath();ctx.fill();}
  else {ctx.fillRect(x-18,y-9,36,25);ctx.beginPath();ctx.moveTo(x-23,y-9);ctx.lineTo(x,y-27);ctx.lineTo(x+23,y-9);ctx.fill();ctx.fillStyle='#283f33';ctx.fillRect(x-4,y+2,8,14);}
  ctx.fillStyle='#f3e9c9';ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText('•'.repeat(tile.level),x,y+26);
}
