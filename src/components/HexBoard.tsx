import { useMemo } from 'react';
import type { HexCoord, Piece } from '../types';
import { generateBoardCells, hexToPixel, coordToKey } from '../utils/hexUtils';
import { HexCell } from './HexCell';

interface HexBoardProps {
  pieces: Piece[];
  selectedPieceIds: string[];
  highlightedCells: HexCoord[];
  onCellClick: (coord: HexCoord) => void;
}

const HEX_SIZE = 35;

export function HexBoard({
  pieces,
  selectedPieceIds,
  highlightedCells,
  onCellClick,
}: HexBoardProps) {
  // ボードのセルを生成
  const boardCells = useMemo(() => generateBoardCells(), []);

  // ピースを座標でマップ
  const pieceMap = useMemo(() => {
    const map = new Map<string, Piece>();
    for (const piece of pieces) {
      map.set(coordToKey(piece.position), piece);
    }
    return map;
  }, [pieces]);

  // ハイライトされたセルのセット
  const highlightedSet = useMemo(() => {
    const set = new Set<string>();
    for (const coord of highlightedCells) {
      set.add(coordToKey(coord));
    }
    return set;
  }, [highlightedCells]);

  // 選択されたピースIDのセット
  const selectedSet = useMemo(() => new Set(selectedPieceIds), [selectedPieceIds]);

  // SVGのビューボックスを計算（余白を最小限に）
  const padding = HEX_SIZE * 1;
  const viewBoxSize = HEX_SIZE * 14 + padding * 2;

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`${-viewBoxSize / 2} ${-viewBoxSize / 2} ${viewBoxSize} ${viewBoxSize}`}
      className="max-w-lg mx-auto"
    >
      {/* グラデーション定義 */}
      <defs>
        <radialGradient id="boardGradient" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#2d3748" />
          <stop offset="100%" stopColor="#1a202c" />
        </radialGradient>
        <filter id="boardShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* 背景 */}
      <rect
        x={-viewBoxSize / 2}
        y={-viewBoxSize / 2}
        width={viewBoxSize}
        height={viewBoxSize}
        fill="#111827"
      />

      {/* ボード背景（円形） */}
      <circle
        cx="0"
        cy="0"
        r={HEX_SIZE * 7.5}
        fill="url(#boardGradient)"
        filter="url(#boardShadow)"
      />

      {/* セル */}
      {boardCells.map((coord) => {
        const key = coordToKey(coord);
        const { x, y } = hexToPixel(coord, HEX_SIZE);
        const piece = pieceMap.get(key) || null;
        const isSelected = piece ? selectedSet.has(piece.id) : false;
        const isHighlighted = highlightedSet.has(key);

        return (
          <HexCell
            key={key}
            size={HEX_SIZE}
            x={x}
            y={y}
            piece={piece}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            onClick={() => onCellClick(coord)}
          />
        );
      })}
    </svg>
  );
}
