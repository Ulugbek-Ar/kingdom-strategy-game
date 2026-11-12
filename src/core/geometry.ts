import { BALANCE as B } from '../config/balance';
import type { Point } from './types';
export function tilePosition(tile: Point): Point { return { x:B.centerX + tile.x * B.tileSize, y:B.centerY + tile.y * B.tileSize }; }
export function sameTile(a: Point | null, b: Point): boolean { return !!a && a.x === b.x && a.y === b.y; }
