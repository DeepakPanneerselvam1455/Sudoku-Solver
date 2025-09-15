import React from 'react';
import {
  LightBulbIcon,
  SparklesIcon,
  ArrowPathIcon,
  UndoIcon,
  RedoIcon,
  PencilIcon
} from '../icons';

interface ActionButtonsProps {
  onSolve: () => void;
  onHint: () => void;
  onReset: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  disabled: boolean;
  isNoteMode: boolean;
  onToggleNoteMode: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    onSolve, onHint, onReset, onUndo, onRedo, canUndo, canRedo,
    disabled, isNoteMode, onToggleNoteMode
}) => {

  return (
    <div className="action-buttons">
        <button className="btn-hint" onClick={onHint} disabled={disabled}><LightBulbIcon />Hint</button>
        <button className="btn-solve" onClick={onSolve} disabled={disabled}><SparklesIcon />Solve</button>
        <button className="btn-undo" onClick={onUndo} disabled={disabled || !canUndo}><UndoIcon />Undo</button>
        <button className="btn-redo" onClick={onRedo} disabled={disabled || !canRedo}><RedoIcon />Redo</button>
        <button className={`btn-notes ${isNoteMode ? 'active' : ''}`} onClick={onToggleNoteMode} disabled={disabled}><PencilIcon />Notes</button>
        <button className="btn-reset" onClick={onReset} disabled={disabled}><ArrowPathIcon />Reset</button>
    </div>
  );
};

export default ActionButtons;
