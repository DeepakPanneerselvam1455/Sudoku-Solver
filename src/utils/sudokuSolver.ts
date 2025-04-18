export class SudokuSolver {
  private grid: number[][];

  constructor(grid: number[][]) {
    this.grid = grid;
  }

  isValid(row: number, col: number, num: number): boolean {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (this.grid[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
      if (this.grid[x][col] === num) return false;
    }

    // Check 3x3 box
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.grid[i + startRow][j + startCol] === num) return false;
      }
    }

    return true;
  }

  solve(): boolean {
    let row = 0;
    let col = 0;
    let isEmpty = false;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (this.grid[i][j] === 0) {
          row = i;
          col = j;
          isEmpty = true;
          break;
        }
      }
      if (isEmpty) break;
    }

    if (!isEmpty) return true;

    for (let num = 1; num <= 9; num++) {
      if (this.isValid(row, col, num)) {
        this.grid[row][col] = num;
        if (this.solve()) return true;
        this.grid[row][col] = 0;
      }
    }

    return false;
  }

  getGrid(): number[][] {
    return this.grid;
  }
}