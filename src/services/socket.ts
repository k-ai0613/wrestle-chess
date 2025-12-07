import { io, Socket } from 'socket.io-client';
import type { GameState } from '../types';
import { isValidGameState, isValidRoomId, sanitizeRoomId, isValidPieceColor } from '../utils/validation';

// サーバーURL（開発時はローカル、本番時は環境変数から取得）
const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: false,
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
  }
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
  }
}

// ルーム作成
export function createRoom(
  gameMode: 'wrestle' | 'lineup'
): Promise<{ success: boolean; roomId?: string; color?: string; error?: string }> {
  return new Promise((resolve) => {
    const s = getSocket();
    s.emit('createRoom', gameMode, (response: { success: boolean; roomId?: string; color?: string; error?: string }) => {
      resolve(response);
    });
  });
}

// ルーム参加
export function joinRoom(
  roomId: string
): Promise<{ success: boolean; roomId?: string; color?: string; gameState?: GameState; error?: string }> {
  return new Promise((resolve) => {
    // Room IDをサニタイズ
    const sanitizedRoomId = sanitizeRoomId(roomId);
    if (!isValidRoomId(sanitizedRoomId)) {
      resolve({ success: false, error: 'Invalid room ID format' });
      return;
    }

    const s = getSocket();
    s.emit('joinRoom', sanitizedRoomId, (response: { success: boolean; roomId?: string; color?: string; gameState?: GameState; error?: string }) => {
      // レスポンス検証
      if (response.gameState && !isValidGameState(response.gameState)) {
        resolve({ success: false, error: 'Invalid game state received' });
        return;
      }
      resolve(response);
    });
  });
}

// ゲームモード変更
export function setGameMode(roomId: string, gameMode: 'wrestle' | 'lineup'): void {
  const s = getSocket();
  s.emit('setGameMode', roomId, gameMode);
}

// 移動を送信
export function sendMove(roomId: string, gameState: GameState): void {
  const s = getSocket();
  s.emit('move', roomId, gameState);
}

// ゲームリセット
export function resetGame(roomId: string): void {
  const s = getSocket();
  s.emit('resetGame', roomId);
}

// イベントリスナー登録（受信データ検証付き）
export function onGameStart(callback: (gameState: GameState) => void): void {
  const s = getSocket();
  s.on('gameStart', (data: unknown) => {
    if (isValidGameState(data)) {
      callback(data);
    } else {
      console.error('Invalid gameStart data received');
    }
  });
}

export function onGameStateUpdate(callback: (gameState: GameState) => void): void {
  const s = getSocket();
  s.on('gameStateUpdate', (data: unknown) => {
    if (isValidGameState(data)) {
      callback(data);
    } else {
      console.error('Invalid gameStateUpdate data received');
    }
  });
}

export function onPlayerLeft(callback: (color: 'black' | 'white') => void): void {
  const s = getSocket();
  s.on('playerLeft', (data: unknown) => {
    if (isValidPieceColor(data)) {
      callback(data);
    } else {
      console.error('Invalid playerLeft data received');
    }
  });
}

// イベントリスナー解除
export function offGameStart(): void {
  const s = getSocket();
  s.off('gameStart');
}

export function offGameStateUpdate(): void {
  const s = getSocket();
  s.off('gameStateUpdate');
}

export function offPlayerLeft(): void {
  const s = getSocket();
  s.off('playerLeft');
}
