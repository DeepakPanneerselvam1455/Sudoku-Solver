import React from 'react';
import { Difficulty } from '../types';
import { TrophyIcon, ClockIcon } from './icons';

interface SuccessModalProps {
  onNewGame: (difficulty: Difficulty) => void;
  onClose: () => void;
  time: number;
}

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
};

const SuccessModal: React.FC<SuccessModalProps> = ({ onNewGame, onClose, time }) => {
  return (
    <div className="modal-overlay" aria-modal="true" role="dialog">
      <div className="modal-content success-modal">
        
        <TrophyIcon className="modal-icon" style={{ width: 64, height: 64, color: '#facc15' }} />

        <h2 className="modal-title">Congratulations!</h2>
        <p className="modal-subtitle">You've successfully solved the puzzle.</p>
        
        <div className="time-box">
            <ClockIcon style={{ width: 24, height: 24, color: '#60a5fa' }} />
            <span>{formatTime(time)}</span>
        </div>

        <div className="play-again-buttons">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Play Again?</h3>
            <div className="difficulty-grid">
                <button onClick={() => onNewGame('easy')} className="modal-button btn-easy">Easy</button>
                <button onClick={() => onNewGame('medium')} className="modal-button btn-medium">Medium</button>
                <button onClick={() => onNewGame('hard')} className="modal-button btn-hard">Hard</button>
            </div>
            <button onClick={onClose} className="modal-button btn-close">
                Close
            </button>
        </div>

      </div>
    </div>
  );
};

export default SuccessModal;
