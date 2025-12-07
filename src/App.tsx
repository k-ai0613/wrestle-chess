import { useState, useEffect } from 'react';
import { HexBoard } from './components/HexBoard';
import { OnlineLobby } from './components/OnlineLobby';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { useGameStore } from './store/gameStore';
import { useOnlineStore } from './store/onlineStore';
import type { HexCoord, GameState, Difficulty } from './types';
import { coordEquals } from './utils/hexUtils';
import { sendMove, resetGame as resetOnlineGame } from './services/socket';
import { getTranslations, detectLanguage, type Language } from './utils/i18n';

type AppPlayMode = 'menu' | 'local' | 'cpu' | 'cpu-select' | 'online-lobby' | 'online-game' | 'privacy';

function App() {
  const [appPlayMode, setAppPlayMode] = useState<AppPlayMode>('menu');
  const [onlineGameState, setOnlineGameState] = useState<GameState | null>(null);
  const [language, setLanguage] = useState<Language>(detectLanguage());
  const t = getTranslations(language);

  const {
    pieces,
    selectedPieceIds,
    currentTurn,
    gameMode,
    playMode,
    difficulty,
    winner,
    selectPiece,
    deselectPiece,
    clearSelection,
    getPieceAt,
    getValidMoves,
    movePieces,
    resetGame,
    setGameMode,
    startCpuGame,
    makeCpuMove,
  } = useGameStore();

  const { roomId, playerColor, reset: resetOnlineStore } = useOnlineStore();

  // オンラインゲームの状態を使用
  const isOnline = appPlayMode === 'online-game';
  const isCpu = appPlayMode === 'cpu';
  const displayPieces = isOnline && onlineGameState ? onlineGameState.pieces : pieces;
  const displayCurrentTurn = isOnline && onlineGameState ? onlineGameState.currentTurn : currentTurn;
  const displayGameMode = isOnline && onlineGameState ? onlineGameState.gameMode : gameMode;
  const displayWinner = isOnline && onlineGameState ? onlineGameState.winner : winner;

  // 移動可能先を取得
  const validMoves = getValidMoves();

  // オンラインゲームで自分のターンかどうか
  const isMyTurn = !isOnline || (playerColor === displayCurrentTurn);
  const canPlay = isMyTurn && playerColor !== 'spectator';

  // CPUの手番を実行
  useEffect(() => {
    if (isCpu && currentTurn === 'white' && !winner) {
      const timer = setTimeout(() => {
        makeCpuMove();
      }, 500); // 少し遅延させて自然に見せる
      return () => clearTimeout(timer);
    }
  }, [isCpu, currentTurn, winner, makeCpuMove]);

  const handleCellClick = (coord: HexCoord) => {
    if (displayWinner) return;
    if (isOnline && !canPlay) return;
    if (isCpu && currentTurn === 'white') return; // CPUのターン中は操作不可

    const piece = getPieceAt(coord);

    if (validMoves.some(m => coordEquals(m, coord))) {
      movePieces(coord);

      if (isOnline && roomId) {
        setTimeout(() => {
          const state = useGameStore.getState();
          sendMove(roomId, {
            pieces: state.pieces,
            currentTurn: state.currentTurn,
            blackPiecesOut: state.blackPiecesOut,
            whitePiecesOut: state.whitePiecesOut,
            gameMode: state.gameMode,
            playMode: state.playMode,
            difficulty: state.difficulty,
            winner: state.winner,
            selectedPieceIds: [],
          });
        }, 0);
      }
      return;
    }

    if (piece) {
      if (piece.color === displayCurrentTurn && (piece.color === playerColor || !isOnline)) {
        if (isCpu && piece.color === 'white') return; // CPUの駒は選択不可
        if (selectedPieceIds.includes(piece.id)) {
          deselectPiece(piece.id);
        } else {
          selectPiece(piece.id);
        }
      } else {
        clearSelection();
      }
    } else {
      clearSelection();
    }
  };

  const handleOnlineGameStart = (gameState: GameState, _isOnline: boolean) => {
    setOnlineGameState(gameState);
    setAppPlayMode('online-game');
    useGameStore.setState({
      pieces: gameState.pieces,
      currentTurn: gameState.currentTurn,
      blackPiecesOut: gameState.blackPiecesOut,
      whitePiecesOut: gameState.whitePiecesOut,
      gameMode: gameState.gameMode,
      playMode: gameState.playMode,
      difficulty: gameState.difficulty,
      winner: gameState.winner,
      selectedPieceIds: [],
    });
  };

  const handleBackToMenu = () => {
    setAppPlayMode('menu');
    setOnlineGameState(null);
    resetOnlineStore();
    resetGame();
  };

  const handleResetGame = () => {
    if (isOnline && roomId) {
      resetOnlineGame(roomId);
    } else {
      resetGame();
    }
  };

  const handleStartCpuGame = (diff: Difficulty) => {
    startCpuGame(diff);
    setAppPlayMode('cpu');
  };

  // メニュー画面
  if (appPlayMode === 'menu') {
    return (
      <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
        {/* 言語切替 */}
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setLanguage(language === 'ja' ? 'en' : 'ja')}
            className="px-3 py-1 bg-gray-700 text-white text-sm rounded hover:bg-gray-600"
          >
            {language === 'ja' ? 'EN' : 'JP'}
          </button>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">{t.title}</h1>

        <div className="flex flex-col gap-3 sm:gap-4 w-56 sm:w-64">
          <button
            onClick={() => setAppPlayMode('local')}
            className="py-3 sm:py-4 bg-blue-600 text-white font-bold rounded-lg text-lg sm:text-xl hover:bg-blue-500"
          >
            {t.localPlay}
          </button>
          <button
            onClick={() => setAppPlayMode('cpu-select')}
            className="py-3 sm:py-4 bg-purple-600 text-white font-bold rounded-lg text-lg sm:text-xl hover:bg-purple-500"
          >
            {t.vsCpu}
          </button>
          <button
            onClick={() => setAppPlayMode('online-lobby')}
            className="py-3 sm:py-4 bg-green-600 text-white font-bold rounded-lg text-lg sm:text-xl hover:bg-green-500"
          >
            {t.onlinePlay}
          </button>
        </div>

        <p className="text-gray-500 mt-6 sm:mt-8 text-xs sm:text-sm text-center">
          {t.tagline}
        </p>

        <button
          onClick={() => setAppPlayMode('privacy')}
          className="mt-4 text-gray-500 text-xs underline hover:text-gray-400"
        >
          {language === 'ja' ? 'プライバシーポリシー' : 'Privacy Policy'}
        </button>
      </div>
    );
  }

  // プライバシーポリシー画面
  if (appPlayMode === 'privacy') {
    return (
      <PrivacyPolicy
        onBack={() => setAppPlayMode('menu')}
        language={language}
      />
    );
  }

  // CPU難易度選択画面
  if (appPlayMode === 'cpu-select') {
    return (
      <div className="h-screen bg-gray-900 flex flex-col items-center justify-center p-4 overflow-hidden">
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">{t.selectDifficulty}</h1>

        <div className="flex flex-col gap-2 sm:gap-3 w-48 sm:w-56">
          <button
            onClick={() => handleStartCpuGame('easy')}
            className="py-2 sm:py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-500"
          >
            {t.easy}
          </button>
          <button
            onClick={() => handleStartCpuGame('normal')}
            className="py-2 sm:py-3 bg-yellow-600 text-white font-bold rounded-lg hover:bg-yellow-500"
          >
            {t.normal}
          </button>
          <button
            onClick={() => handleStartCpuGame('hard')}
            className="py-2 sm:py-3 bg-orange-600 text-white font-bold rounded-lg hover:bg-orange-500"
          >
            {t.hard}
          </button>
          <button
            onClick={() => handleStartCpuGame('expert')}
            className="py-2 sm:py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500"
          >
            {t.expert}
          </button>
        </div>

        <button
          onClick={() => setAppPlayMode('menu')}
          className="mt-6 px-4 py-2 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          {t.back}
        </button>
      </div>
    );
  }

  // オンラインロビー
  if (appPlayMode === 'online-lobby') {
    return (
      <OnlineLobby
        onGameStart={handleOnlineGameStart}
        onBackToLocal={handleBackToMenu}
      />
    );
  }

  // ゲーム画面（ローカル & CPU & オンライン共通）
  return (
    <div className="h-screen bg-gray-900 flex flex-col items-center justify-between py-2 px-2 overflow-hidden">
      {/* タイトル */}
      <h1 className="text-xl sm:text-2xl font-bold text-white">{t.title}</h1>

      {/* オンライン情報 */}
      {isOnline && (
        <div className="text-xs">
          <span className="text-gray-400">{t.room}: </span>
          <span className="text-yellow-400 font-mono">{roomId}</span>
          <span className="text-gray-400 ml-2">{t.you}: </span>
          <span className="text-white font-bold">{playerColor}</span>
        </div>
      )}

      {/* CPU情報 */}
      {isCpu && (
        <div className="text-xs text-purple-400">
          vs {t.cpu} ({t[difficulty as keyof typeof t]})
        </div>
      )}

      {/* モード選択（ローカル/CPUのみ） */}
      {!isOnline && (
        <div className="flex gap-1 sm:gap-2">
          <button
            onClick={() => setGameMode('wrestle')}
            className={`px-2 sm:px-3 py-1 rounded text-sm font-bold ${
              displayGameMode === 'wrestle'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {t.pushOut}
          </button>
          <button
            onClick={() => setGameMode('lineup')}
            className={`px-2 sm:px-3 py-1 rounded text-sm font-bold ${
              displayGameMode === 'lineup'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {t.lineUp}
          </button>
        </div>
      )}

      {/* 勝利表示（絵文字なし） */}
      {displayWinner && (
        <div className="winner-banner p-3 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-gray-900 text-xl font-bold rounded-lg shadow-lg">
          <div className="flex items-center justify-center">
            <span>{displayWinner === 'black' ? (isCpu ? t.youWin : t.blackWins) : (isCpu ? t.cpuWins : t.whiteWins)}</span>
          </div>
        </div>
      )}

      {/* ゲーム情報 */}
      {(() => {
        const blackRemaining = displayPieces.filter(p => p.color === 'black').length;
        const whiteRemaining = displayPieces.filter(p => p.color === 'white').length;
        return (
          <div className="flex gap-4 text-white">
            <div className={`w-20 px-2 py-1 rounded flex items-center justify-between ${displayCurrentTurn === 'black' && !displayWinner ? 'bg-yellow-600' : 'bg-gray-700'}`}>
              <span className="text-xs font-bold">{isCpu ? t.you : t.black}</span>
              <span className="text-lg font-mono font-bold">{blackRemaining}</span>
            </div>
            <div className={`w-20 px-2 py-1 rounded flex items-center justify-between ${displayCurrentTurn === 'white' && !displayWinner ? 'bg-yellow-600' : 'bg-gray-700'}`}>
              <span className="text-xs font-bold">{isCpu ? t.cpu : t.white}</span>
              <span className="text-lg font-mono font-bold">{whiteRemaining}</span>
            </div>
          </div>
        );
      })()}

      {/* ボード */}
      <div className="flex-1 w-full max-w-md flex items-center justify-center">
        <div className="w-full aspect-square">
          <HexBoard
            pieces={displayPieces}
            selectedPieceIds={selectedPieceIds}
            highlightedCells={(!isCpu || currentTurn === 'black') ? validMoves : []}
            onCellClick={handleCellClick}
          />
        </div>
      </div>

      {/* 選択情報 */}
      <div className="text-gray-400 text-xs sm:text-sm">
        {isCpu && currentTurn === 'white' && !winner
          ? t.cpuThinking
          : selectedPieceIds.length > 0
          ? `${validMoves.length} ${t.moves}`
          : t.tapPiece}
      </div>

      {/* ボタン */}
      <div className="flex gap-2 sm:gap-4">
        <button
          onClick={handleResetGame}
          className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          {t.reset}
        </button>
        <button
          onClick={handleBackToMenu}
          className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          {t.menu}
        </button>
      </div>
    </div>
  );
}

export default App;
