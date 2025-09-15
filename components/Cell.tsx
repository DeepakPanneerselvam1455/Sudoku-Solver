import React, { CSSProperties } from 'react';
import { getRegionDimensions } from '../services/sudokuSolver';
import { CellState } from '../types';

interface CellProps {
  cell: CellState;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isHoverHighlighted: boolean;
  isMatchingValue: boolean;
  isConflict: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
  gridSize: number;
  isJustSolved: boolean;
  isNewGame: boolean;
}

const Cell: React.FC<CellProps> = ({ cell, row, col, isSelected, isHighlighted, isHoverHighlighted, isMatchingValue, isConflict, onSelect, onMouseEnter, gridSize, isJustSolved, isNewGame }) => {
  const { rows: regionRows, cols: regionCols } = getRegionDimensions(gridSize);
  
  const getCellClasses = (): string => {
    const classes = ['cell'];
    if (cell.isFixed) classes.push('fixed');
    else if (cell.value !== 0) classes.push('user-input');

    if (isSelected) classes.push('selected');
    if (isConflict && !cell.isFixed) classes.push('conflict');
    if (isMatchingValue) classes.push('matching-value');
    if (isHighlighted) classes.push('highlighted');
    if (isHoverHighlighted) classes.push('hover-highlighted');

    if ((row + 1) % regionRows === 0 && row < gridSize - 1) classes.push('border-bottom');
    if ((col + 1) % regionCols === 0 && col < gridSize - 1) classes.push('border-right');
    if (row % regionRows === 0 && row !== 0) classes.push('border-top');
    if (col % regionCols === 0 && col !== 0) classes.push('border-left');
    
    if ((isJustSolved && !cell.isFixed && cell.value !== 0) || (isNewGame && cell.isFixed)) {
        classes.push('animate-pop');
    }

    return classes.join(' ');
  };

  const cellStyle: CSSProperties = {
    fontSize: gridSize > 9 ? '1rem' : '1.5rem',
    animationDelay: `${(row * gridSize + col) * 10}ms`,
  };

  return (
    <button
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      className={getCellClasses()}
      style={cellStyle}
      aria-label={`Cell R${row + 1} C${col + 1}, value ${cell.value || 'empty'}`}
    >
      {cell.value !== 0 ? (
        <span>{cell.value}</span>
      ) : (
        cell.notes.length > 0 && (
          <div className="note-grid">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="note-item">
                {cell.notes.includes(i + 1) ? i + 1 : ''}
              </div>
            ))}
          </div>
        )
      )}
    </button>
  );
};

export default Cell;
