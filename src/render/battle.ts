import type { Battle } from '../core/types';
import { FEATURES } from '../config/features';
export function drawBattle(canvas: HTMLCanvasElement, battle?: Battle): void {
  const ctx=canvas.getContext('2d');if(!ctx)return;ctx.clearRect(0,0,800,240);
  ctx.fillStyle='#182a24';ctx.fillRect(0,0,800,240);
  ctx.fillStyle='#324333';ctx.fillRect(0,190,800,50);
  ctx.strokeStyle='#40503b';ctx.setLineDash([5,12]);ctx.beginPath();ctx.moveTo(70,205);ctx.lineTo(770,205);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#9fa88a';ctx.fillRect(25,70,35,115);ctx.fillRect(18,58,49,18);ctx.fillRect(18,48,9,16);ctx.fillRect(39,48,9,16);ctx.fillRect(58,48,9,16);
  ctx.fillStyle='#5a6951';ctx.fillRect(31,136,23,49);
  if(!battle){ctx.fillStyle='#8e9f87';ctx.font='italic 17px Georgia';ctx.textAlign='center';ctx.fillText('The border is quiet. For now.',440,113);return;}
  for(const u of battle.units){if(u.hp<=0)continue;
    ctx.fillStyle='#0c1917';ctx.beginPath();ctx.ellipse(u.x,u.y+12,10,4,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=u.flash>0?'#fff4d0':u.side==='ally'?'#c7cf94':'#d98970';ctx.fillRect(u.x-6,u.y-7,12,17);ctx.fillRect(u.x-4,u.y-15,8,8);
    ctx.fillStyle='#23382f';ctx.fillRect(u.x-8,u.y-23,16,3);ctx.fillStyle=u.side==='ally'?'#b3cf86':'#e49c7d';ctx.fillRect(u.x-8,u.y-23,16*u.hp/u.maxHP,3);
    ctx.font='10px sans-serif';ctx.textAlign='center';ctx.fillText(u.icon,u.x,u.y+6);
  }
  if(FEATURES.particles) for(const h of battle.hits){ctx.globalAlpha=h.life/0.7;ctx.fillStyle='#f2db9e';ctx.font='bold 13px sans-serif';ctx.textAlign='center';ctx.fillText(String(h.damage),h.x,h.y-25-(0.7-h.life)*28);for(let i=0;i<3;i++)ctx.fillRect(h.x+(i-1)*(0.7-h.life)*30,h.y-(0.7-h.life)*20+i*4,2,2);}
  ctx.globalAlpha=1;
}
