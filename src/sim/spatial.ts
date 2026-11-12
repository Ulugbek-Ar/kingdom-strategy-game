import { BALANCE as B } from '../config/balance';
import type { Unit } from '../core/types';
const CELL=B.spatialCell, COLS=Math.ceil(B.battlefieldWidth/CELL), ROWS=Math.ceil(B.battlefieldHeight/CELL);
export class SpatialHash {
  private heads=new Int32Array(COLS*ROWS*2);
  private next=new Int32Array(B.poolCapacity);
  rebuild(units: Unit[], time: number): void {
    this.heads.fill(-1);
    for(let i=0;i<units.length;i++) {
      const u=units[i]; if(u.hp<=0 || u.born>time)continue;
      const x=Math.max(0,Math.min(COLS-1,Math.floor(u.x/CELL))),y=Math.max(0,Math.min(ROWS-1,Math.floor(u.y/CELL)));
      const cell=(u.side==='ally'?0:COLS*ROWS)+y*COLS+x;
      this.next[i]=this.heads[cell];this.heads[cell]=i;
    }
  }
  nearest(x:number,y:number,side:'ally'|'enemy',units:Unit[],range=Infinity):number {
    const cx=Math.floor(x/CELL),cy=Math.floor(y/CELL),offset=side==='ally'?0:COLS*ROWS;
    let result=-1,best=range*range;
    const maxRing=Math.min(Math.max(COLS,ROWS),Number.isFinite(range)?Math.ceil(range/CELL)+1:COLS);
    for(let ring=0;ring<=maxRing;ring++) {
      for(let row=Math.max(0,cy-ring);row<=Math.min(ROWS-1,cy+ring);row++) {
        for(let col=Math.max(0,cx-ring);col<=Math.min(COLS-1,cx+ring);col++) {
          if(ring>0 && Math.abs(row-cy)!==ring && Math.abs(col-cx)!==ring)continue;
          for(let id=this.heads[offset+row*COLS+col];id!==-1;id=this.next[id]) {
            const u=units[id];if(u.hp<=0)continue;
            const d=(u.x-x)**2+(u.y-y)**2;
            if(d<best || (d===best && (result===-1||id<result))) {best=d;result=id;}
          }
        }
      }
      // Unvisited cells are at least ring*CELL away (conservative at cell boundaries).
      if(result!==-1 && ring>0 && (ring*CELL-CELL)**2>best)break;
    }
    return result;
  }
}
