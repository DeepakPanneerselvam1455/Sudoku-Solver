import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

// FIX: Changed the return type from Promise<{ grid: Grid, size: number } | null> to Promise<{ grid: number[][], size: number } | null>
// The Gemini service returns a simple 2D array of numbers, not the complex CellState object array.
export async function parseSudokuFromImage(base64ImageData: string, mimeType: string): Promise<{ grid: number[][], size: number } | null> {
  try {
    const model = 'gemini-2.5-flash';
    
    const imagePart = {
      inlineData: {
        mimeType: mimeType,
        data: base64ImageData,
      },
    };

    const textPart = {
      text: "You are an expert Sudoku puzzle recognizer. Your task is to analyze the provided image, identify the grid size (e.g., 4x4, 6x6, 9x9), and extract the numbers. The output MUST be a JSON object containing a 'size' key and a 'grid' key. 'size' must be an integer for the grid dimension (e.g., 9 for a 9x9 grid). 'grid' MUST be a 2D array of 'size' x 'size', containing integers from 0 to 'size'. Use 0 for empty or unreadable cells. It is crucial that the grid dimensions are correct."
    };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            size: {
              type: Type.INTEGER,
            },
            grid: {
              type: Type.ARRAY,
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.INTEGER,
                },
              },
            },
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);
    
    let result: { grid: any; size: any } | null = null;
    if (parsedData && typeof parsedData === 'object' && 'grid' in parsedData && 'size' in parsedData) {
        result = parsedData;
    } else if (Array.isArray(parsedData) && parsedData.length > 0 && 'grid' in parsedData[0] && 'size' in parsedData[0]) {
        result = parsedData[0];
    }
    
    // FIX: Updated the cast to reflect the correct grid type: number[][]
    if (result && result.grid && typeof result.size === 'number' && Array.isArray(result.grid) && result.grid.length === result.size && result.grid.every((row: any) => Array.isArray(row) && row.length === result.size)) {
      return result as { grid: number[][], size: number };
    } else {
      console.error("Parsed JSON does not match expected Sudoku structure:", JSON.stringify(parsedData, null, 2));
      return null;
    }

  } catch (error) {
    console.error("Error parsing Sudoku from image:", error);
    throw new Error("Failed to communicate with the AI model. Please check your API key and try again.");
  }
}