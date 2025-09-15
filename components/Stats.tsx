import React from 'react';
import { ClockIcon, CheckCircleIcon, ExclamationTriangleIcon, PauseIcon, PlayIcon } from './icons';

interface StatsProps {
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


const Stats: React.FC<StatsProps> = ({ filledCount, conflictCount, elapsedTime, hasStarted, gridSize, isPaused, onTogglePause, isSolved }) => {
  if (!hasStarted) return null;

  const styles: { [key: string]: React.CSSProperties } = {
    statsContainer: {
        display: "flex",
        justifyContent: "space-around",
        alignItems: 'center',
        padding: "10px 20px",
        backgroundColor: "#1e293b",
        borderRadius: 6,
        fontWeight: "600",
    },
    statItem: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
    },
    pauseButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 4
    }
  };

  const pauseResumeButton = (
    <button 
      onClick={onTogglePause} 
      style={styles.pauseButton}
      aria-label={isPaused ? 'Resume timer' : 'Pause timer'}
      disabled={isSolved}
    >
        {isPaused ? <PlayIcon style={{width:20, height:20, color: '#22c55e'}} /> : <PauseIcon style={{width:20, height:20, color: '#eab308'}} />}
    </button>
  );

  return (
    <div style={styles.statsContainer}>
        <div style={styles.statItem}>
            <ClockIcon style={{width: 20, height: 20, color: '#60a5fa'}} />
            <span>{formatTime(elapsedTime)}</span>
            {pauseResumeButton}
        </div>
        <div style={styles.statItem}>
            <CheckCircleIcon style={{width: 20, height: 20, color: '#22c55e'}} />
            <span>{`${filledCount}/${gridSize * gridSize}`}</span>
        </div>
        <div style={styles.statItem}>
            <ExclamationTriangleIcon style={{width: 20, height: 20, color: conflictCount > 0 ? '#ef4444' : '#6b7280'}} />
            <span>{conflictCount}</span>
        </div>
    </div>
  );
};

export default Stats;