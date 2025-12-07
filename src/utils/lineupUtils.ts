import type { HexCoord, Piece, PieceColor } from '../types';
import { HEX_DIRECTIONS } from '../types';
import { addCoords, coordEquals } from './hexUtils';

// 指定座標にコマがあるかチェック
function getPieceAt(coord: HexCoord, pieces: Piece[]): Piece | undefined {
  return pieces.find(p => coordEquals(p.position, coord));
}

// 指定方向に連続する同色コマの数を数える
function countInDirection(
  startPos: HexCoord,
  direction: HexCoord,
  color: PieceColor,
  pieces: Piece[]
): number {
  let count = 0;
  let currentPos = addCoords(startPos, direction);

  while (true) {
    const piece = getPieceAt(currentPos, pieces);
    if (!piece || piece.color !== color) {
      break;
    }
    count++;
    currentPos = addCoords(currentPos, direction);
  }

  return count;
}

// 4目並べの勝利判定
// 指定した色のコマが4つ以上連続しているかチェック
export function checkLineup(pieces: Piece[], color: PieceColor): boolean {
  const colorPieces = pieces.filter(p => p.color === color);

  // 各コマを起点に、3方向（+逆方向で6方向をカバー）をチェック
  // 六角形グリッドでは3つの軸がある
  const checkDirections = [
    HEX_DIRECTIONS[0], // q軸方向 (1, 0)
    HEX_DIRECTIONS[1], // 斜め方向 (1, -1)
    HEX_DIRECTIONS[5], // 斜め方向 (0, 1)
  ];

  for (const piece of colorPieces) {
    for (const dir of checkDirections) {
      // 正方向と逆方向の両方を数える
      const reverseDir = { q: -dir.q, r: -dir.r };
      const forwardCount = countInDirection(piece.position, dir, color, pieces);
      const backwardCount = countInDirection(piece.position, reverseDir, color, pieces);

      // 自分自身を含めて4つ以上なら勝利
      const totalCount = 1 + forwardCount + backwardCount;
      if (totalCount >= 4) {
        return true;
      }
    }
  }

  return false;
}

// 勝者を判定（4目並べモード用）
export function getLineupWinner(pieces: Piece[]): PieceColor | null {
  if (checkLineup(pieces, 'black')) {
    return 'black';
  }
  if (checkLineup(pieces, 'white')) {
    return 'white';
  }
  return null;
}
