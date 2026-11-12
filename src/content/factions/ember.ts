import type { Faction } from '../../core/types';
import { makeDeck, spawn, buff, tower, treasury, heal, blast, gold, expand } from '../cards/factory';
export const emberCards = makeDeck('ember', [
  ['guard','Cinder Guard','building','Raise frontline cinder knights.',spawn('cinder')],
  ['lodge','Coalbow Lodge','building','Raise ranged coal archers.',spawn('coalbow')],
  ['spire','Flare Spire','tower','Fire at the nearest invader.',tower],
  ['forge','Forgeheart','enchantment','Adjacent tiles gain damage.',buff('damage')],
  ['beacon','War Beacon','enchantment','Adjacent buildings spawn extra units.',buff('spawn')],
  ['treasury','Ash Treasury','building','Earn gold at each year start.',treasury],
  ['heal','Rekindle','spell','Restore castle health.',heal],
  ['blast','Firefall','spell','Damage every enemy in the next battle.',blast],
  ['edict','Ember Decree','spell','Gain gold immediately.',gold],
  ['expand','Frontier','expand','Add one neighboring plot and mend the castle.',expand],
]);
export const ember: Faction = { id: 'ember', name: 'Embercourt', subtitle: 'The restless flame', icon: 'ember', color: '#f3a46b', passive: 'All troops and towers deal +15% damage.', deck: emberCards.map(c => c.id) };
