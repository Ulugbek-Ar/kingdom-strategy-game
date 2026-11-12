import { BALANCE as B } from '../config/balance';
export function waveFor(year: number): { count: number; hp: number; damage: number; boss: boolean } {
  const boss = year % B.bossEvery === 0, scale = boss ? B.bossMultiplier : 1;
  return { count: Math.floor(B.waveBase + year * B.waveGrowth), hp: (B.enemyHP + year * B.enemyHPGrowth) * scale, damage: (B.enemyDamage + year * B.enemyDamageGrowth) * scale, boss };
}
