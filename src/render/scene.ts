import { BALANCE as B } from '../config/balance';
import { FEATURES } from '../config/features';
import { cards } from '../content';
import { sameTile, tilePosition } from '../core/geometry';
import type { Battle, Point, Run } from '../core/types';
import { adjacent } from '../effects/registry';
import { banner, palettes, sprite } from './sprites';
import { ArmyRenderer } from './armies';
import { terrain } from './terrain';
export interface SceneOptions { hover?:Point; selected?:string; time:number; reducedMotion:boolean }
export class Scene {
  private armies=new ArmyRenderer();private ground?:HTMLCanvasElement;private seed=-1;private pops=new Map<string,number>();
  readonly canvas:HTMLCanvasElement;private ctx:CanvasRenderingContext2D;
  constructor(canvas:HTMLCanvasElement){this.canvas=canvas;canvas.width=480;canvas.height=270;this.ctx=canvas.getContext('2d',{alpha:false})!;this.ctx.imageSmoothingEnabled=false;}
  resize(width:number,height:number):void {
    const aspect=width/height,w=aspect<1?270:Math.max(480,Math.round(270*aspect));
    this.canvas.width=w;this.canvas.height=Math.round(w/aspect);this.ctx.imageSmoothingEnabled=false;this.seed=-1;
  }
  pop(tile:Point,time:number):void {this.pops.set(`${tile.x},${tile.y}`,time);}
  point(clientX:number,clientY:number):Point {
    const rect=this.canvas.getBoundingClientRect();
    return {x:Math.round(((clientX-rect.left)/rect.width*this.canvas.width-(this.canvas.width-480)/2-B.centerX)/B.tileSize),y:Math.round(((clientY-rect.top)/rect.height*this.canvas.height-(this.canvas.height-270)/2-B.centerY)/B.tileSize)};
  }
  draw(run:Run,battle:Battle|undefined,options:SceneOptions):void {
    if(this.seed!==run.seed){this.ground=terrain(run.seed,this.canvas.width,this.canvas.height);this.seed=run.seed;}
    const c=this.ctx,time=options.time;c.fillStyle='#58764b';c.fillRect(0,0,this.canvas.width,this.canvas.height);c.save();
    if(battle&&!options.reducedMotion&&battle.shake>0)c.translate(Math.round(Math.sin(time*117)*battle.shake),Math.round(Math.cos(time*91)*battle.shake));
    c.drawImage(this.ground!,0,0);c.translate(Math.round((this.canvas.width-480)/2),Math.round((this.canvas.height-270)/2));this.grid(run,options);
    // Static buildings are cached sprites; only pulses/pop-in change per frame.
    for(const tile of run.tiles){
      const p=tilePosition(tile),castle=sameTile(run.castle,tile),card=tile.cardId?cards[tile.cardId]:undefined;
      if(!castle&&!card)continue;
      if(card?.type==='enchantment'){
        c.globalAlpha=0.2+Math.sin(time*4)*0.1;c.fillStyle=palettes[card.faction].light;
        for(const neighbor of run.tiles)if(adjacent(tile,neighbor)){const n=tilePosition(neighbor);c.fillRect(n.x-10,n.y-10,20,20);}
        c.globalAlpha=1;
      }
      const start=this.pops.get(`${tile.x},${tile.y}`)??-100,age=time-start;
      const bounce=!options.reducedMotion&&age<0.3?Math.round(Math.sin(age/0.3*Math.PI)*4):0;
      c.drawImage(sprite(castle?'castle':card!.icon,castle?run.faction:card!.faction),Math.round(p.x-12),Math.round(p.y-17-bounce));
      if(card){for(let i=0;i<tile.level;i++){c.fillStyle='#283d32';c.fillRect(p.x-4+i*3,p.y+8,2,4);c.fillStyle='#e8d99d';c.fillRect(p.x-4+i*3,p.y+8,1,3);}}
    }
    if(battle)this.combat(battle,time,options.reducedMotion);
    else this.invasion(run,time);
    if(run.phase==='castle'){
      this.label('PLACE YOUR CASTLE',240,52,'#f5e5b8');this.label('Choose any kingdom plot',240,64,'#d9dbac');
      if(options.hover&&run.tiles.some(t=>sameTile(t,options.hover!))){const p=tilePosition(options.hover);c.globalAlpha=0.65;c.drawImage(sprite('castle',run.faction),p.x-12,p.y-17);c.globalAlpha=1;}
    }
    if(battle?.done&&battle.won)this.survived(run);
    c.restore();
  }
  private grid(run:Run,o:SceneOptions):void {
    const c=this.ctx,selected=o.selected?cards[o.selected]:undefined;
    if(selected?.type==='expand'&&run.phase==='planning')for(let y=-2;y<=2;y++)for(let x=-2;x<=2;x++){
      if(run.tiles.some(t=>t.x===x&&t.y===y)||!run.tiles.some(t=>Math.abs(t.x-x)+Math.abs(t.y-y)===1))continue;
      const p=tilePosition({x,y});c.fillStyle='#bfd18b';c.globalAlpha=0.4;c.fillRect(p.x-10,p.y-10,20,20);c.globalAlpha=1;c.strokeStyle='#e5d89a';c.strokeRect(p.x-9.5,p.y-9.5,19,19);
    }
    for(const t of run.tiles){
      const p=tilePosition(t),hover=sameTile(o.hover??null,t),synergy=FEATURES.synergyPreview&&selected?.type==='enchantment'&&o.hover&&adjacent(t,o.hover as Run['tiles'][number]);
      c.fillStyle='#334d36';c.fillRect(p.x-11,p.y-10,22,23);c.fillStyle=(t.x+t.y)%2?'#81915b':'#89965e';c.fillRect(p.x-10,p.y-10,20,20);
      c.fillStyle='#97a269';c.fillRect(p.x-10,p.y-10,20,1);c.fillStyle='#657e4f';c.fillRect(p.x-8,p.y+7,3,1);c.fillRect(p.x+6,p.y-6,2,1);
      if(hover||synergy){c.strokeStyle=synergy?'#8be4bb':'#fff0ae';c.strokeRect(p.x-10.5,p.y-10.5,21,21);}
    }
  }
  private invasion(run:Run,time:number):void {
    const c=this.ctx,side=run.direction;
    const p=side==='N'?{x:240,y:37}:side==='S'?{x:240,y:210}:side==='E'?{x:440,y:126}:{x:40,y:126};
    banner(c,run.enemy,p.x-7,p.y-11);
    c.save();c.translate(p.x,p.y+14);c.rotate(({N:0,S:Math.PI,E:Math.PI/2,W:-Math.PI/2})[side]);
    c.fillStyle='#f1ce82';const n=Math.round(Math.sin(time*5));c.fillRect(-1,-3+n,3,6);c.fillRect(-4,n,9,2);c.fillRect(-3,2+n,7,2);c.fillRect(-1,4+n,3,2);c.restore();
  }
  private combat(b:Battle,time:number,reduced:boolean):void {
    const c=this.ctx;
    this.armies.draw(c,b);
    for(const p of b.projectiles.items)if(p.active){
      const target=b.units[p.target],dx=target.x-p.x,dy=target.y-p.y,length=Math.hypot(dx,dy)||1;
      c.strokeStyle=p.kind==='bolt'?'#f9d687':'#e2d9a6';c.lineWidth=p.kind==='bolt'?2:1;c.beginPath();c.moveTo(Math.round(p.x-dx/length*7),Math.round(p.y-dy/length*7));c.lineTo(Math.round(p.x),Math.round(p.y));c.stroke();
      if(p.kind==='bolt'){c.fillStyle='#fff2b0';c.fillRect(Math.round(p.x)-1,Math.round(p.y)-1,3,3);}
    }
    for(const h of b.hits.items)if(h.active){
      const age=B.hitLife-h.life;
      if(h.kind==='death'&&FEATURES.particles){
        c.globalAlpha=h.life/B.hitLife;for(let i=0;i<6;i++){const a=i*1.047+h.serial;c.fillStyle=i%2?'#ddd3ab':'#b7ba87';c.fillRect(Math.round(h.x+Math.cos(a)*age*18),Math.round(h.y+Math.sin(a)*age*12),2,2);}c.globalAlpha=1;
      }else if(h.damage>0){c.globalAlpha=h.life/B.hitLife;this.label(String(h.damage),Math.round(h.x),Math.round(h.y-13-age*13),h.damage>=B.bigHit?'#ffe8a0':'#f2dfb7',7);c.globalAlpha=1;}
    }
    if(b.slowMotion>0&&!reduced){c.fillStyle='#fbe4a4';c.globalAlpha=0.04+Math.sin(time*20)*0.02;c.fillRect(0,0,480,270);c.globalAlpha=1;}
    if(!b.done){this.label(`${b.aliveAllies} ALLIES  /  ${b.aliveEnemies} INVADERS`,240,29,'#f2e7ba',6);}
  }
  private survived(run:Run):void {
    const c=this.ctx;c.fillStyle='#1c302c';c.globalAlpha=0.93;c.fillRect(102,87,276,49);c.globalAlpha=1;c.fillStyle='#e2c580';c.fillRect(102,87,276,1);c.fillRect(102,135,276,1);
    this.label(run.phase==='victory'?'VICTORY':'YEAR SURVIVED',240,108,'#f3dfaa',16);this.label(`YEAR ${run.year} / 20`,240,124,'#bace9f',7);
  }
  private label(text:string,x:number,y:number,color:string,size=8):void {const c=this.ctx;c.font=`bold ${size}px monospace`;c.textAlign='center';c.fillStyle='#26372e';c.fillText(text,x+1,y+1);c.fillStyle=color;c.fillText(text,x,y);}
}
