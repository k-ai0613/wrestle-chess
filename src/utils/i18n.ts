export type Language = 'ja' | 'en';

interface Translations {
  title: string;
  localPlay: string;
  vsCpu: string;
  onlinePlay: string;
  tagline: string;
  selectDifficulty: string;
  easy: string;
  normal: string;
  hard: string;
  expert: string;
  back: string;
  reset: string;
  menu: string;
  pushOut: string;
  lineUp: string;
  you: string;
  cpu: string;
  black: string;
  white: string;
  blackWins: string;
  whiteWins: string;
  youWin: string;
  cpuWins: string;
  cpuThinking: string;
  moves: string;
  tapPiece: string;
  room: string;
  waiting: string;
  roomId: string;
  shareId: string;
  createRoom: string;
  joinRoom: string;
  creating: string;
  joining: string;
  enterRoomId: string;
  invalidRoomId: string;
  playerLeft: string;
}

const translations: Record<Language, Translations> = {
  ja: {
    title: 'Wrestle Chess',
    localPlay: 'ローカル対戦',
    vsCpu: 'CPU対戦',
    onlinePlay: 'オンライン対戦',
    tagline: '相手のコマを盤外に押し出せ！',
    selectDifficulty: '難易度を選択',
    easy: 'かんたん',
    normal: 'ふつう',
    hard: 'むずかしい',
    expert: 'エキスパート',
    back: '戻る',
    reset: 'リセット',
    menu: 'メニュー',
    pushOut: '押し出し',
    lineUp: '整列',
    you: 'あなた',
    cpu: 'CPU',
    black: '黒',
    white: '白',
    blackWins: '黒の勝利！',
    whiteWins: '白の勝利！',
    youWin: 'あなたの勝利！',
    cpuWins: 'CPUの勝利！',
    cpuThinking: 'CPU思考中...',
    moves: '手',
    tapPiece: 'コマをタップ',
    room: 'ルーム',
    waiting: '対戦相手を待っています...',
    roomId: 'ルームID',
    shareId: 'このIDを友達に共有してください',
    createRoom: 'ルームを作成',
    joinRoom: 'ルームに参加',
    creating: '作成中...',
    joining: '参加中...',
    enterRoomId: 'ルームIDを入力',
    invalidRoomId: '無効なルームID（A-Z, 0-9のみ、最大6文字）',
    playerLeft: 'が退出しました',
  },
  en: {
    title: 'Wrestle Chess',
    localPlay: 'Local Play',
    vsCpu: 'vs CPU',
    onlinePlay: 'Online Play',
    tagline: 'Push your opponent\'s pieces off the board!',
    selectDifficulty: 'Select Difficulty',
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    expert: 'Expert',
    back: 'Back',
    reset: 'Reset',
    menu: 'Menu',
    pushOut: 'Push Out',
    lineUp: 'Line Up',
    you: 'You',
    cpu: 'CPU',
    black: 'Black',
    white: 'White',
    blackWins: 'Black Wins!',
    whiteWins: 'White Wins!',
    youWin: 'You Win!',
    cpuWins: 'CPU Wins!',
    cpuThinking: 'CPU thinking...',
    moves: 'moves',
    tapPiece: 'Tap a piece',
    room: 'Room',
    waiting: 'Waiting for opponent...',
    roomId: 'Room ID',
    shareId: 'Share this ID with your friend',
    createRoom: 'Create Room',
    joinRoom: 'Join Room',
    creating: 'Creating...',
    joining: 'Joining...',
    enterRoomId: 'Enter Room ID',
    invalidRoomId: 'Invalid room ID (A-Z, 0-9 only, max 6 chars)',
    playerLeft: 'left the game',
  },
};

export function getTranslations(lang: Language): Translations {
  return translations[lang];
}

export function detectLanguage(): Language {
  const browserLang = navigator.language.toLowerCase();
  return browserLang.startsWith('ja') ? 'ja' : 'en';
}
