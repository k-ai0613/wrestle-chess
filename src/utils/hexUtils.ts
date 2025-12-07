import type { HexCoord } from '../types';
import { HEX_DIRECTIONS } from '../types';

// 座標をキー文字列に変換
export function coordToKey(coord: HexCoord): string {
  return `${coord.q},${coord.r}`;
}

// キー文字列を座標に変換
export function keyToCoord(key: string): HexCoord {
  const [q, r] = key.split(',').map(Number);
  return { q, r };
}

// 2つの座標が等しいか
export function coordEquals(a: HexCoord, b: HexCoord): boolean {
  return a.q === b.q && a.r === b.r;
}

// 座標を加算
export function addCoords(a: HexCoord, b: HexCoord): HexCoord {
  return { q: a.q + b.q, r: a.r + b.r };
}

// 隣接する座標を取得
export function getNeighbors(coord: HexCoord): HexCoord[] {
  return HEX_DIRECTIONS.map(dir => addCoords(coord, dir));
}

// 六角形ボードの全セルを生成（Abalone風の形状）
// 半径4の六角形ボード（中央から各方向に4マス）= 61マス
export function generateBoardCells(): HexCoord[] {
  const cells: HexCoord[] = [];
  const radius = 4;

  for (let q = -radius; q <= radius; q++) {
    const r1 = Math.max(-radius, -q - radius);
    const r2 = Math.min(radius, -q + radius);
    for (let r = r1; r <= r2; r++) {
      cells.push({ q, r });
    }
  }

  return cells;
}

// Axial座標からピクセル座標に変換（flat-top hexagon）
export function hexToPixel(coord: HexCoord, size: number): { x: number; y: number } {
  const x = size * (3 / 2 * coord.q);
  const y = size * (Math.sqrt(3) / 2 * coord.q + Math.sqrt(3) * coord.r);
  return { x, y };
}

// 六角形のSVGパスを生成（flat-top）
export function getHexagonPath(size: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i);
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    points.push(`${x},${y}`);
  }
  return points.join(' ');
}

// 座標がボード内かチェック
export function isValidCell(coord: HexCoord, boardCells: HexCoord[]): boolean {
  return boardCells.some(cell => coordEquals(cell, coord));
}

// 2つの座標間の距離を計算
export function hexDistance(a: HexCoord, b: HexCoord): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
}

// 2つの座標が同一直線上にあるかチェック
export function isInLine(a: HexCoord, b: HexCoord): boolean {
  // Axial座標系では、q, r, s(=-q-r)のいずれかが等しければ同一直線上
  const s1 = -a.q - a.r;
  const s2 = -b.q - b.r;
  return a.q === b.q || a.r === b.r || s1 === s2;
}

// 2つの座標間の方向を取得
export function getDirection(from: HexCoord, to: HexCoord): HexCoord | null {
  if (coordEquals(from, to)) return null;

  const dq = to.q - from.q;
  const dr = to.r - from.r;
  const distance = hexDistance(from, to);

  if (distance === 0) return null;

  // 正規化
  const normQ = dq / distance;
  const normR = dr / distance;

  // 6方向のいずれかに一致するか
  for (const dir of HEX_DIRECTIONS) {
    if (dir.q === normQ && dir.r === normR) {
      return dir;
    }
  }

  return null;
}
