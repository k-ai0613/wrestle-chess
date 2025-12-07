import { create } from 'zustand';

export type OnlineStatus = 'disconnected' | 'connecting' | 'connected' | 'in-room' | 'playing';
export type PlayerColor = 'black' | 'white' | 'spectator' | null;

interface OnlineState {
  status: OnlineStatus;
  roomId: string | null;
  playerColor: PlayerColor;
  opponentConnected: boolean;
  error: string | null;
}

interface OnlineStore extends OnlineState {
  setStatus: (status: OnlineStatus) => void;
  setRoomId: (roomId: string | null) => void;
  setPlayerColor: (color: PlayerColor) => void;
  setOpponentConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState: OnlineState = {
  status: 'disconnected',
  roomId: null,
  playerColor: null,
  opponentConnected: false,
  error: null,
};

export const useOnlineStore = create<OnlineStore>((set) => ({
  ...initialState,

  setStatus: (status: OnlineStatus) => set({ status }),
  setRoomId: (roomId: string | null) => set({ roomId }),
  setPlayerColor: (color: PlayerColor) => set({ playerColor: color }),
  setOpponentConnected: (connected: boolean) => set({ opponentConnected: connected }),
  setError: (error: string | null) => set({ error }),

  reset: () => set(initialState),
}));
