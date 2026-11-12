import { Game } from '../core/game';
export function demo():Game {
  const game=Game.create('ember',7241);game.placeCastle(0,0);
  const entries:[number,number,string,number][]=[[-1,0,'ember-guard',2],[1,0,'ember-spire',2],[0,1,'verdant-grove',2],[-1,-1,'ember-forge',1],[0,-1,'tide-hall',2],[1,1,'verdant-bloom',1]];
  for(const [x,y,id,level] of entries){const t=game.run.tiles.find(t=>t.x===x&&t.y===y)!;t.cardId=id;t.level=level;}
  game.run.year=10;game.run.direction='E';game.startBattle();return game;
}
