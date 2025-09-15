import React from 'react';
import { ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, PauseIcon, PlayIcon } from './icons';

interface StatsBarProps {
  filledCount: number;
  conflictCount: number;
  elapsedTime: number;
  hasStarted: boolean;
  gridSize: number;
  isPaused: boolean;
  onTogglePause: () => void;
  isSolved: boolean;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};


const StatsBar: React.FC<StatsBarProps> = ({ filledCount, conflictCount, elapsedTime, hasStarted, gridSize, isPaused, onTogglePause, isSolved }) => {
  if (!hasStarted) return null;

  const pauseResumeButton = (
    <button 
      onClick={onTogglePause} 
      className="pause-button"
      aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
      disabled={isSolved}
    >
        {isPaused ? <PlayIcon style={{color: '#22c55e'}} /> : <PauseIcon style={{color: '#eab308'}} />}
    </button>
  );

  return (
    <div className="stats-bar">
        <div className="stats-bar-item">
            <ClockIcon style={{color: '#60a5fa'}} />
            <span>{formatTime(elapsedTime)}</span>
            {pauseResumeButton}
        </div>
        <div className="stats-bar-item">
            <CheckCircleIcon style={{color: '#22c55e'}} />
            <span>{`${filledCount}/${gridSize * gridSize}`}</span>
        </div>
        <div className="stats-bar-item">
            <ExclamationTriangleIcon style={{color: conflictCount > 0 ? '#ef4444' : '#6b7280'}} />
            <span>{conflictCount}</span>
        </div>
    </div>
  );
};

export default StatsBar;
