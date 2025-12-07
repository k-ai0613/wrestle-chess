import type { HexCoord, Piece } from '../types';
import { HEX_DIRECTIONS } from '../types';
import {
  addCoords,
  coordEquals,
  generateBoardCells,
  hexDistance,
  getDirection,
} from './hexUtils';
import { getPushMoves } from './pushUtils';

const BOARD_CELLS = generateBoardCells();

// 座標がボード内かチェック
function isOnBoard(coord: HexCoord): boolean {
  return BOARD_CELLS.some(cell => coordEquals(cell, coord));
}

// 指定座標にコマがあるかチェック
function getPieceAt(coord: HexCoord, pieces: Piece[]): Piece | undefined {
  return pieces.find(p => coordEquals(p.position, coord));
}

// 座標が空かチェック
function isEmpty(coord: HexCoord, pieces: Piece[]): boolean {
  return !getPieceAt(coord, pieces);
}

// 単体コマの移動可能先を取得
export function getSinglePieceMoves(piece: Piece, pieces: Piece[]): HexCoord[] {
  const moves: HexCoord[] = [];

  for (const dir of HEX_DIRECTIONS) {
    const newPos = addCoords(piece.position, dir);
    if (isOnBoard(newPos) && isEmpty(newPos, pieces)) {
      moves.push(newPos);
    }
  }

  return moves;
}

// 選択されたコマが直線上に連続しているかチェック
export function areInLineAndAdjacent(selectedPieces: Piece[]): boolean {
  if (selectedPieces.length <= 1) return true;
  if (selectedPieces.length > 3) return false;

  // 2個の場合
  if (selectedPieces.length === 2) {
    const dist = hexDistance(selectedPieces[0].position, selectedPieces[1].position);
    return dist === 1;
  }

  // 3個の場合：すべて直線上で連続している必要がある
  const positions = selectedPieces.map(p => p.position);

  // すべてのペアが同一直線上にあるか
  const dir01 = getDirection(positions[0], positions[1]);
  const dir02 = getDirection(positions[0], positions[2]);
  const dir12 = getDirection(positions[1], positions[2]);

  if (!dir01 || !dir02 || !dir12) return false;

  // 同一直線上かチェック
  const isSameLine = (
    (coordEquals(dir01, dir02) || coordEquals(dir01, { q: -dir02.q, r: -dir02.r })) &&
    (coordEquals(dir01, dir12) || coordEquals(dir01, { q: -dir12.q, r: -dir12.r }))
  );

  if (!isSameLine) return false;

  // 連続しているか（隙間がないか）
  const distances = [
    hexDistance(positions[0], positions[1]),
    hexDistance(positions[1], positions[2]),
    hexDistance(positions[0], positions[2]),
  ];
  distances.sort((a, b) => a - b);

  // 連続している場合: 1, 1, 2 または 1, 2 のパターン
  return distances[0] === 1 && distances[1] === 1 && distances[2] === 2;
}

// 直線移動（Inline Move）の移動可能先を取得
// 選択されたコマを直線方向に1マス移動
export function getInlineMovesForGroup(selectedPieces: Piece[], allPieces: Piece[]): HexCoord[] {
  if (selectedPieces.length === 0) return [];
  if (selectedPieces.length === 1) return getSinglePieceMoves(selectedPieces[0], allPieces);
  if (!areInLineAndAdjacent(selectedPieces)) return [];

  const moves: HexCoord[] = [];
  const positions = selectedPieces.map(p => p.position);

  // コマの並び順を取得（端から端へ）
  // 任意の2点間の方向を取得
  const dir = getDirection(positions[0], positions[1]);
  if (!dir) return [];

  // 両端のコマを見つける
  let head = positions[0];
  let tail = positions[0];

  // 方向に沿って最も進んでいるのがhead
  let headNext = addCoords(head, dir);
  while (positions.some(p => coordEquals(p, headNext))) {
    head = headNext;
    headNext = addCoords(head, dir);
  }
  // 逆方向に最も進んでいるのがtail
  const reverseDir = { q: -dir.q, r: -dir.r };
  let tailNext = addCoords(tail, reverseDir);
  while (positions.some(p => coordEquals(p, tailNext))) {
    tail = tailNext;
    tailNext = addCoords(tail, reverseDir);
  }

  // head方向への移動
  const headMove = addCoords(head, dir);
  if (isOnBoard(headMove) && isEmpty(headMove, allPieces)) {
    moves.push(headMove);
  }

  // tail方向への移動
  const tailDir = { q: -dir.q, r: -dir.r };
  const tailMove = addCoords(tail, tailDir);
  if (isOnBoard(tailMove) && isEmpty(tailMove, allPieces)) {
    moves.push(tailMove);
  }

  return moves;
}

