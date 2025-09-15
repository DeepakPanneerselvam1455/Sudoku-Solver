import { Difficulty } from '../types';

// FIX: Corrected return type from Grid to number[][]
export const createEmptyGrid = (size: number): number[][] => {
    return Array(size).fill(0).map(() => Array(size).fill(0));
}

const shuffle = <T>(array: T[]): T[] => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};

// --- Solver and Uniqueness Check ---
// These functions are specific to 9x9 grids for generation purposes.

// FIX: Changed parameter type from Grid to number[][]
const findEmpty = (grid: number[][]): [number, number] | null => {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (grid[i][j] === 0) {
        return [i, j];
      }
    }
  }
  return null;
};

// FIX: Changed parameter type from Grid to number[][]
const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num || grid[x][col] === num) {
            return false;
        }
    }
    const boxRowStart = Math.floor(row / 3) * 3;
    const boxColStart = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[boxRowStart + i][boxColStart + j] === num) {
                return false;
            }
        }
    }
    return true;
};

// FIX: Changed parameter type from Grid to number[][]
const countSolutionsRecursive = (grid: number[][], count: { value: number }): void => {
    if (count.value > 1) return;

    const emptyPos = findEmpty(grid);
    if (!emptyPos) {
        count.value++;
        return;
    }
    const [row, col] = emptyPos;
    for (let num = 1; num <= 9; num++) {
        if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            countSolutionsRecursive(grid, count);
            if (count.value > 1) {
                grid[row][col] = 0;
                return;
            }
        }
    }
    grid[row][col] = 0; // Backtrack
};

// FIX: Changed parameter type from Grid to number[][]
const hasUniqueSolution = (grid: number[][]): boolean => {
    const gridCopy = JSON.parse(JSON.stringify(grid));
    const count = { value: 0 };
    countSolutionsRecursive(gridCopy, count);
    return count.value === 1;
};

// --- Puzzle Generation ---

// FIX: Changed parameter type from Grid to number[][]
const fillGrid = (grid: number[][]): boolean => {
    const emptyPos = findEmpty(grid);
    if (!emptyPos) {
      return true;
    }
    const [row, col] = emptyPos;
    const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (const num of numbers) {
      if (isValid(grid, row, col, num)) {
        grid[row][col] = num;
        if (fillGrid(grid)) {
          return true;
        }
        grid[row][col] = 0;
      }
    }
    return false;
};

// FIX: Corrected return type from Grid to number[][]
export const generateSudoku = (difficulty: Difficulty | { givens: number }): number[][] => {
  // FIX: Corrected grid type from Grid to number[][]
  const grid: number[][] = createEmptyGrid(9);
  fillGrid(grid);

  let targetGivens: number;
  if (typeof difficulty === 'object') {
    targetGivens = difficulty.givens;
  } else {
    targetGivens = {
      'easy': 40,
      'medium': 32,
      'hard': 25,
    }[difficulty];
  }

  const cells = Array.from({ length: 81 }, (_, i) => ({
    row: Math.floor(i / 9),
    col: i % 9,
  }));
  shuffle(cells);

  let cellsToRemove = 81 - targetGivens;

  for (const cell of cells) {
    if (cellsToRemove <= 0) break;

    const { row, col } = cell;
    const backup = grid[row][col];
    grid[row][col] = 0;

    if (!hasUniqueSolution(grid)) {
      grid[row][col] = backup; // Put it back if solution is not unique
    } else {
      cellsToRemove--;
    }
  }
  
  return grid;
};