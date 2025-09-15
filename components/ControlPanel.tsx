import React from 'react';
import { Difficulty } from '../types';
import PuzzleUploader from './control-panel/PuzzleUploader';
import DifficultySelector from './control-panel/DifficultySelector';
import ActionButtons from './control-panel/ActionButtons';

interface ControlPanelProps {
  onImageParse: (file: File) => void;
  isParsingImage: boolean;
  error: string | null;
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

const ControlPanel: React.FC<ControlPanelProps> = (props) => {
    const { error, onImageParse, isParsingImage, disabled } = props;

  return (
    <div>
        {error && <p className="error-message">{error}</p>}
        <div className="control-panel">
            <section className="control-section">
                <h3>Upload Puzzle</h3>
                <PuzzleUploader onImageParse={onImageParse} isLoading={isParsingImage} />
            </section>
            <section className="control-section">
                <h3>New Game</h3>
                <DifficultySelector 
                    onNewGame={props.onNewGame}
                    onCustomDifficultyGame={props.onCustomDifficultyGame}
                    onEmptyGridGame={props.onEmptyGridGame}
                    disabled={disabled}
                />
            </section>
            <section className="control-section">
                <h3>Actions</h3>
                <ActionButtons 
                    onSolve={props.onSolve}
                    onHint={props.onHint}
                    onReset={props.onReset}
                    onUndo={props.onUndo}
                    onRedo={props.onRedo}
                    canUndo={props.canUndo}
                    canRedo={props.canRedo}
                    isNoteMode={props.isNoteMode}
                    onToggleNoteMode={props.onToggleNoteMode}
                    disabled={disabled}
                />
            </section>
        </div>
    </div>
  );
};

export default ControlPanel;
