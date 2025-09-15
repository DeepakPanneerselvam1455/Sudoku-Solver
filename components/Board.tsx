import React, { useState, CSSProperties } from 'react';
import { Grid, CellPosition } from '../types';
import Cell from './Cell';
import { getRegionDimensions } from '../services/sudokuSolver';

interface BoardProps {
  grid: Grid;
  selectedCell: CellPosition | null;
  onCellSelect: (pos: CellPosition) => void;
  conflicts: Record<string, boolean>;
  isLoading: boolean;
  gridSize: number;
  isJustSolved: boolean;
  boardAction: 'undo' | 'redo' | 'new-game' | null;
}

const Board: React.FC<BoardProps> = ({ grid, selectedCell, onCellSelect, conflicts, isLoading, gridSize, isJustSolved }) => {
  const [hoveredCell, setHoveredCell] = useState<CellPosition | null>(null);
  const selectedValue = selectedCell ? grid[selectedCell.row][selectedCell.col].value : null;
  const { rows: regionRows, cols: regionCols } = getRegionDimensions(gridSize);
  
  const cellSize = 40;
  const gap = 2;
  const boardSize = (cellSize * gridSize) + (gap * (gridSize - 1));

  const styles: { [key: string]: CSSProperties } = {
    boardContainer: {
      backgroundColor: "#1e293b",
      padding: 10,
      borderRadius: 8,
      boxShadow: "0 0 15px rgba(0,0,0,0.6)",
      position: 'relative',
      width: 'fit-content',
      filter: isLoading ? 'blur(2px)' : 'none',
      pointerEvents: isLoading ? 'none' : 'auto',
      transition: 'filter 0.3s ease-out',
    },
    grid: {
      display: "grid",
      gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
      gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
      gap: `${gap}px`,
      width: boardSize,
      height: boardSize,
    },
    loadingOverlay: {
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        borderRadius: 8,
    },
    spinner: {
        width: 48,
        height: 48,
        border: '4px solid #3b82f6',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    }
  };

  const keyframes = `
    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
  `;

  return (
    <div 
      style={styles.boardContainer}
      onMouseLeave={() => setHoveredCell(null)}
    >
      <style>{keyframes}</style>
       {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.spinner}></div>
        </div>
      )}
      <div style={styles.grid}>
        {grid.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
            
            const isHighlighted =
              selectedCell !== null &&
              !isSelected &&
              (selectedCell.row === rowIndex ||
                selectedCell.col === colIndex ||
                (Math.floor(selectedCell.row / regionRows) === Math.floor(rowIndex / regionRows) &&
                  Math.floor(selectedCell.col / regionCols) === Math.floor(colIndex / regionCols)));
            
            const isHoverHighlighted =
              !isLoading &&
              hoveredCell !== null &&
              !isSelected &&
              (hoveredCell.row === rowIndex ||
                hoveredCell.col === colIndex ||
                (Math.floor(hoveredCell.row / regionRows) === Math.floor(rowIndex / regionRows) &&
                  Math.floor(hoveredCell.col / regionCols) === Math.floor(colIndex / regionCols)));

            const isMatchingValue = selectedValue !== null && selectedValue !== 0 && cell.value === selectedValue && !isSelected;
            
            const cellKey = `${rowIndex}-${colIndex}`;

            return (
              <Cell
                key={cellKey}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                isSelected={isSelected}
                isHighlighted={isHighlighted}
                isHoverHighlighted={isHoverHighlighted}
                isMatchingValue={isMatchingValue}
                isConflict={!!conflicts[cellKey]}
                onSelect={() => onCellSelect({ row: rowIndex, col: colIndex })}
                onMouseEnter={() => !isLoading && setHoveredCell({ row: rowIndex, col: colIndex })}
                gridSize={gridSize}
                isJustSolved={isJustSolved}
                isNewGame={false} 
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Board;