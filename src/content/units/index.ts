import { BALANCE as B } from '../../config/balance';
import type { FactionId, UnitDefinition } from '../../core/types';
const definitions: [string, number, number, number, string, FactionId][] = [
  ['cinder',1,1.2,1,'soldier','ember'], ['coalbow',0.7,1.1,0.9,'archer','ember'],
  ['thorn',1.5,0.85,0.8,'guardian','verdant'], ['seedling',0.65,0.9,1.6,'spirit','verdant'],
  ['pearl',1.2,1,1,'sentinel','tide'], ['weaver',0.8,1.3,0.9,'mage','tide'],
];
export const units: Record<string, UnitDefinition> = Object.fromEntries(definitions.map(([id,hp,damage,speed,icon,faction]) => [id,{ id,hp:B.baseHP*hp,damage:B.baseDamage*damage,speed:B.unitSpeed*speed,range:icon==='archer'||icon==='mage'?B.rangedRange:B.meleeRange,icon,faction }]));
