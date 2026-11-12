import { ember, emberCards } from './factions/ember';
import { verdant, verdantCards } from './factions/verdant';
import { tide, tideCards } from './factions/tide';
import type { Card, FactionId, Faction } from '../core/types';
export const factions: Record<FactionId, Faction> = { ember, verdant, tide };
export const cards: Record<string, Card> = Object.fromEntries([...emberCards, ...verdantCards, ...tideCards].map(c => [c.id, c]));
