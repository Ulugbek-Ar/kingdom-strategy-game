import type { Faction } from '../../core/types';
import { makeDeck, spawn, buff, tower, treasury, heal, blast, gold, expand } from '../cards/factory';
export const tideCards = makeDeck('tide', [
  ['watch','Pearl Watch','building','Raise pearl sentinels.',spawn('pearl')],
  ['hall','Current Hall','building','Raise ranged current weavers.',spawn('weaver')],
  ['tower','Prism Tower','tower','Focus light upon the nearest invader.',tower],
  ['garden','Lens Garden','enchantment','Adjacent tiles gain damage.',buff('damage')],
  ['shrine','Echo Shrine','enchantment','Adjacent troops gain health.',buff('hp')],
  ['exchange','Tide Exchange','building','Earn gold at each year start.',treasury],
  ['heal','Mending Rain','spell','Restore castle health.',heal],
  ['blast','Glassfall','spell','Damage every enemy in the next battle.',blast],
  ['edict','Trade Wind','spell','Gain gold immediately.',gold],
  ['expand','Shoreline','expand','Add one neighboring plot and mend the castle.',expand],
]);
export const tide: Faction = { id: 'tide', name: 'Tideglass', subtitle: 'Fortune in the current', icon: 'tide', color: '#8ac6d2', passive: 'Receive +2 gold at the start of every year.', deck: tideCards.map(c => c.id) };
