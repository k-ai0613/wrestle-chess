import type { Piece } from '../types';
import { getHexagonPath } from '../utils/hexUtils';

interface HexCellProps {
  size: number;
  x: number;
  y: number;
  piece: Piece | null;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: () => void;
}

export function HexCell({
  size,
  x,
  y,
  piece,
  isSelected,
  isHighlighted,
  onClick,
}: HexCellProps) {
  const hexPath = getHexagonPath(size * 0.95);

  // セルの色を決定
  let fillColor = '#374151'; // 通常のセル色（より暗いグレー）
  let strokeColor = '#1f2937';
  let strokeWidth = 1.5;

  if (isHighlighted) {
    fillColor = '#065f46'; // 移動可能先（深緑）
    strokeColor = '#10b981';
    strokeWidth = 2;
  }
  if (isSelected) {
    fillColor = '#92400e'; // 選択中（オレンジブラウン）
    strokeColor = '#f59e0b';
    strokeWidth = 2.5;
  }

  // コマのグラデーション風カラー
  const pieceColor = piece?.color === 'black'
    ? { main: '#1f2937', highlight: '#374151', stroke: '#4b5563' }
    : { main: '#e5e7eb', highlight: '#f9fafb', stroke: '#9ca3af' };

  return (
    <g
      transform={`translate(${x}, ${y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
      className="hex-cell"
    >
      {/* 六角形セル */}
      <polygon
        points={hexPath}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        style={{
          transition: 'fill 0.15s ease, stroke 0.15s ease',
        }}
      />

      {/* ハイライト時のパルスエフェクト */}
      {isHighlighted && (
        <polygon
          points={getHexagonPath(size * 0.7)}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
          opacity="0.6"
          style={{
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}

      {/* コマ */}
      {piece && (
        <g style={{
          transition: 'transform 0.2s ease',
          transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        }}>
          {/* コマの影 */}
          <ellipse
            cx="2"
            cy="4"
            rx={size * 0.55}
            ry={size * 0.3}
            fill="rgba(0,0,0,0.3)"
          />
          {/* コマ本体 */}
          <circle
            cx="0"
            cy="0"
            r={size * 0.55}
            fill={pieceColor.main}
            stroke={pieceColor.stroke}
            strokeWidth="2"
          />
          {/* コマのハイライト */}
          <circle
            cx={-size * 0.15}
            cy={-size * 0.15}
            r={size * 0.2}
            fill={pieceColor.highlight}
            opacity="0.4"
          />
          {/* 選択時のリング */}
          {isSelected && (
            <circle
              cx="0"
              cy="0"
              r={size * 0.65}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              opacity="0.8"
              style={{
                animation: 'spin 2s linear infinite',
                strokeDasharray: '10 5',
              }}
            />
          )}
        </g>
      )}
    </g>
  );
}
