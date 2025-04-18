# Sudoku Solver OCR
This project is a web-based Sudoku solver that uses Optical Character Recognition (OCR) to read Sudoku puzzles from uploaded images and solve them instantly.
🌐 **Live Demo:** [https://fantastic-muffin-05ecd5.netlify.app/](https://fantastic-muffin-05ecd5.netlify.app/)

## Features
- 🧩 Upload an image of a Sudoku puzzle
- 🔍 OCR-powered digit recognition using `tesseract.js`
- ⚡ Instantly solves the puzzle
- 🎯 Intuitive and modern React UI
- 💅 Styled with Tailwind CSS

## Tech Stack
- **React** – UI library
- **Tailwind CSS** – Styling
- **Vite** – Build tool for fast development
- **Tesseract.js** – OCR to detect digits from the uploaded image
- **React Dropzone** – Drag-and-drop image upload

## Installation
1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd sudoku-solver-ocr
   
Install dependencies:
npm install

Start the development server:
npm run dev

Open in browser:
http://localhost:5173

Scripts
Command	Description
npm run dev	Start development server
npm run build	Build for production
npm run preview	Preview production build
npm run lint	Lint the source code

Folder Structure
project/
├── src/                  # Main source code
├── index.html            # App entry HTML
├── package.json          # Project metadata and scripts
├── tailwind.config.js    # Tailwind CSS configuration
└── vite.config.ts        # Vite configuration

License
This project is licensed under the MIT License.
