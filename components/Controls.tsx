import React, { useState } from 'react';
import { Difficulty } from '../types';
import {
  LightBulbIcon,
  SparklesIcon,
  ArrowPathIcon,
  UndoIcon,
  RedoIcon,
  PencilIcon
} from './icons';

interface ControlsProps {
  onSolve: () => void;
  onHint: () => void;
  onReset: () => void;
  onNewGame: (difficulty: Difficulty) => void;
  onEmptyGridGame: (size: number) => void;
  onCustomDifficultyGame: (givens: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled: boolean;
  isNoteMode: boolean;
  onToggleNoteMode: () => void;
}

const Controls: React.FC<ControlsProps> = ({
    onSolve, onHint, onReset, onNewGame, onEmptyGridGame, onCustomDifficultyGame,
    onUndo, onRedo, canUndo, canRedo, disabled, isNoteMode, onToggleNoteMode
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

  const styles: {[key: string]: React.CSSProperties} = {
    controlsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    section: {
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
    },
    buttonGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12
    },
    button: {
        padding: '10px 0',
        borderRadius: 6,
        border: 'none',
        color: 'white',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'opacity 0.2s',
    },
    inputGroup: {
        display: 'flex',
        gap: 8
    },
    input: {
        width: '100%',
        padding: '8px 12px',
        borderRadius: 6,
        border: '1px solid #374151',
        backgroundColor: '#111827',
        color: '#f0f0f0',
        outline: 'none',
    }
  };
  
  const getButtonStyle = (color: string, fullWidth = false): React.CSSProperties => ({
      ...styles.button,
      backgroundColor: color,
      width: fullWidth ? '100%' : 'auto',
  });

  return (
    <div style={styles.controlsContainer}>
        {/* New Game */}
        <div style={styles.section}>
            <div style={{...styles.buttonGrid, gridTemplateColumns: '1fr 1fr 1fr'}}>
                <button style={getButtonStyle('#10b981')} onClick={() => onNewGame('easy')} disabled={disabled}>Easy</button>
                <button style={getButtonStyle('#facc15')} onClick={() => onNewGame('medium')} disabled={disabled}>Medium</button>
                <button style={getButtonStyle('#ef4444')} onClick={() => onNewGame('hard')} disabled={disabled}>Hard</button>
            </div>
        </div>

        {/* Custom Difficulty */}
        <div style={styles.section}>
            <div style={styles.inputGroup}>
                <input style={styles.input} type="number" min="17" max="80" value={customGivens} onChange={(e) => setCustomGivens(e.target.value)} disabled={disabled} placeholder="Givens (17-80)" />
                <button style={getButtonStyle('#8b5cf6')} onClick={handleCustomDifficultyStart} disabled={disabled}>Generate</button>
            </div>
        </div>

        {/* Empty Grid */}
        <div style={styles.section}>
            <div style={styles.inputGroup}>
                <input style={styles.input} type="number" min="4" max="16" value={customSize} onChange={(e) => setCustomSize(e.target.value)} disabled={disabled} placeholder="Size (4-16)" />
                <button style={getButtonStyle('#6366f1')} onClick={handleEmptyGridStart} disabled={disabled}>Start</button>
            </div>
        </div>

        {/* Actions */}
        <div style={styles.section}>
            <div style={styles.buttonGrid}>
                <button style={getButtonStyle('#f59e0b')} onClick={onHint} disabled={disabled}><LightBulbIcon width={16} height={16} style={{display: 'inline', marginRight: 8}} />Hint</button>
                <button style={getButtonStyle('#3b82f6')} onClick={onSolve} disabled={disabled}><SparklesIcon width={16} height={16} style={{display: 'inline', marginRight: 8}} />Solve</button>
                <button style={getButtonStyle('#6b7280')} onClick={onUndo} disabled={disabled || !canUndo}><UndoIcon width={16} height={16} style={{display: 'inline', marginRight: 8}} />Undo</button>
                <button style={getButtonStyle('#6b7280')} onClick={onRedo} disabled={disabled || !canRedo}><RedoIcon width={16} height={16} style={{display: 'inline', marginRight: 8}} />Redo</button>
                <button style={getButtonStyle(isNoteMode ? '#06b6d4' : '#6b7280')} onClick={onToggleNoteMode} disabled={disabled}><PencilIcon width={16} height={16} style={{display: 'inline', marginRight: 8}} />Notes</button>
                <button style={getButtonStyle('#ef4444')} onClick={onReset} disabled={disabled}><ArrowPathIcon width={16} height={16} style={{display: 'inline', marginRight: 8}} />Reset</button>
            </div>
        </div>
    </div>
  );
};

export default Controls;