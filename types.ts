export interface CellState {
  value: number;
  notes: number[];
  isFixed: boolean;
}

export type Grid = CellState[][];

export interface CellPosition {
  row: number;
  col: number;
}

export type Theme = 'light' | 'dark';

export type Difficulty = 'easy' | 'medium' | 'hard';