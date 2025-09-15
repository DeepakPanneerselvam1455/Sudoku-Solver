import React, { useState, useEffect, useCallback } from 'react';
import { Grid, CellPosition, Difficulty, Theme } from './types';
import { solve, getHint, validateBoard } from './services/sudokuSolver';
import { parseSudokuFromImage } from './services/geminiService';
import { generateSudoku, createEmptyGrid as createEmptyNumberGrid } from './services/sudokuGenerator';
import Header from './components/Header';
import SudokuBoard from './components/SudokuBoard';
import ControlPanel from './components/ControlPanel';
import StatsBar from './components/StatsBar';
import SuccessModal from './components/SuccessModal';
import ConfirmModal from './components/ConfirmModal';

const createEmptyGrid = (size: number): Grid => {
    return Array(size).fill(null).map(() => Array(size).fill(null).map(() => ({
        value: 0,
        notes: [],
        isFixed: false
    })));
};

const gridToNumberGrid = (g: Grid): number[][] => {
    return g.map(row => row.map(cell => cell.value));
};

const App: React.FC = () => {
  const [gridSize, setGridSize] = useState<number>(9);
  const [history, setHistory] = useState<Grid[]>([createEmptyGrid(9)]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>(null);
  const [conflicts, setConflicts] = useState<Record<string, boolean>>({});
  const [isParsingImage, setIsParsingImage] = useState<boolean>(false);
  const [isGeneratingPuzzle, setIsGeneratingPuzzle] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [gameStartTime, setGameStartTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [isSolved, setIsSolved] = useState<boolean>(false);
  const [isJustSolved, setIsJustSolved] = useState<boolean>(false);
  const [isSuccessModalDismissed, setIsSuccessModalDismissed] = useState<boolean>(false);
  const [isNoteMode, setIsNoteMode] = useState<boolean>(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isNewGameAnimation, setIsNewGameAnimation] = useState<boolean>(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('sudoku-theme');
    return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'dark';
  });

  const grid = history[historyIndex];
  const initialGrid = history[0];
  const isLoading = isParsingImage || isGeneratingPuzzle;
  
  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem('sudoku-theme', theme);
  }, [theme]);

  useEffect(() => {
    let intervalId: number | null = null;
    if (gameStartTime && !isPaused) {
      intervalId = window.setInterval(() => {
        setElapsedTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [gameStartTime, isPaused]);

  useEffect(() => {
    if (isNewGameAnimation) {
      const timer = setTimeout(() => setIsNewGameAnimation(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isNewGameAnimation]);

  useEffect(() => {
    const gameInProgress = initialGrid.flat().some(cell => cell.value !== 0) || gameStartTime !== null;
    if (!gameInProgress || isSolved || isSuccessModalDismissed) return;

    const isComplete = grid.flat().every(cell => cell.value !== 0);
    const hasNoConflicts = Object.keys(conflicts).length === 0;

    if (isComplete && hasNoConflicts) {
      setIsSolved(true);
      setIsJustSolved(true);
      setTimeout(() => setIsJustSolved(false), 1500);
      setGameStartTime(null);
      setIsPaused(true);
    }
  }, [grid, conflicts, initialGrid, isSolved, isSuccessModalDismissed, gameStartTime]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && gameStartTime && !isPaused) {
        setIsPaused(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [gameStartTime, isPaused]);

  const updateHistory = useCallback((newGrid: Grid) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGrid);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const setCellValue = useCallback((row: number, col: number, value: number) => {
    if (initialGrid[row][col].isFixed) return;

    const newGrid: Grid = JSON.parse(JSON.stringify(grid));
    const cell = newGrid[row][col];
    
    cell.value = cell.value === value ? 0 : value;
    cell.notes = [];

    updateHistory(newGrid);
    setConflicts(validateBoard(gridToNumberGrid(newGrid)));
  }, [grid, initialGrid, updateHistory]);
  
  const toggleNoteValue = useCallback((row: number, col: number, value: number) => {
      if (initialGrid[row][col].isFixed) return;
      const newGrid: Grid = JSON.parse(JSON.stringify(grid));
      const cell = newGrid[row][col];
      if (cell.value !== 0) return;
      const noteIndex = cell.notes.indexOf(value);
      if (noteIndex > -1) {
          cell.notes.splice(noteIndex, 1);
      } else {
          cell.notes.push(value);
          cell.notes.sort((a, b) => a - b);
      }
      updateHistory(newGrid);
  }, [grid, initialGrid, updateHistory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedCell) return;
      const { row, col } = selectedCell;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        const num = parseInt(e.key, 10);
        if (gridSize >= num) {
            if (isNoteMode) {
                toggleNoteValue(row, col, num);
            } else {
                setCellValue(row, col, num);
            }
        }
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
          e.preventDefault();
          if (!isNoteMode) {
              setCellValue(row, col, 0);
          }
      }

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedCell({ row: (row - 1 + gridSize) % gridSize, col });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedCell({ row: (row + 1) % gridSize, col });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedCell({ col: (col - 1 + gridSize) % gridSize, row });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedCell({ col: (col + 1) % gridSize, row });
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, gridSize, isNoteMode, setCellValue, toggleNoteValue]);

  const handleTogglePause = () => {
    if (gameStartTime) {
        setIsPaused(p => !p);
    }
  };

  const resetBoard = (numberGrid: number[][], newSize: number) => {
    const newGridState: Grid = numberGrid.map(row =>
      row.map(value => ({
        value,
        notes: [],
        isFixed: value !== 0,
      }))
    );
    setGridSize(newSize);
    setHistory([newGridState]);
    setHistoryIndex(0);
    setSelectedCell(null);
    setConflicts({});
    setError(null);
    setGameStartTime(Date.now());
    setElapsedTime(0);
    setIsPaused(false);
    setIsSolved(false);
    setIsSuccessModalDismissed(false);
    setIsNoteMode(false);
    setIsNewGameAnimation(true);
  };

  const handleImageParse = async (file: File) => {
    setIsParsingImage(true);
    setError(null);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        try {
          const base64data = (reader.result as string).split(',')[1];
          const result = await parseSudokuFromImage(base64data, file.type);
          if (result) {
            resetBoard(result.grid, result.size);
          } else {
            setError("AI couldn't recognize a valid Sudoku puzzle. Please try a clearer image.");
          }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred during image processing.');
        } finally {
            setIsParsingImage(false);
        }
      };
      reader.onerror = () => {
        setError('Failed to read the image file.');
        setIsParsingImage(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsParsingImage(false);
    }
  };

  const handleNewGame = (difficulty: Difficulty) => {
    setIsGeneratingPuzzle(true);
    setError(null);
    setTimeout(() => {
        try {
            const newGrid = generateSudoku(difficulty);
            resetBoard(newGrid, 9);
        } catch (e) {
            setError("Failed to generate a puzzle. Please try again.");
        } finally {
            setIsGeneratingPuzzle(false);
        }
    }, 50);
  };
  
  const handleCustomDifficultyGame = (givens: number) => {
    if (givens < 17 || givens > 80) {
        setError("Please provide between 17 and 80 given cells.");
        return;
    }
    setIsGeneratingPuzzle(true);
    setError(null);
    setTimeout(() => {
        try {
            const newGrid = generateSudoku({ givens });
            resetBoard(newGrid, 9);
        } catch (e) {
            setError("Failed to generate a puzzle. Please try again.");
        } finally {
            setIsGeneratingPuzzle(false);
        }
    }, 50);
  };

  const handleEmptyGridGame = (size: number) => {
    if (size < 4 || size > 16) {
        setError("Please choose a size between 4 and 16.");
        return;
    }
    setIsGeneratingPuzzle(true);
    setError(null);
    setTimeout(() => {
        try {
            const newGrid = createEmptyNumberGrid(size);
            resetBoard(newGrid, size);
        } catch (e) {
            setError("Failed to generate a puzzle. Please try again.");
        } finally {
            setIsGeneratingPuzzle(false);
        }
    }, 50);
  };

  const handleSolve = useCallback(() => {
    const solution = solve(gridToNumberGrid(initialGrid));
    if (solution) {
      const newGrid = grid.map((row, rIdx) => 
        row.map((cell, cIdx) => ({
            ...cell,
            value: cell.isFixed ? cell.value : solution[rIdx][cIdx],
            notes: []
        }))
      );
      updateHistory(newGrid);
      setSelectedCell(null);
      setConflicts({});
      setGameStartTime(null);
      setIsPaused(true);
      setIsJustSolved(true);
      setTimeout(() => setIsJustSolved(false), 1500);
    } else {
      setError("This puzzle is unsolvable.");
    }
  }, [initialGrid, grid, updateHistory]);

  const handleHint = useCallback(() => {
    const hint = getHint(gridToNumberGrid(grid));
    if (hint) {
      const newGrid: Grid = JSON.parse(JSON.stringify(grid));
      newGrid[hint.row][hint.col].value = hint.value;
      newGrid[hint.row][hint.col].notes = [];
      updateHistory(newGrid);
      setConflicts(validateBoard(gridToNumberGrid(newGrid)));
    } else {
      setError("No more hints available or puzzle is complete!");
    }
  }, [grid, updateHistory]);

  const handleReset = useCallback(() => {
    setHistoryIndex(0);
    setConflicts(validateBoard(gridToNumberGrid(history[0])));
    setSelectedCell(null);
  }, [history]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = useCallback(() => {
    if (canUndo) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setConflicts(validateBoard(gridToNumberGrid(history[newIndex])));
      setSelectedCell(null);
    }
  }, [canUndo, history, historyIndex]);

  const handleRedo = useCallback(() => {
    if (canRedo) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setConflicts(validateBoard(gridToNumberGrid(history[newIndex])));
      setSelectedCell(null);
    }
  }, [canRedo, history, historyIndex]);
  
  const filledCount = grid.flat().filter(cell => cell.value !== 0).length;
  const conflictCount = Object.keys(conflicts).length;

  return (
    <div className="app-container">
       {isSolved && (
        <SuccessModal
          time={elapsedTime}
          onNewGame={(difficulty) => {
            setIsSolved(false);
            handleNewGame(difficulty);
          }}
          onClose={() => {
            setIsSolved(false);
            setIsSuccessModalDismissed(true);
          }}
        />
      )}
      {isResetConfirmOpen && (
        <ConfirmModal
            onConfirm={() => {
                handleReset();
                setIsResetConfirmOpen(false);
            }}
            onCancel={() => setIsResetConfirmOpen(false)}
            title="Reset Puzzle"
        >
            Are you sure you want to reset the board? All current progress will be lost.
        </ConfirmModal>
      )}
      <Header theme={theme} setTheme={setTheme} />
       <StatsBar 
          filledCount={filledCount} 
          conflictCount={conflictCount} 
          elapsedTime={elapsedTime} 
          hasStarted={gameStartTime !== null}
          gridSize={gridSize}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          isSolved={isSolved}
      />
      <main className="main-content">
        <SudokuBoard
            grid={grid}
            selectedCell={selectedCell}
            onCellSelect={setSelectedCell}
            conflicts={conflicts}
            isLoading={isLoading}
            gridSize={gridSize}
            isJustSolved={isJustSolved}
            isNewGame={isNewGameAnimation}
        />
        <ControlPanel
            onImageParse={handleImageParse}
            isParsingImage={isParsingImage}
            error={error}
            onSolve={handleSolve}
            onHint={handleHint}
            onReset={() => setIsResetConfirmOpen(true)}
            onNewGame={handleNewGame}
            onEmptyGridGame={handleEmptyGridGame}
            onCustomDifficultyGame={handleCustomDifficultyGame}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={canUndo}
            canRedo={canRedo}
            disabled={isLoading}
            isNoteMode={isNoteMode}
            onToggleNoteMode={() => setIsNoteMode(prev => !prev)}
        />
      </main>
    </div>
  );
};

export default App;
