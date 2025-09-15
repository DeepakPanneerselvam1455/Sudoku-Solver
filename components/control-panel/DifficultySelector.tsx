import React, { useState } from 'react';
import { Difficulty } from '../../types';

interface DifficultySelectorProps {
  onNewGame: (difficulty: Difficulty) => void;
  onEmptyGridGame: (size: number) => void;
  onCustomDifficultyGame: (givens: number) => void;
  disabled: boolean;
}

const DifficultySelector: React.FC<DifficultySelectorProps> = ({
    onNewGame, onEmptyGridGame, onCustomDifficultyGame, disabled
}) => {
  const [customSize, setCustomSize] = useState<string>('9');
  const [customGivens, setCustomGivens] = useState<string>('30');

  const handleEmptyGridStart = () => {
    const size = parseInt(customSize, 10);
    if (!isNaN(size)) {
        onEmptyGridGame(size);
    }
  }
  
  const handleCustomDifficultyStart = () => {
    const givens = parseInt(customGivens, 10);
    if (!isNaN(givens)) {
        onCustomDifficultyGame(givens);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <div className="difficulty-buttons">
            <button className="btn-easy" onClick={() => onNewGame('easy')} disabled={disabled}>Easy</button>
            <button className="btn-medium" onClick={() => onNewGame('medium')} disabled={disabled}>Medium</button>
            <button className="btn-hard" onClick={() => onNewGame('hard')} disabled={disabled}>Hard</button>
        </div>

        <div className="custom-input-group">
            <input className="custom-input" type="number" min="17" max="80" value={customGivens} onChange={(e) => setCustomGivens(e.target.value)} disabled={disabled} placeholder="Givens (17-80)" />
            <button className="btn-generate" onClick={handleCustomDifficultyStart} disabled={disabled}>Generate</button>
        </div>

        <div className="custom-input-group">
            <input className="custom-input" type="number" min="4" max="16" value={customSize} onChange={(e) => setCustomSize(e.target.value)} disabled={disabled} placeholder="Size (4-16)" />
            <button className="btn-start" onClick={handleEmptyGridStart} disabled={disabled}>Start Empty</button>
        </div>
    </div>
  );
};

export default DifficultySelector;
