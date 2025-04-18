import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import { Brain, PlayCircle } from 'lucide-react';
import { Dropzone } from './components/Dropzone';
import { SudokuGrid } from './components/SudokuGrid';
import { SudokuSolver } from './utils/sudokuSolver';
import { preprocessImage } from './utils/imagePreprocessor';

// Demo puzzle with solution
const demoPuzzle = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [originalGrid, setOriginalGrid] = useState<number[][] | null>(null);
  const [solvedGrid, setSolvedGrid] = useState<number[][] | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [preprocessedImage, setPreprocessedImage] = useState<string | null>(null);

  const loadDemoPuzzle = () => {
    setError(null);
    setUploadedImage(null);
    setPreprocessedImage(null);
    setOriginalGrid(demoPuzzle);
    
    const solver = new SudokuSolver(JSON.parse(JSON.stringify(demoPuzzle)));
    if (solver.solve()) {
      setSolvedGrid(solver.getGrid());
    }
  };

  const processImage = async (file: File) => {
    setLoading(true);
    setError(null);
    setOriginalGrid(null);
    setSolvedGrid(null);
    setPreprocessedImage(null);

    try {
      // Create image URL for display
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // Preprocess the image
      const processedBlob = await preprocessImage(file);
      const processedUrl = URL.createObjectURL(processedBlob);
      setPreprocessedImage(processedUrl);

      // Initialize Tesseract worker with improved settings
      const worker = await createWorker();
      await worker.loadLanguage('eng');
      await worker.initialize('eng');
      
      // Set Tesseract parameters for better number recognition
      await worker.setParameters({
        tessedit_char_whitelist: '123456789',
        tessedit_pageseg_mode: '6', // Assume uniform text block
        tessedit_ocr_engine_mode: '2', // Use neural nets mode
        tessjs_create_pdf: '0',
        tessjs_create_hocr: '0',
        textord_min_linesize: '2.5',
        classify_min_scale: '0.5',
        segment_nonalphabetic_script: '1',
        edges_max_children_per_outline: '40',
        edges_children_count_limit: '45',
        edges_children_per_grandchild: '10',
        tessedit_class_miss_scale: '0.002',
        textord_noise_sizelimit: '0.2',
        textord_noise_normratio: '8',
        edges_boxarea: '0.875',
        edges_max_children_layers: '5',
        textord_underline_threshold: '0.3',
        textord_min_xheight: '5',
        textord_lms_line_trials: '12',
      });

      // Recognize text from processed image with multiple attempts
      let text = '';
      const attempts = 3;
      
      for (let i = 0; i < attempts && text.length < 17; i++) {
        const { data } = await worker.recognize(processedBlob);
        text = data.text;
        
        if (text.length >= 17) break;
        
        // Adjust parameters for next attempt if needed
        await worker.setParameters({
          tessedit_pageseg_mode: String(i + 4), // Try different segmentation modes
          classify_min_scale: String(0.3 + i * 0.2), // Adjust scale sensitivity
        });
      }
      
      await worker.terminate();

      if (text.length < 17) {
        throw new Error('Not enough numbers detected. Please ensure the image is clear and contains a valid Sudoku puzzle.');
      }

      // Process the OCR result into a grid
      const grid = processOCRResult(text);

      // Validate the grid before solving
      if (!isValidGrid(grid)) {
        throw new Error('Invalid Sudoku grid detected. Please check if the numbers are clear and correctly positioned.');
      }

      setOriginalGrid(grid);

      // Solve the Sudoku puzzle
      const solver = new SudokuSolver(JSON.parse(JSON.stringify(grid)));
      const isSolved = solver.solve();

      if (isSolved) {
        const solvedGrid = solver.getGrid();
        if (isValidSolution(solvedGrid, grid)) {
          setSolvedGrid(solvedGrid);
        } else {
          throw new Error('Invalid solution generated. Please check the input puzzle.');
        }
      } else {
        throw new Error('Unable to solve this Sudoku puzzle. Please check if the input is valid.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process the image. Please try again with a clearer image.');
    } finally {
      setLoading(false);
    }
  };

  const processOCRResult = (text: string): number[][] => {
    const grid: number[][] = Array(9).fill(0).map(() => Array(9).fill(0));
    
    // Clean and normalize the text
    const numbers = text
      .replace(/[^1-9\s]/g, '') // Keep only numbers 1-9 and whitespace
      .trim()
      .split(/\s+/) // Split by whitespace
      .filter(n => n.length === 1) // Keep only single digits
      .map(n => parseInt(n));

    // Ensure we have enough numbers
    if (numbers.length < 17) { // Minimum numbers needed for a unique solution
      throw new Error('Not enough numbers detected. Please ensure the image is clear and contains a valid Sudoku puzzle.');
    }

    // Fill the grid
    let index = 0;
    for (let i = 0; i < 9 && index < numbers.length; i++) {
      for (let j = 0; j < 9 && index < numbers.length; j++) {
        if (numbers[index] >= 1 && numbers[index] <= 9) {
          grid[i][j] = numbers[index];
        }
        index++;
      }
    }

    return grid;
  };

  const isValidGrid = (grid: number[][]): boolean => {
    // Check if grid has valid dimensions
    if (grid.length !== 9 || grid.some(row => row.length !== 9)) {
      return false;
    }

    // Check if all numbers are valid
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const num = grid[i][j];
        if (num !== 0 && (num < 1 || num > 9)) {
          return false;
        }
      }
    }

    // Check for conflicts in rows, columns, and boxes
    for (let i = 0; i < 9; i++) {
      const rowNums = new Set();
      const colNums = new Set();
      const boxNums = new Set();

      for (let j = 0; j < 9; j++) {
        // Check row
        if (grid[i][j] !== 0) {
          if (rowNums.has(grid[i][j])) return false;
          rowNums.add(grid[i][j]);
        }

        // Check column
        if (grid[j][i] !== 0) {
          if (colNums.has(grid[j][i])) return false;
          colNums.add(grid[j][i]);
        }

        // Check 3x3 box
        const boxRow = Math.floor(i / 3) * 3 + Math.floor(j / 3);
        const boxCol = (i % 3) * 3 + (j % 3);
        if (grid[boxRow][boxCol] !== 0) {
          if (boxNums.has(grid[boxRow][boxCol])) return false;
          boxNums.add(grid[boxRow][boxCol]);
        }
      }
    }

    return true;
  };

  const isValidSolution = (solution: number[][], original: number[][]): boolean => {
    // Check if solution maintains original numbers
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (original[i][j] !== 0 && original[i][j] !== solution[i][j]) {
          return false;
        }
      }
    }

    // Check if solution is valid
    return isValidGrid(solution) && !solution.some(row => row.includes(0));
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Brain className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Sudoku Solver</h1>
          </div>
          <p className="text-gray-600">
            Upload an image of your Sudoku puzzle and let us solve it!
          </p>
          <button
            onClick={loadDemoPuzzle}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlayCircle className="h-5 w-5" />
            Try Demo Puzzle
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <Dropzone onImageUpload={processImage} />
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Processing your Sudoku puzzle...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {uploadedImage && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Original Image</h2>
            <img
              src={uploadedImage}
              alt="Uploaded Sudoku puzzle"
              className="max-w-full h-auto rounded-lg mb-6"
            />
            {preprocessedImage && (
              <>
                <h2 className="text-xl font-semibold mb-4">Processed Image</h2>
                <img
                  src={preprocessedImage}
                  alt="Processed Sudoku puzzle"
                  className="max-w-full h-auto rounded-lg"
                />
              </>
            )}
          </div>
        )}

        {originalGrid && solvedGrid && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Original Puzzle</h2>
                <SudokuGrid grid={originalGrid} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Solved Puzzle</h2>
                <SudokuGrid grid={solvedGrid} originalGrid={originalGrid} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;