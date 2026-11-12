import { BALANCE as B } from '../config/balance';
import type { FactionId } from '../core/types';
export const enemyKings = {
  ember: { name:'King of Cinders', sprite:'soldier', hp:0.9, damage:1.15 },
  verdant: { name:'The Thorn Regent', sprite:'guardian', hp:1.2, damage:0.85 },
  tide: { name:'The Glass Sovereign', sprite:'sentinel', hp:1, damage:1 },
} as const;
export function waveFor(year: number, faction: FactionId = 'ember') {
  const boss=year % B.bossEvery===0, scale=boss?B.bossMultiplier:1, king=enemyKings[faction];
  return { count:Math.floor((B.waveBase+(year-1)*B.waveLinear+(year-1)**2*B.waveGrowth)*(boss?B.bossCount:1)), hp:(B.enemyHP+year*B.enemyHPGrowth)*scale*king.hp, damage:(B.enemyDamage+year*B.enemyDamageGrowth)*scale*king.damage, boss, faction, sprite:king.sprite };
}
