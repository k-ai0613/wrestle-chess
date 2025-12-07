import { create } from 'zustand';
import type { GameState, Piece, HexCoord, GameMode, PieceColor, PlayMode, Difficulty } from '../types';
import { coordEquals, hexDistance } from '../utils/hexUtils';
import { checkLinePush, getPushMoveCoords, executePush } from '../utils/pushUtils';
import { getLineupWinner } from '../utils/lineupUtils';
import { getBestMove } from '../utils/aiUtils';

// 座標がボード内か検証
function isValidBoardPosition(coord: HexCoord): boolean {
  return hexDistance(coord, { q: 0, r: 0 }) <= 4;
}

// 移動方向が有効か検証
function isValidDirection(direction: HexCoord): boolean {
  return (
    Math.abs(direction.q) <= 1 &&
    Math.abs(direction.r) <= 1 &&
    Math.abs(direction.q + direction.r) <= 1 &&
    (direction.q !== 0 || direction.r !== 0)
  );
}

// 初期配置を生成
function createInitialPieces(): Piece[] {
  const pieces: Piece[] = [];
  let id = 0;

  // 黒のコマ配置（上側）
  for (let q = 0; q <= 4; q++) {
    pieces.push({ id: `black-${id++}`, color: 'black', position: { q, r: -4 } });
  }
  for (let q = -1; q <= 4; q++) {
    pieces.push({ id: `black-${id++}`, color: 'black', position: { q, r: -3 } });
  }
  for (let q = 0; q <= 2; q++) {
    pieces.push({ id: `black-${id++}`, color: 'black', position: { q, r: -2 } });
  }

  id = 0;
  // 白のコマ配置（下側）
  for (let q = -4; q <= 0; q++) {
    pieces.push({ id: `white-${id++}`, color: 'white', position: { q, r: 4 } });
  }
  for (let q = -4; q <= 1; q++) {
    pieces.push({ id: `white-${id++}`, color: 'white', position: { q, r: 3 } });
  }
  for (let q = -2; q <= 0; q++) {
    pieces.push({ id: `white-${id++}`, color: 'white', position: { q, r: 2 } });
  }

  return pieces;
}

interface GameStore extends GameState {
  selectPiece: (pieceId: string) => void;
  deselectPiece: (pieceId: string) => void;
  clearSelection: () => void;
  movePieces: (to: HexCoord) => void;
  resetGame: () => void;
  setGameMode: (mode: GameMode) => void;
  setPlayMode: (mode: PlayMode) => void;
  setDifficulty: (diff: Difficulty) => void;
  startCpuGame: (difficulty: Difficulty) => void;
  makeCpuMove: () => void;
  getPieceAt: (coord: HexCoord) => Piece | undefined;
  getSelectedPieces: () => Piece[];
  getValidMoves: () => HexCoord[];
}

const initialState: GameState = {
  pieces: createInitialPieces(),
  currentTurn: 'black',
  blackPiecesOut: 0,
  whitePiecesOut: 0,
  gameMode: 'wrestle',
  playMode: 'local',
  difficulty: 'normal',
  winner: null,
  selectedPieceIds: [],
};

