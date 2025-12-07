import type { HexCoord, Piece, PieceColor } from '../types';
import { HEX_DIRECTIONS } from '../types';
import {
  addCoords,
  coordEquals,
  generateBoardCells,
} from './hexUtils';

const BOARD_CELLS = generateBoardCells();

// 座標がボード内かチェック
function isOnBoard(coord: HexCoord): boolean {
  return BOARD_CELLS.some(cell => coordEquals(cell, coord));
}

// 指定座標にコマがあるか取得
function getPieceAt(coord: HexCoord, pieces: Piece[]): Piece | undefined {
  return pieces.find(p => coordEquals(p.position, coord));
}

// プッシュ結果の型
export interface PushResult {
  canPush: boolean;
  pushedOutPieces: Piece[];   // 盤外に押し出されるコマ
  newPositions: Map<string, HexCoord>; // 移動後の位置（pieceId -> newPos）
}

// 指定した方向に列全体を押すことができるかチェックし、結果を返す
export function checkLinePush(
  startPiece: Piece,
  direction: HexCoord,
  allPieces: Piece[]
): PushResult {
  const result: PushResult = {
    canPush: false,
    pushedOutPieces: [],
    newPositions: new Map(),
  };

  const myColor = startPiece.color;

  // 押す方向に沿って全てのコマを収集
  const piecesInLine: Piece[] = [];
  let currentPos = startPiece.position;

  // まず、押す方向の逆側にある自分のコマも含める（連続している場合）
  const reverseDir = { q: -direction.q, r: -direction.r };
  let backPos = addCoords(startPiece.position, reverseDir);
  const backPieces: Piece[] = [];

  while (true) {
    const piece = getPieceAt(backPos, allPieces);
    if (piece && piece.color === myColor) {
      backPieces.unshift(piece);
      backPos = addCoords(backPos, reverseDir);
    } else {
      break;
    }
  }

  // 後ろの自分のコマを追加
  piecesInLine.push(...backPieces);

  // クリックしたコマを追加
  piecesInLine.push(startPiece);

  // 押す方向にあるコマを全て収集
  currentPos = addCoords(startPiece.position, direction);

  while (true) {
    const piece = getPieceAt(currentPos, allPieces);
    if (piece) {
      piecesInLine.push(piece);
      currentPos = addCoords(currentPos, direction);
    } else {
      break;
    }
  }

  // 列の先頭（押す方向の最前列）のコマの次の位置をチェック
  const frontPiece = piecesInLine[piecesInLine.length - 1];
  const frontNextPos = addCoords(frontPiece.position, direction);

  // 先頭の次が盤外なら、先頭のコマが押し出される
  if (!isOnBoard(frontNextPos)) {
    result.canPush = true;
    result.pushedOutPieces.push(frontPiece);

    // 押し出されるコマ以外は1マス前進
    for (let i = 0; i < piecesInLine.length - 1; i++) {
      const piece = piecesInLine[i];
      const newPos = addCoords(piece.position, direction);
      result.newPositions.set(piece.id, newPos);
    }
  } else {
    // 先頭の次が盤内で空いている場合、全員が1マス前進
    result.canPush = true;
    for (const piece of piecesInLine) {
      const newPos = addCoords(piece.position, direction);
      result.newPositions.set(piece.id, newPos);
    }
  }

  return result;
}

// 指定したコマから押せる方向を全て取得
export function getValidPushDirections(
  piece: Piece,
  allPieces: Piece[]
): { direction: HexCoord; pushResult: PushResult }[] {
  const validPushes: { direction: HexCoord; pushResult: PushResult }[] = [];

  for (const direction of HEX_DIRECTIONS) {
    const pushResult = checkLinePush(piece, direction, allPieces);
    if (pushResult.canPush) {
      validPushes.push({ direction, pushResult });
    }
  }

  return validPushes;
}

// 押せる方向の移動先座標を取得
export function getPushMoveCoords(
  piece: Piece,
  allPieces: Piece[]
): HexCoord[] {
  const moves: HexCoord[] = [];
  const validPushes = getValidPushDirections(piece, allPieces);

  for (const { direction } of validPushes) {
    const targetPos = addCoords(piece.position, direction);
    moves.push(targetPos);
  }

  return moves;
}

// プッシュを実行した結果の新しいピース配列を返す
export function executePush(
  pushResult: PushResult,
  allPieces: Piece[]
): { pieces: Piece[]; pushedOutColor: PieceColor | null } {
  let pushedOutColor: PieceColor | null = null;

  const newPieces = allPieces
    .map(piece => {
      const newPos = pushResult.newPositions.get(piece.id);
      if (newPos) {
        return { ...piece, position: newPos };
      }
      return piece;
    })
    .filter(piece => {
      // 盤外に押し出されたコマを除外
      const isPushedOut = pushResult.pushedOutPieces.some(p => p.id === piece.id);
      if (isPushedOut) {
        pushedOutColor = piece.color;
      }
      return !isPushedOut;
    });

  return { pieces: newPieces, pushedOutColor };
}
