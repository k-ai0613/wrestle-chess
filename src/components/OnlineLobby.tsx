import { useState, useEffect } from 'react';
import { useOnlineStore } from '../store/onlineStore';
import {
  connectSocket,
  disconnectSocket,
  createRoom,
  joinRoom,
  onGameStart,
  onGameStateUpdate,
  onPlayerLeft,
  offGameStart,
  offGameStateUpdate,
  offPlayerLeft,
  getSocket,
} from '../services/socket';
import type { GameState } from '../types';
import { sanitizeRoomId, isValidRoomId } from '../utils/validation';

interface OnlineLobbyProps {
  onGameStart: (gameState: GameState, isOnline: boolean) => void;
  onBackToLocal: () => void;
}

export function OnlineLobby({ onGameStart: handleGameStart, onBackToLocal }: OnlineLobbyProps) {
  const [joinRoomId, setJoinRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const {
    status,
    roomId,
    playerColor,
    error,
    setStatus,
    setRoomId,
    setPlayerColor,
    setOpponentConnected,
    setError,
    reset,
  } = useOnlineStore();

  useEffect(() => {
    // Socket接続
    connectSocket();
    setStatus('connected');

    const socket = getSocket();

    socket.on('connect', () => {
      setStatus('connected');
    });

    socket.on('disconnect', () => {
      setStatus('disconnected');
    });

    // ゲーム開始イベント
    onGameStart((gameState) => {
      setStatus('playing');
      setOpponentConnected(true);
      handleGameStart(gameState, true);
    });

    // ゲーム状態更新
    onGameStateUpdate((gameState) => {
      handleGameStart(gameState, true);
    });

    // プレイヤー退出
    onPlayerLeft((color) => {
      setOpponentConnected(false);
      setError(`${color === 'black' ? 'Black' : 'White'} player left the game`);
    });

    return () => {
      offGameStart();
      offGameStateUpdate();
      offPlayerLeft();
      disconnectSocket();
      reset();
    };
  }, []);

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createRoom('wrestle');
      if (result.success && result.roomId) {
        setRoomId(result.roomId);
        setPlayerColor(result.color as 'black' | 'white');
        setStatus('in-room');
      } else {
        setError(result.error || 'Failed to create room');
      }
    } catch (e) {
      setError('Connection error');
    }

    setIsLoading(false);
  };

  const handleJoinRoom = async () => {
    const sanitized = sanitizeRoomId(joinRoomId);
    if (!isValidRoomId(sanitized)) {
      setError('Invalid room ID (use A-Z, 0-9 only, max 6 chars)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await joinRoom(sanitized);
      if (result.success && result.roomId) {
        setRoomId(result.roomId);
        setPlayerColor(result.color as 'black' | 'white' | 'spectator');
        if (result.gameState) {
          setStatus('playing');
          handleGameStart(result.gameState, true);
        } else {
          setStatus('in-room');
        }
      } else {
        setError(result.error || 'Failed to join room');
      }
    } catch (e) {
      setError('Connection error');
    }

    setIsLoading(false);
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">Online Play</h1>

      {status === 'in-room' && roomId ? (
        // 待機画面
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg text-center">
          <h2 className="text-lg sm:text-xl text-white mb-3">Waiting for opponent...</h2>
          <div className="bg-gray-700 p-3 rounded mb-3">
            <p className="text-gray-400 text-xs sm:text-sm">Room ID:</p>
            <p className="text-xl sm:text-2xl font-mono text-yellow-400">{roomId}</p>
          </div>
          <p className="text-gray-400 text-sm mb-3">
            You: <span className="font-bold text-white">{playerColor}</span>
          </p>
          <p className="text-gray-500 text-xs">Share this ID with your friend</p>
        </div>
      ) : (
        // ロビー画面
        <div className="bg-gray-800 p-4 sm:p-6 rounded-lg w-full max-w-sm sm:max-w-md">
          {/* ルーム作成 */}
          <div className="mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-xl text-white mb-3">Create a Room</h2>
            <button
              onClick={handleCreateRoom}
              disabled={isLoading}
              className="w-full py-2 sm:py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>

          <div className="border-t border-gray-700 my-4"></div>

          {/* ルーム参加 */}
          <div>
            <h2 className="text-lg sm:text-xl text-white mb-3">Join a Room</h2>
            <input
              type="text"
              value={joinRoomId}
              onChange={(e) => setJoinRoomId(sanitizeRoomId(e.target.value))}
              placeholder="Enter Room ID"
              className="w-full p-2 sm:p-3 mb-3 bg-gray-700 text-white rounded font-mono text-center text-lg sm:text-xl"
              maxLength={6}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              onClick={handleJoinRoom}
              disabled={isLoading}
              className="w-full py-2 sm:py-3 bg-green-600 text-white font-bold rounded hover:bg-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && (
        <div className="mt-3 p-3 bg-red-600 text-white text-sm rounded">
          {error}
        </div>
      )}

      {/* 戻るボタン */}
      <button
        onClick={onBackToLocal}
        className="mt-4 sm:mt-6 px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
      >
        Back
      </button>
    </div>
  );
}