export const useGameStore = create<GameStore>((set, get) => ({
  ...initialState,

  selectPiece: (pieceId: string) => {
    const { pieces, currentTurn, playMode, winner } = get();

    // ゲーム終了時は選択不可
    if (winner) return;

    // pieceId形式検証
    if (typeof pieceId !== 'string' || !/^(black|white)-\d+$/.test(pieceId)) return;

    const piece = pieces.find(p => p.id === pieceId);

    // CPUモードで白のターンなら選択不可
    if (playMode === 'cpu' && currentTurn === 'white') return;

    if (!piece || piece.color !== currentTurn) return;
    set({ selectedPieceIds: [pieceId] });
  },

  deselectPiece: (_pieceId: string) => {
    set({ selectedPieceIds: [] });
  },

  clearSelection: () => {
    set({ selectedPieceIds: [] });
  },

  movePieces: (to: HexCoord) => {
    const { pieces, selectedPieceIds, currentTurn, blackPiecesOut, whitePiecesOut, gameMode, winner } = get();

    // ゲーム終了時は移動不可
    if (winner) return;

    if (selectedPieceIds.length === 0) return;

    // 座標検証
    if (!isValidBoardPosition(to)) return;

    const selectedPiece = pieces.find(p => p.id === selectedPieceIds[0]);
    if (!selectedPiece) return;

    // 選択されたピースが現在のターンの色か検証
    if (selectedPiece.color !== currentTurn) return;

    const direction = {
      q: to.q - selectedPiece.position.q,
      r: to.r - selectedPiece.position.r,
    };

    // 方向検証
    if (!isValidDirection(direction)) return;

    const pushResult = checkLinePush(selectedPiece, direction, pieces);
    if (!pushResult.canPush) return;

    const result = executePush(pushResult, pieces);
    let newPieces = result.pieces;
    let newBlackPiecesOut = blackPiecesOut;
    let newWhitePiecesOut = whitePiecesOut;
    let newWinner: PieceColor | null = null;

    for (const pushedOut of pushResult.pushedOutPieces) {
      if (pushedOut.color === 'black') {
        newBlackPiecesOut++;
      } else {
        newWhitePiecesOut++;
      }
    }

    if (gameMode === 'wrestle') {
      if (newBlackPiecesOut >= 6) {
        newWinner = 'white';
      } else if (newWhitePiecesOut >= 6) {
        newWinner = 'black';
      }
    } else if (gameMode === 'lineup') {
      newWinner = getLineupWinner(newPieces);
    }

    const nextTurn = currentTurn === 'black' ? 'white' : 'black';

    set({
      pieces: newPieces,
      currentTurn: nextTurn,
      selectedPieceIds: [],
      blackPiecesOut: newBlackPiecesOut,
      whitePiecesOut: newWhitePiecesOut,
      winner: newWinner,
    });
  },

  makeCpuMove: () => {
    const { pieces, currentTurn, blackPiecesOut, whitePiecesOut, gameMode, difficulty, winner } = get();

    if (winner) return;
    if (currentTurn !== 'white') return;

    const move = getBestMove(pieces, 'white', difficulty);
    if (!move) return;

    const piece = pieces.find(p => p.id === move.pieceId);
    if (!piece) return;

    const pushResult = checkLinePush(piece, move.direction, pieces);
    if (!pushResult.canPush) return;

    const result = executePush(pushResult, pieces);
    let newPieces = result.pieces;
    let newBlackPiecesOut = blackPiecesOut;
    let newWhitePiecesOut = whitePiecesOut;
    let newWinner: PieceColor | null = null;

    for (const pushedOut of pushResult.pushedOutPieces) {
      if (pushedOut.color === 'black') {
        newBlackPiecesOut++;
      } else {
        newWhitePiecesOut++;
      }
    }

    if (gameMode === 'wrestle') {
      if (newBlackPiecesOut >= 6) {
        newWinner = 'white';
      } else if (newWhitePiecesOut >= 6) {
        newWinner = 'black';
      }
    } else if (gameMode === 'lineup') {
      newWinner = getLineupWinner(newPieces);
    }

    set({
      pieces: newPieces,
      currentTurn: 'black',
      selectedPieceIds: [],
      blackPiecesOut: newBlackPiecesOut,
      whitePiecesOut: newWhitePiecesOut,
      winner: newWinner,
    });
  },

  resetGame: () => {
    const { gameMode, playMode, difficulty } = get();
    set({
      ...initialState,
      pieces: createInitialPieces(),
      gameMode,
      playMode,
      difficulty,
    });
  },

  setGameMode: (mode: GameMode) => {
    const { playMode, difficulty } = get();
    set({
      ...initialState,
      pieces: createInitialPieces(),
      gameMode: mode,
      playMode,
      difficulty,
    });
  },

  setPlayMode: (mode: PlayMode) => {
    set({ playMode: mode });
  },

  setDifficulty: (diff: Difficulty) => {
    set({ difficulty: diff });
  },

  startCpuGame: (difficulty: Difficulty) => {
    set({
      ...initialState,
      pieces: createInitialPieces(),
      playMode: 'cpu',
      difficulty,
    });
  },

  getPieceAt: (coord: HexCoord) => {
    const { pieces } = get();
    return pieces.find(p => coordEquals(p.position, coord));
  },

  getSelectedPieces: () => {
    const { pieces, selectedPieceIds } = get();
    return pieces.filter(p => selectedPieceIds.includes(p.id));
  },

  getValidMoves: () => {
    const { pieces, selectedPieceIds } = get();
    if (selectedPieceIds.length === 0) return [];

    const selectedPiece = pieces.find(p => p.id === selectedPieceIds[0]);
    if (!selectedPiece) return [];

    return getPushMoveCoords(selectedPiece, pieces);
  },
}));
