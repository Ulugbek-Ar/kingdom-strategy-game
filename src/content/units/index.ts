import { BALANCE as B } from '../../config/balance';
import type { UnitDefinition } from '../../core/types';
export const units: Record<string, UnitDefinition> = Object.fromEntries([
  ['cinder',1,1.2,1,'⚑'], ['coalbow',0.7,1.1,0.9,'➶'], ['thorn',1.5,0.85,0.8,'♟'],
  ['seedling',0.65,0.9,1.6,'✿'], ['pearl',1.2,1,1,'◆'], ['weaver',0.8,1.3,0.9,'✦'],
].map(([id, hp, damage, speed, icon]) => [id, { id: String(id), hp: B.baseHP * Number(hp), damage: B.baseDamage * Number(damage), speed: B.unitSpeed * Number(speed), range: id === 'coalbow' || id === 'weaver' ? B.rangedRange : B.meleeRange, icon: String(icon) }]));
