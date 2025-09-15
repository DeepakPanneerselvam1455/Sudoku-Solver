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
  isNewGame: boolean;
}

const SudokuBoard: React.FC<BoardProps> = ({ grid, selectedCell, onCellSelect, conflicts, isLoading, gridSize, isJustSolved, isNewGame }) => {
  const [hoveredCell, setHoveredCell] = useState<CellPosition | null>(null);
  const selectedValue = selectedCell ? grid[selectedCell.row][selectedCell.col].value : null;
  const { rows: regionRows, cols: regionCols } = getRegionDimensions(gridSize);
  
  const cellSize = 40;
  const gap = 2;
  const boardSize = (cellSize * gridSize) + (gap * (gridSize - 1));

  const gridStyle: CSSProperties = {
    gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
    width: boardSize,
    height: boardSize,
  };

  return (
    <div 
      className={`board-container ${isLoading ? 'loading' : ''}`}
      onMouseLeave={() => setHoveredCell(null)}
    >
       {isLoading && (
        <div className="loading-overlay">
          <div className="spinner"></div>
        </div>
      )}
      <div className="sudoku-grid" style={gridStyle}>
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
                isNewGame={isNewGame}
              />
            );
          })
        )}
      </div>
    </div>
  );
};

export default SudokuBoard;