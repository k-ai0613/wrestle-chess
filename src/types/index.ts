// Axial座標系（六角形グリッド用）
export interface HexCoord {
  q: number; // 列
  r: number; // 行
}

// コマの色
export type PieceColor = 'black' | 'white';

// コマの状態
export interface Piece {
  id: string;
  color: PieceColor;
  position: HexCoord;
}

// ゲームモード
export type GameMode = 'wrestle' | 'lineup';

// プレイモード
export type PlayMode = 'local' | 'cpu';

// CPU難易度
export type Difficulty = 'easy' | 'normal' | 'hard' | 'expert';

// ゲーム状態
export interface GameState {
  pieces: Piece[];
  currentTurn: PieceColor;
  blackPiecesOut: number;
  whitePiecesOut: number;
  gameMode: GameMode;
  playMode: PlayMode;
  difficulty: Difficulty;
  winner: PieceColor | null;
  selectedPieceIds: string[];
}

// 6方向の定義（Axial座標系）
export const HEX_DIRECTIONS: HexCoord[] = [
  { q: 1, r: 0 },   // 右
  { q: 1, r: -1 },  // 右上
  { q: 0, r: -1 },  // 左上
  { q: -1, r: 0 },  // 左
  { q: -1, r: 1 },  // 左下
  { q: 0, r: 1 },   // 右下
];
