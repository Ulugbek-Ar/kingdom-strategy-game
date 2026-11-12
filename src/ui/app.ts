import { BALANCE as B } from '../config/balance';
import { cards } from '../content';
import { Sound } from '../audio/sound';
import { Game } from '../core/game';
import { seedFrom } from '../core/rng';
import type { FactionId, Point } from '../core/types';
import { Scene } from '../render/scene';
import { load, recordRun, save } from '../save';
import { cardHTML, effectText } from './cards';
import { demo } from './demo';
import { endHTML, factionHTML, helpHTML, hudHTML, menuHTML, rewardHTML } from './screens';
export class App {
  private data=load();private game?:Game;private preview=demo();private scene:Scene;
  private overlay:HTMLElement;private controls:HTMLElement;private tooltip:HTMLElement;private toast:HTMLElement;
  private selected=-1;private speed=1;private paused=false;private hover?:Point;private cursor:Point={x:0,y:0};
  private screen:'menu'|'factions'|'game'|'help'='menu';private sound=new Sound();
  private last=0;private time=0;private accumulator=0;private victoryAt=-100;private lastSerial=0;
  private reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  constructor(root:HTMLElement){
    root.innerHTML='<main class="game"><canvas id="world" aria-label="Kingdom battlefield" tabindex="0"></canvas><div id="controls"></div><div id="tooltip" role="status"></div><div id="overlay"></div><div id="toast" role="status"></div></main>';
    this.scene=new Scene(root.querySelector<HTMLCanvasElement>('#world')!);
    this.overlay=root.querySelector('#overlay')!;this.controls=root.querySelector('#controls')!;this.tooltip=root.querySelector('#tooltip')!;this.toast=root.querySelector('#toast')!;
    this.scene.resize(innerWidth,innerHeight);window.addEventListener('resize',()=>this.scene.resize(innerWidth,innerHeight));
    this.input();this.menu();requestAnimationFrame(t=>this.frame(t));
    window.addEventListener('blur',()=>{if(this.screen==='game'&&this.game?.run.phase==='battle'){this.paused=true;this.refresh();}});
  }
  private persist():void {if(!save(this.data.run,this.data.meta))this.notice('Browser storage unavailable. Progress cannot be saved.');}
  private menu():void {
    this.screen='menu';this.paused=true;this.controls.innerHTML='';this.tooltip.textContent='';
    this.overlay.innerHTML=menuHTML(!!this.data.run&&!['victory','defeat'].includes(this.data.run.phase));
    this.bind('#new',()=>this.factions());this.bind('#settings',()=>this.help());
    this.bind('#continue',()=>{if(this.game){this.screen='game';this.paused=false;this.refresh();}else if(this.data.run)this.attach(new Game(structuredClone(this.data.run)));});
  }
  private factions():void {
    this.screen='factions';this.controls.innerHTML='';this.overlay.innerHTML=factionHTML(this.data.meta);
    this.bind('#back',()=>this.menu());this.overlay.querySelectorAll<HTMLButtonElement>('[data-faction]').forEach(el=>el.onclick=()=>{
      const seed=this.overlay.querySelector<HTMLInputElement>('#seed')!.value;
      this.attach(Game.create(el.dataset.faction as FactionId,seedFrom(seed),this.data.meta.unlockedCards));
    });
  }
  private attach(game:Game):void {
    this.game=game;this.screen='game';this.paused=false;this.selected=-1;this.accumulator=0;this.victoryAt=-100;this.lastSerial=0;
    game.events.on('changed',r=>{this.data.run=r;this.persist();if(this.screen==='game')this.refresh();});
    game.events.on('placed',p=>{this.scene.pop(p.tile,this.time);this.sound.play('place');});
    game.events.on('battle',b=>{
      if(b.serial<this.lastSerial)this.lastSerial=0;
      if(b.done&&b.won){this.victoryAt=this.time;this.sound.play('victory');}
      for(const h of b.hits.items)if(h.active&&h.serial>this.lastSerial){if(h.kind==='tower')this.sound.play('tower');else if(h.kind==='hit')this.sound.play('hit');}
      this.lastSerial=b.serial;
      if(b.projectiles.items.some(p=>p.active&&p.kind==='arrow'))this.sound.play('arrow');
    });
    game.events.on('finished',r=>{recordRun(this.data.meta,r);this.persist();});
    this.data.run=game.run;this.persist();this.refresh();
  }
  private refresh():void {
    if(this.screen!=='game'||!this.game)return;
    const r=this.game.run;this.overlay.innerHTML='';
    this.controls.innerHTML=hudHTML(r,this.speed,this.paused);
    if(r.phase==='planning')this.controls.insertAdjacentHTML('beforeend',`<div class="hand-bar"><div class="hand-meta">PLAY ${r.playsThisYear} / 3<button id="begin">DEFEND NOW</button></div><div class="hand">${r.hand.map((id,i)=>cardHTML(id,i,i===this.selected,r.gold)).join('')}</div></div>`);
    this.controls.querySelectorAll<HTMLButtonElement>('[data-card]').forEach(el=>{el.onclick=()=>this.select(Number(el.dataset.card));el.ondragstart=e=>{this.selected=Number(el.dataset.card);e.dataTransfer?.setData('text/plain',el.dataset.card!);};el.onpointerenter=()=>this.showCard(Number(el.dataset.card));el.onpointerleave=()=>this.updateTooltip();});
    this.controls.querySelectorAll<HTMLButtonElement>('[data-speed]').forEach(el=>el.onclick=()=>{this.speed=Number(el.dataset.speed);this.refresh();});
    this.bind('#begin',()=>{this.selected=-1;this.tooltip.textContent='';this.game!.startBattle();});
    this.bind('#pause',()=>this.togglePause());this.bind('#menu',()=>this.help());
    const waiting=this.time-this.victoryAt<1.2;
    if(!waiting){
      if(r.phase==='reward'||r.phase==='perk')this.overlay.innerHTML=rewardHTML(r);
      if(r.phase==='victory'||r.phase==='defeat')this.overlay.innerHTML=endHTML(r,this.data.meta);
    }
    this.overlay.querySelectorAll<HTMLButtonElement>('[data-reward]').forEach(el=>el.onclick=()=>this.game!.chooseReward(Number(el.dataset.reward)));
    this.overlay.querySelectorAll<HTMLButtonElement>('[data-perk]').forEach(el=>el.onclick=()=>this.game!.choosePerk(el.dataset.perk!));
    this.bind('#again',()=>this.factions());this.bind('#exit',()=>this.menu());
    if(this.paused&&r.phase==='battle')this.controls.insertAdjacentHTML('beforeend','<div class="pause-label">PAUSED</div>');
    this.updateTooltip();
  }
  private help():void {
    this.screen='help';this.paused=true;this.controls.innerHTML='';this.tooltip.textContent='';
    this.overlay.innerHTML=helpHTML(this.sound.enabled,this.reduced,!!this.game);
    this.bind('#sound',()=>{this.sound.enabled=!this.sound.enabled;this.sound.unlock();this.help();});this.bind('#motion',()=>{this.reduced=!this.reduced;this.help();});
    this.bind('#resume',()=>{if(this.game){this.screen='game';this.paused=false;this.refresh();}else this.menu();});this.bind('#exit',()=>this.menu());
  }
  private input():void {
    const canvas=this.scene.canvas;
    canvas.onpointermove=e=>{this.hover=this.scene.point(e.clientX,e.clientY);this.updateTooltip();};canvas.onpointerleave=()=>{this.hover=undefined;this.updateTooltip();};
    canvas.onclick=e=>{this.sound.unlock();this.place(this.scene.point(e.clientX,e.clientY));};
    canvas.ondragover=e=>{e.preventDefault();this.hover=this.scene.point(e.clientX,e.clientY);};canvas.ondrop=e=>{e.preventDefault();this.place(this.scene.point(e.clientX,e.clientY));};
    window.addEventListener('keydown',e=>{
      if((e.target as HTMLElement).tagName==='INPUT')return;
      if(e.key==='Escape'){if(this.screen==='game'&&this.selected>=0){this.selected=-1;this.refresh();}else if(this.screen==='help'){if(this.game){this.screen='game';this.paused=false;this.refresh();}else this.menu();}else this.help();return;}
      if(this.screen!=='game')return;
      if(e.code==='Space'){e.preventDefault();this.togglePause();}
      if(/^[1-5]$/.test(e.key))this.select(Number(e.key)-1);
      if(e.key.startsWith('Arrow')){e.preventDefault();this.cursor.x=Math.max(-2,Math.min(2,this.cursor.x+(e.key==='ArrowRight'?1:e.key==='ArrowLeft'?-1:0)));this.cursor.y=Math.max(-2,Math.min(2,this.cursor.y+(e.key==='ArrowDown'?1:e.key==='ArrowUp'?-1:0)));this.hover={...this.cursor};this.updateTooltip();}
      if(e.key==='Enter'&&e.target===canvas){e.preventDefault();this.place(this.hover??this.cursor);}
    });
  }
  private select(i:number):void {
    if(!this.game||this.game.run.phase!=='planning'||!this.game.run.hand[i])return;
    this.sound.unlock();this.selected=this.selected===i?-1:i;this.refresh();
    const c=cards[this.game.run.hand[this.selected]];
    if(c?.type==='spell'){
      this.tooltip.innerHTML=`<b>${c.name}</b><span>${effectText(c)}</span><button id="cast">CAST (${c.cost} GOLD)</button><button id="cancel">CANCEL</button>`;
      this.bind('#cast',()=>this.place(this.game!.run.castle!));this.bind('#cancel',()=>{this.selected=-1;this.refresh();});
    }
  }
  private place(point:Point):void {
    if(this.screen!=='game'||!this.game||this.paused)return;
    const error=this.game.run.phase==='castle'?this.game.placeCastle(point.x,point.y):this.selected>=0?this.game.play(this.selected,point.x,point.y):'Select a card first.';
    if(error)this.notice(error);else{this.selected=-1;this.tooltip.textContent='';this.refresh();}
  }
  private showCard(index:number):void {const selected=this.game?.run.hand[this.selected];if(selected&&cards[selected].type==='spell')return;const id=this.game?.run.hand[index];if(id)this.tooltip.textContent=`${cards[id].name}: ${effectText(cards[id])}. Stack for stronger squads. Cost ${cards[id].cost}.`;}
  private updateTooltip():void {
    const r=this.game?.run;if(this.screen!=='game'||!r)return;
    const t=r.tiles.find(t=>t.x===this.hover?.x&&t.y===this.hover?.y),id=r.hand[this.selected];
    if(id&&cards[id].type==='spell')return;
    this.tooltip.textContent=t?.cardId?`${cards[t.cardId].name} / Lv ${t.level} / ${effectText(cards[t.cardId],t.level)}`:id?`${cards[id].name}: ${effectText(cards[id])}${cards[id].type==='expand'?' - choose a highlighted new plot.':''}`:'';
  }
  private togglePause():void {if(this.game?.run.phase==='battle'){this.paused=!this.paused;this.refresh();}}
  private frame(timestamp:number):void {
    const dt=Math.min((timestamp-this.last)/1000,0.1);this.last=timestamp;this.time+=dt;
    const playing=this.screen==='game'&&this.game;
    if(playing&&this.game!.run.phase==='battle'&&!this.paused){
      this.accumulator+=dt*this.speed;
      while(this.accumulator>=B.step&&this.game!.run.phase==='battle'){this.game!.tick(B.step);this.accumulator-=B.step;}
      const b=this.game!.battle;if(b){const fill=this.controls.querySelector<HTMLElement>('#hp-fill'),value=this.controls.querySelector('#hp-value');if(fill)fill.style.width=`${b.castleHP/this.game!.run.maxHP*100}%`;if(value)value.textContent=`${Math.ceil(b.castleHP)} / ${this.game!.run.maxHP}`;}
    }
    if(playing&&this.victoryAt>0&&this.time-this.victoryAt>=1.2){this.victoryAt=-100;this.refresh();}
    if(!this.game||this.screen==='menu'||this.screen==='factions'){
      if(this.preview.run.phase!=='battle')this.preview=demo();else this.preview.tick(B.step);
    }
    const game=playing||this.screen==='help'&&this.game?this.game!:this.preview;
    this.scene.draw(game.run,game.battle,{time:this.time,reducedMotion:this.reduced,hover:playing?this.hover:undefined,selected:playing?game.run.hand[this.selected]:undefined});
    requestAnimationFrame(t=>this.frame(t));
  }
  private bind(selector:string,fn:()=>void):void {const el=document.querySelector<HTMLButtonElement>(selector);if(el)el.onclick=fn;}
  private notice(text:string):void {this.toast.textContent=text;setTimeout(()=>{this.toast.textContent='';},2800);}
}