// 並行移動（Broadside Move）の移動可能先を取得
// 選択されたコマを横方向（直線に対して垂直）に1マス移動
export function getBroadsideMovesForGroup(selectedPieces: Piece[], allPieces: Piece[]): HexCoord[] {
  if (selectedPieces.length <= 1) return [];
  if (!areInLineAndAdjacent(selectedPieces)) return [];

  const moves: HexCoord[] = [];
  const positions = selectedPieces.map(p => p.position);

  // コマの並びの方向
  const lineDir = getDirection(positions[0], positions[1]);
  if (!lineDir) return [];

  // 並行移動は、直線方向以外の4方向
  for (const dir of HEX_DIRECTIONS) {
    // 直線方向と同じまたは逆方向はスキップ
    if (coordEquals(dir, lineDir) || coordEquals(dir, { q: -lineDir.q, r: -lineDir.r })) {
      continue;
    }

    // すべてのコマが移動可能かチェック
    let canMove = true;
    for (const pos of positions) {
      const newPos = addCoords(pos, dir);
      if (!isOnBoard(newPos) || !isEmpty(newPos, allPieces)) {
        canMove = false;
        break;
      }
    }

    if (canMove) {
      // 代表として最初のコマの移動先を返す
      moves.push(addCoords(positions[0], dir));
    }
  }

  return moves;
}

// 全ての有効な移動先を取得
export function getAllValidMoves(selectedPieces: Piece[], allPieces: Piece[]): HexCoord[] {
  if (selectedPieces.length === 0) return [];

  if (selectedPieces.length === 1) {
    return getSinglePieceMoves(selectedPieces[0], allPieces);
  }

  // 複数選択の場合
  const inlineMoves = getInlineMovesForGroup(selectedPieces, allPieces);
  const broadsideMoves = getBroadsideMovesForGroup(selectedPieces, allPieces);

  // プッシュ移動を追加
  const pushMovesData = getPushMoves(selectedPieces, allPieces);
  const pushMoves = pushMovesData.map(pm => pm.coord);

  // 重複を除去
  const allMoves = [...inlineMoves];
  for (const move of broadsideMoves) {
    if (!allMoves.some(m => coordEquals(m, move))) {
      allMoves.push(move);
    }
  }
  for (const move of pushMoves) {
    if (!allMoves.some(m => coordEquals(m, move))) {
      allMoves.push(move);
    }
  }

  return allMoves;
}

// 移動を実行した結果の新しいピース配列を返す
export function executeMove(
  selectedPieces: Piece[],
  targetCoord: HexCoord,
  allPieces: Piece[]
): Piece[] {
  if (selectedPieces.length === 0) return allPieces;

  const selectedIds = new Set(selectedPieces.map(p => p.id));

  if (selectedPieces.length === 1) {
    // 単体移動
    return allPieces.map(p => {
      if (p.id === selectedPieces[0].id) {
        return { ...p, position: targetCoord };
      }
      return p;
    });
  }

  // 複数コマの移動
  const positions = selectedPieces.map(p => p.position);

  // Inline移動かBroadside移動かを判定
  const lineDir = getDirection(positions[0], positions[1]);
  if (!lineDir) return allPieces;

  // targetCoordがInline移動の結果かチェック
  const inlineMoves = getInlineMovesForGroup(selectedPieces, allPieces);
  const isInline = inlineMoves.some(m => coordEquals(m, targetCoord));

  if (isInline) {
    // Inline移動：全てのコマを同じ方向に移動
    // targetCoordへの方向を計算
    let moveDir: HexCoord | null = null;

    // 各端からtargetCoordへの方向をチェック
    for (const pos of positions) {
      const dir = getDirection(pos, targetCoord);
      if (dir && hexDistance(pos, targetCoord) === 1) {
        // 隣接していなくても、方向が一致すれば良い
      }
      // targetCoordが隣接するコマを探す
      const testDir = {
        q: targetCoord.q - pos.q,
        r: targetCoord.r - pos.r,
      };
      if (Math.abs(testDir.q) <= 1 && Math.abs(testDir.r) <= 1 &&
          Math.abs(testDir.q + testDir.r) <= 1 &&
          (testDir.q !== 0 || testDir.r !== 0)) {
        moveDir = testDir;
        break;
      }
    }

    if (!moveDir) {
      // 端のコマから方向を判定
      for (const dir of HEX_DIRECTIONS) {
        const endPos = positions.reduce((farthest, pos) => {
          const next = addCoords(pos, dir);
          if (!positions.some(p => coordEquals(p, next))) {
            return pos;
          }
          return farthest;
        }, positions[0]);

        if (coordEquals(addCoords(endPos, dir), targetCoord)) {
          moveDir = dir;
          break;
        }
      }
    }

    if (!moveDir) return allPieces;

    return allPieces.map(p => {
      if (selectedIds.has(p.id)) {
        return { ...p, position: addCoords(p.position, moveDir!) };
      }
      return p;
    });
  } else {
    // Broadside移動：全てのコマを同じ方向に移動
    // 最初のコマの移動先から方向を計算
    const moveDir = {
      q: targetCoord.q - positions[0].q,
      r: targetCoord.r - positions[0].r,
    };

    return allPieces.map(p => {
      if (selectedIds.has(p.id)) {
        return { ...p, position: addCoords(p.position, moveDir) };
      }
      return p;
    });
  }
}
