import type { Faction } from '../../core/types';
import { makeDeck, spawn, buff, tower, treasury, heal, blast, gold, expand } from '../cards/factory';
export const verdantCards = makeDeck('verdant', [
  ['guard','Thorn Ward','building','Raise sturdy thorn guardians.',spawn('thorn')],
  ['grove','Seedling Grove','building','Raise swift seedling spirits.',spawn('seedling')],
  ['tower','Briar Tower','tower','Briars strike approaching enemies.',tower],
  ['bloom','Lifebloom','enchantment','Adjacent troops gain health.',buff('hp')],
  ['chorus','Root Chorus','enchantment','Adjacent buildings spawn extra units.',buff('spawn')],
  ['market','Sap Market','building','Earn gold at each year start.',treasury],
  ['heal','Renewal','spell','Restore castle health.',heal],
  ['blast','Bramble Storm','spell','Damage every enemy in the next battle.',blast],
  ['edict','Harvest Edict','spell','Gain gold immediately.',gold],
  ['expand','Wildgrowth','expand','Add one neighboring plot and mend the castle.',expand],
]);
export const verdant: Faction = { id: 'verdant', name: 'Verdant Pact', subtitle: 'Life finds a way', icon: 'verdant', color: '#a0c98b', passive: 'All allied troops gain +25% health.', deck: verdantCards.map(c => c.id) };
