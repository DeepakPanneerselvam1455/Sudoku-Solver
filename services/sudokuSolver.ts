// FIX: Removed unused Grid import as all functions now use number[][]
// import { Grid } from '../types';

export const getRegionDimensions = (size: number): { rows: number; cols: number } => {
    if (size <= 0) return { rows: 0, cols: 0 };
    const sqrt = Math.sqrt(size);
    if (Number.isInteger(sqrt)) {
      return { rows: sqrt, cols: sqrt }; // For perfect squares like 4x4, 9x9
    }
    // For non-perfect squares like 6x6, find factors close to sqrt
    const start = Math.floor(sqrt);
    for (let i = start; i > 1; i--) {
      if (size % i === 0) {
        return { rows: i, cols: size / i };
      }
    }
    // Default for prime-sized grids, though not typical for Sudoku
    return { rows: 1, cols: size };
};

// FIX: Changed parameter type from Grid to number[][]
const findEmpty = (grid: number[][]): [number, number] | null => {
  const size = grid.length;
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (grid[i][j] === 0) {
        return [i, j];
      }
    }
  }
  return null;
};

// FIX: Changed parameter type from Grid to number[][]
const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
  const size = grid.length;

  // Check row
  for (let x = 0; x < size; x++) {
    if (grid[row][x] === num && x !== col) {
      return false;
    }
  }

  // Check column
  for (let x = 0; x < size; x++) {
    if (grid[x][col] === num && x !== row) {
      return false;
    }
  }

  // Check region
  const { rows: regionRows, cols: regionCols } = getRegionDimensions(size);
  const boxRowStart = Math.floor(row / regionRows) * regionRows;
  const boxColStart = Math.floor(col / regionCols) * regionCols;
  for (let i = 0; i < regionRows; i++) {
    for (let j = 0; j < regionCols; j++) {
      if (grid[boxRowStart + i][boxColStart + j] === num && (boxRowStart + i !== row || boxColStart + j !== col)) {
        return false;
      }
    }
  }

  return true;
};

// FIX: Changed parameter and return types from Grid to number[][]
export const solve = (grid: number[][]): number[][] | null => {
  const size = grid.length;
  const gridCopy: number[][] = JSON.parse(JSON.stringify(grid));

  const solver = (): boolean => {
    const emptyPos = findEmpty(gridCopy);
    if (!emptyPos) {
      return true; // Puzzle solved
    }
    const [row, col] = emptyPos;

    for (let num = 1; num <= size; num++) {
      if (isValid(gridCopy, row, col, num)) {
        gridCopy[row][col] = num;
        if (solver()) {
          return true;
        }
        gridCopy[row][col] = 0; // Backtrack
      }
    }
    return false;
  };

  if (solver()) {
    return gridCopy;
  }
  return null; // Unsolvable
};

// FIX: Changed parameter type from Grid to number[][]
export const getHint = (grid: number[][]): { row: number, col: number, value: number } | null => {
    const emptyPos = findEmpty(grid);
    if (!emptyPos) return null;

    const [row, col] = emptyPos;
    const solution = solve(grid);
    if (solution) {
        return { row, col, value: solution[row][col] };
    }

    return null;
};

// FIX: Changed parameter type from Grid to number[][]
export const validateBoard = (grid: number[][]): Record<string, boolean> => {
    const conflicts: Record<string, boolean> = {};
    const size = grid.length;
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const val = grid[r][c];
            if (val !== 0) {
                if (!isValid(grid, r, c, val)) {
                    conflicts[`${r}-${c}`] = true;
                }
            }
        }
    }
    return conflicts;
};