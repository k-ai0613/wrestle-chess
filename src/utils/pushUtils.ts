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
  const opponentColor: PieceColor = myColor === 'black' ? 'white' : 'black';

  // 1. 押す方向の逆側にある連続した自分のコマを収集
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

  // 自分のコマ列: 後方 + クリックしたコマ
  const myPieces: Piece[] = [...backPieces, startPiece];

  // 2. 押す方向の前方にある連続した自分のコマも追加
  let forwardPos = addCoords(startPiece.position, direction);
  while (true) {
    const piece = getPieceAt(forwardPos, allPieces);
    if (piece && piece.color === myColor) {
      myPieces.push(piece);
      forwardPos = addCoords(forwardPos, direction);
    } else {
      break;
    }
  }

  // 3. 前方の自分のコマの先にある連続した相手のコマを収集
  const opponentPieces: Piece[] = [];
  let checkPos = forwardPos; // myPiecesの次の位置から開始
  while (true) {
    const piece = getPieceAt(checkPos, allPieces);
    if (piece && piece.color === opponentColor) {
      opponentPieces.push(piece);
      checkPos = addCoords(checkPos, direction);
    } else {
      break;
    }
  }

  const myCount = myPieces.length;
  const opponentCount = opponentPieces.length;

  if (opponentCount === 0) {
    // 相手のコマがない場合: 前方が空きマスなら移動可能
    const frontNextPos = forwardPos; // 自分のコマ列の次の位置
    if (isOnBoard(frontNextPos)) {
      result.canPush = true;
      for (const piece of myPieces) {
        const newPos = addCoords(piece.position, direction);
        result.newPositions.set(piece.id, newPos);
      }
    }
    // 前方が盤外の場合は移動不可（自分のコマを押し出すことはない）
  } else {
    // 相手のコマがある場合: 数の優位性チェック
    if (myCount <= opponentCount) {
      // 自分の数が相手以下なら押せない
      return result;
    }

    // 相手列の先頭の次の位置をチェック
    const beyondOpponent = checkPos; // 相手コマ列の次の位置
    const allPiecesInLine = [...myPieces, ...opponentPieces];

    if (!isOnBoard(beyondOpponent)) {
      // 相手列の先頭が盤外に押し出される
      result.canPush = true;
      const lastOpponent = opponentPieces[opponentPieces.length - 1];
      result.pushedOutPieces.push(lastOpponent);

      // 押し出されるコマ以外は1マス前進
      for (const piece of allPiecesInLine) {
        if (piece.id !== lastOpponent.id) {
          const newPos = addCoords(piece.position, direction);
          result.newPositions.set(piece.id, newPos);
        }
      }
    } else if (!getPieceAt(beyondOpponent, allPieces)) {
      // 相手列の先に空きマスがある場合: 全員1マス前進
      result.canPush = true;
      for (const piece of allPiecesInLine) {
        const newPos = addCoords(piece.position, direction);
        result.newPositions.set(piece.id, newPos);
      }
    }
    // 相手列の先にさらにコマがある場合は押せない
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
