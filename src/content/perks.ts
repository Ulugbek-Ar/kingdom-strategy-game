import { BALANCE as B } from '../config/balance';
export interface Perk { id: string; name: string; description: string; stat: 'damage' | 'income' | 'hp'; amount: number; icon: string }
export const perks: Perk[] = [
  { id:'steel', name:'Tempered resolve', description:`All damage +${B.perkDamage * 100}%.`, stat:'damage', amount:B.perkDamage, icon:'⚔' },
  { id:'trade', name:'Golden roads', description:`Earn +${B.perkIncome} gold each year.`, stat:'income', amount:B.perkIncome, icon:'◉' },
  { id:'walls', name:'Deep foundations', description:`Restore and gain ${B.perkHP} maximum castle HP.`, stat:'hp', amount:B.perkHP, icon:'♜' },
];
