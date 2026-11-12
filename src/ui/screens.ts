import { factions } from '../content';
import { perks } from '../content/perks';
import { enemyKings, waveFor } from '../content/waves';
import type { Run, Meta } from '../core/types';
import { spriteURL } from '../render/sprites';
import { cardHTML } from './cards';
export function menuHTML(canContinue:boolean):string {
  return `<section class="menu-panel title-menu"><img class="title-castle" src="${spriteURL('castle','ember')}" alt=""><h1>CROWN OF<br><span>THE WILD</span></h1><p class="subtitle">KINGDOM AUTO-BATTLER</p>${canContinue?'<button class="primary" id="continue">CONTINUE</button>':''}<button id="new">NEW KINGDOM</button><button id="settings">HOW TO PLAY / SETTINGS</button><small>v0.2.0</small></section>`;
}
export function factionHTML(meta:Meta):string {
  return `<section class="menu-panel faction-menu"><h2>CHOOSE YOUR BANNER</h2><div class="faction-grid">${Object.values(factions).map(f=>`<button class="faction" data-faction="${f.id}" ${meta.unlockedFactions.includes(f.id)?'':'disabled'}><img src="${spriteURL('castle',f.id)}" alt=""><h3>${f.name}</h3><p>${f.passive}</p><small>${meta.unlockedFactions.includes(f.id)?'SELECT':'LOCKED'}</small></button>`).join('')}</div><label>SEED <input id="seed" maxlength="60" value="wild-${Date.now().toString(36)}"></label><p>Verdant: finish 1 run. Tideglass: finish 2, or win.</p><button id="back">BACK</button></section>`;
}
export function helpHTML(sound:boolean,reduced:boolean,active:boolean):string {
  return `<section class="menu-panel pause-menu"><h2>${active?'PAUSED':'HOW TO PLAY'}</h2><p>Place your castle on any plot.<br>Draw five cards. Play up to three; then defend.<br>Stack duplicates: 4 / 8 / 14 troops.<br>Support buildings buff four neighbors.<br>Expand adds one connected plot.<br>Take one of three cards from the enemy king.<br>Survive Year 20 to win.</p><p>Click card then plot, or drag it.<br>1-5: select. Space: pause. Escape: menu.<br>Arrow keys: move plot cursor. Enter: place.</p><div class="settings-row"><button id="sound">SOUND: ${sound?'ON':'OFF'}</button><button id="motion">MOTION: ${reduced?'REDUCED':'FULL'}</button></div><button class="primary" id="resume">${active?'RESUME':'BACK'}</button>${active?'<button id="exit">MAIN MENU</button>':''}</section>`;
}
export function rewardHTML(run:Run):string {
  if(run.phase==='reward')return `<section class="menu-panel reward-menu"><small>THE ${factions[run.enemy].name.toUpperCase()} DECK</small><h2>CLAIM A CARD</h2><p>One new alliance. Added permanently to this run's deck.</p><div class="reward-cards">${run.rewards.map((r,i)=>cardHTML(r.id,i,false,999,'reward')).join('')}</div></section>`;
  if(run.phase==='perk')return `<section class="menu-panel reward-menu"><h2>CHOOSE A BLESSING</h2><div class="perk-grid">${perks.map(p=>`<button data-perk="${p.id}"><h3>${p.name}</h3><p>${p.description}</p></button>`).join('')}</div></section>`;
  return '';
}
export function endHTML(run:Run,meta:Meta):string {
  return `<section class="menu-panel end-menu"><h2>${run.phase==='victory'?'VICTORY':'KINGDOM FALLEN'}</h2><p>YEAR ${run.year} / 20</p><p>${run.kills} invaders defeated<br>${run.cardsPlayed} cards played<br>${meta.unlockedFactions.length} banners unlocked</p><button class="primary" id="again">NEW KINGDOM</button><button id="exit">MAIN MENU</button></section>`;
}
export function hudHTML(run:Run,speed:number,paused:boolean):string {
  const wave=waveFor(run.year,run.enemy);
  return `<div class="hud"><strong>YEAR ${run.year}<span>/20</span></strong><div class="castle-hp"><div class="hp-track"><i id="hp-fill" style="width:${run.hp/run.maxHP*100}%"></i></div><span id="hp-value">${Math.ceil(run.hp)} / ${run.maxHP}</span></div><strong class="gold"><i class="coin"></i>${run.gold}</strong><div class="speeds">${[1,2,4].map(n=>`<button data-speed="${n}" aria-label="${n} times speed" class="${speed===n?'active':''}">${n}x</button>`).join('')}<button id="pause" aria-label="Pause battle">${paused?'PLAY':'II'}</button></div><button id="menu">MENU</button></div><div class="invasion-label">${wave.boss?'BOSS: ':''}${enemyKings[run.enemy].name} attacks from ${run.direction} <span>${wave.count} troops</span></div>`;
}
