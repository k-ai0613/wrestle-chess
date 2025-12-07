import type { GameState, Piece, HexCoord, PieceColor, GameMode, PlayMode, Difficulty } from '../types';
import { hexDistance } from './hexUtils';

// Room ID検証（英数字のみ、最大6文字）
export function isValidRoomId(roomId: string): boolean {
  if (typeof roomId !== 'string') return false;
  if (roomId.length === 0 || roomId.length > 6) return false;
  return /^[A-Z0-9]+$/.test(roomId);
}

// Room IDをサニタイズ
export function sanitizeRoomId(input: string): string {
  if (typeof input !== 'string') return '';
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
}

// HexCoord検証
export function isValidHexCoord(coord: unknown): coord is HexCoord {
  if (!coord || typeof coord !== 'object') return false;
  const c = coord as Record<string, unknown>;
  if (typeof c.q !== 'number' || typeof c.r !== 'number') return false;
  if (!Number.isInteger(c.q) || !Number.isInteger(c.r)) return false;
  // ボード範囲内か（中心から距離4以内）
  return hexDistance({ q: c.q, r: c.r }, { q: 0, r: 0 }) <= 4;
}

// Piece検証
export function isValidPiece(piece: unknown): piece is Piece {
  if (!piece || typeof piece !== 'object') return false;
  const p = piece as Record<string, unknown>;
  if (typeof p.id !== 'string' || p.id.length === 0 || p.id.length > 20) return false;
  if (p.color !== 'black' && p.color !== 'white') return false;
  if (!isValidHexCoord(p.position)) return false;
  // ID形式チェック（black-X or white-X）
  if (!/^(black|white)-\d+$/.test(p.id)) return false;
  return true;
}

// PieceColor検証
export function isValidPieceColor(color: unknown): color is PieceColor {
  return color === 'black' || color === 'white';
}

// GameMode検証
export function isValidGameMode(mode: unknown): mode is GameMode {
  return mode === 'wrestle' || mode === 'lineup';
}

// PlayMode検証
export function isValidPlayMode(mode: unknown): mode is PlayMode {
  return mode === 'local' || mode === 'cpu';
}

// Difficulty検証
export function isValidDifficulty(diff: unknown): diff is Difficulty {
  return diff === 'easy' || diff === 'normal' || diff === 'hard' || diff === 'expert';
}

// GameState検証
export function isValidGameState(state: unknown): state is GameState {
  if (!state || typeof state !== 'object') return false;
  const s = state as Record<string, unknown>;

  // pieces配列検証
  if (!Array.isArray(s.pieces)) return false;
  if (s.pieces.length > 28) return false; // 最大駒数
  for (const piece of s.pieces) {
    if (!isValidPiece(piece)) return false;
  }

  // 重複座標チェック
  const positions = new Set<string>();
  for (const piece of s.pieces as Piece[]) {
    const key = `${piece.position.q},${piece.position.r}`;
    if (positions.has(key)) return false;
    positions.add(key);
  }

  // currentTurn検証
  if (!isValidPieceColor(s.currentTurn)) return false;

  // 数値フィールド検証
  if (typeof s.blackPiecesOut !== 'number' || s.blackPiecesOut < 0 || s.blackPiecesOut > 14) return false;
  if (typeof s.whitePiecesOut !== 'number' || s.whitePiecesOut < 0 || s.whitePiecesOut > 14) return false;

  // gameMode検証
  if (!isValidGameMode(s.gameMode)) return false;

  // playMode検証
  if (!isValidPlayMode(s.playMode)) return false;

  // difficulty検証
  if (!isValidDifficulty(s.difficulty)) return false;

  // winner検証
  if (s.winner !== null && !isValidPieceColor(s.winner)) return false;

  // selectedPieceIds検証
  if (!Array.isArray(s.selectedPieceIds)) return false;
  for (const id of s.selectedPieceIds) {
    if (typeof id !== 'string') return false;
  }

  return true;
}

// XSS対策：HTML特殊文字をエスケープ
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
