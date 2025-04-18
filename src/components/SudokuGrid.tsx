import React from 'react';

interface SudokuGridProps {
  grid: number[][];
  originalGrid?: number[][];
}

export const SudokuGrid: React.FC<SudokuGridProps> = ({ grid, originalGrid }) => {
  return (
    <div className="grid grid-cols-9 gap-[1px] bg-gray-300 p-[1px] max-w-[500px] w-full">
      {grid.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isOriginal = originalGrid?.[rowIndex][colIndex] !== 0;
          const isBorderRight = (colIndex + 1) % 3 === 0 && colIndex !== 8;
          const isBorderBottom = (rowIndex + 1) % 3 === 0 && rowIndex !== 8;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                aspect-square bg-white flex items-center justify-center text-lg font-semibold
                ${isBorderRight ? 'border-r-2 border-gray-400' : ''}
                ${isBorderBottom ? 'border-b-2 border-gray-400' : ''}
                ${isOriginal ? 'text-blue-600' : 'text-green-600'}
              `}
            >
              {cell !== 0 ? cell : ''}
            </div>
          );
        })
      )}
    </div>
  );
};