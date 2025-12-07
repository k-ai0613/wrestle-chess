import type { Piece, PieceColor, HexCoord, Difficulty } from '../types';
import { HEX_DIRECTIONS } from '../types';
import { hexDistance } from './hexUtils';
import { checkLinePush, executePush } from './pushUtils';

interface Move {
  pieceId: string;
  direction: HexCoord;
}

// 全ての有効な手を取得
function getAllMoves(pieces: Piece[], color: PieceColor): Move[] {
  const moves: Move[] = [];
  const myPieces = pieces.filter(p => p.color === color);

  for (const piece of myPieces) {
    for (const direction of HEX_DIRECTIONS) {
      const pushResult = checkLinePush(piece, direction, pieces);
      if (pushResult.canPush) {
        moves.push({ pieceId: piece.id, direction });
      }
    }
  }

  return moves;
}

// 手を実行して新しい盤面を返す
function applyMove(pieces: Piece[], move: Move): Piece[] {
  const piece = pieces.find(p => p.id === move.pieceId);
  if (!piece) return pieces;

  const pushResult = checkLinePush(piece, move.direction, pieces);
  if (!pushResult.canPush) return pieces;

  const result = executePush(pushResult, pieces);
  return result.pieces;
}

// 盤面の評価関数
function evaluateBoard(pieces: Piece[], myColor: PieceColor): number {
  const myPieces = pieces.filter(p => p.color === myColor);
  const oppPieces = pieces.filter(p => p.color !== myColor);

  // 駒数の差（最重要）
  const pieceDiff = (myPieces.length - oppPieces.length) * 100;

  // 中央に近いほど有利（押し出されにくい）
  let myPositionScore = 0;
  let oppPositionScore = 0;

  for (const piece of myPieces) {
    const distFromCenter = hexDistance(piece.position, { q: 0, r: 0 });
    myPositionScore += (4 - distFromCenter) * 5; // 中央に近いほど高得点
  }

  for (const piece of oppPieces) {
    const distFromCenter = hexDistance(piece.position, { q: 0, r: 0 });
    oppPositionScore += (4 - distFromCenter) * 5;
  }

  const positionDiff = myPositionScore - oppPositionScore;

  // 端にいる相手の駒（押し出しやすい）
  let edgeThreat = 0;
  for (const piece of oppPieces) {
    const dist = hexDistance(piece.position, { q: 0, r: 0 });
    if (dist >= 4) {
      edgeThreat += 10; // 端にいる相手は押し出しやすい
    }
  }

  return pieceDiff + positionDiff + edgeThreat;
}

// Minimax with Alpha-Beta pruning
function minimax(
  pieces: Piece[],
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  myColor: PieceColor
): number {
  const oppColor: PieceColor = myColor === 'black' ? 'white' : 'black';

  // 終了条件
  if (depth === 0) {
    return evaluateBoard(pieces, myColor);
  }

  const currentColor = isMaximizing ? myColor : oppColor;
  const moves = getAllMoves(pieces, currentColor);

  // 手がない場合は評価値を返す
  if (moves.length === 0) {
    return evaluateBoard(pieces, myColor);
  }

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newPieces = applyMove(pieces, move);
      const evalScore = minimax(newPieces, depth - 1, alpha, beta, false, myColor);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newPieces = applyMove(pieces, move);
      const evalScore = minimax(newPieces, depth - 1, alpha, beta, true, myColor);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

// 難易度に応じた探索深度
function getDepthForDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy': return 1;
    case 'normal': return 2;
    case 'hard': return 3;
    case 'expert': return 4;
    default: return 2;
  }
}

// 最善手を取得
export function getBestMove(
  pieces: Piece[],
  color: PieceColor,
  difficulty: Difficulty
): { pieceId: string; direction: HexCoord } | null {
  const moves = getAllMoves(pieces, color);

  if (moves.length === 0) return null;

  // Easy: ランダム（ただし押し出せる手があれば優先）
  if (difficulty === 'easy') {
    // 押し出せる手を探す
    const pushOutMoves = moves.filter(move => {
      const piece = pieces.find(p => p.id === move.pieceId);
      if (!piece) return false;
      const pushResult = checkLinePush(piece, move.direction, pieces);
      return pushResult.pushedOutPieces.length > 0;
    });

    if (pushOutMoves.length > 0 && Math.random() > 0.5) {
      return pushOutMoves[Math.floor(Math.random() * pushOutMoves.length)];
    }
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // Normal以上: Minimax
  const depth = getDepthForDifficulty(difficulty);
  let bestMove: Move | null = null;
  let bestScore = -Infinity;

  for (const move of moves) {
    const newPieces = applyMove(pieces, move);
    const score = minimax(newPieces, depth - 1, -Infinity, Infinity, false, color);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
