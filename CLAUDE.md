# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # TypeScript compile + Vite build
npm run lint     # ESLint
npm run preview  # Preview production build
```

No test framework is configured. Verify changes with `npm run build` and `npm run lint`.

## Known Lint Warnings

Two pre-existing lint errors exist for underscore-prefixed unused params (`_isOnline` in App.tsx, `_pieceId` in gameStore.ts). These are intentional interface conformance params.

## Architecture

Wrestle Chess is an Abalone-inspired hexagonal board strategy game. React 19 + TypeScript + Vite + Tailwind CSS v4 + Zustand.

### App Routing

App.tsx uses a state-based router (`appPlayMode`) instead of a router library. All screens are conditionally rendered based on this state: `menu | local | cpu | cpu-select | online-lobby | online-game | privacy | contact | about | howtoplay`.

### Hexagonal Coordinate System

Axial coordinates `{ q, r }` with board radius 4 (61 cells). The 6 directions are defined in `src/types/index.ts` as `HEX_DIRECTIONS`. Flat-top hexagons rendered via SVG.

### State Management

Zustand stores (no providers needed):
- `gameStore.ts` — Game state (pieces, turns, winner, mode). Contains `executeAndJudge` helper for shared push-execution + win-check logic used by both `movePieces` and `makeCpuMove`.
- `onlineStore.ts` — Online session state (roomId, playerColor, connection status).

### Game Logic (src/utils/)

- `pushUtils.ts` — Core push mechanics. `checkLinePush` enforces numerical superiority (own consecutive pieces > opponent's) before allowing a push. Returns `PushResult` with `canPush`, `pushedOutPieces`, and `newPositions`.
- `lineupUtils.ts` — Line-up mode win detection (5 consecutive same-color pieces).
- `hexUtils.ts` — Coordinate math: distance, neighbors, pixel conversion, line detection.
- `aiUtils.ts` — CPU opponent using minimax with alpha-beta pruning. Depth varies by difficulty (easy=1/random, normal=2, hard=3, expert=4).

### Game Modes & Win Conditions

- `wrestle` — Push 6 opponent pieces off the board to win.
- `lineup` — Align 5 pieces in a straight line to win.

### Play Modes

- Local (2 players, same device)
- CPU (black=human, white=CPU; 4 difficulty levels)
- Online (Socket.io room-based via `src/services/socket.ts`)

### i18n

`src/utils/i18n.ts` — `getTranslations(language)` returns a typed `Translations` object. Language auto-detected from browser, toggled via button. All UI components receive `language` as a prop from App.tsx.

### Online Multiplayer

Socket.io client in `src/services/socket.ts`. Server URL via `VITE_SERVER_URL` env variable (defaults to `http://localhost:3001`). Room IDs validated/sanitized via `src/utils/validation.ts`.
