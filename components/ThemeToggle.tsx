import React from 'react';
import { Theme } from '../types';
import { SunIcon, MoonIcon } from './icons';

interface ThemeToggleProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button onClick={toggleTheme} className="theme-toggle" aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
      {theme === 'light' ? (
        <MoonIcon style={{ width: 24, height: 24 }} />
      ) : (
        <SunIcon style={{ width: 24, height: 24 }} />
      )}
    </button>
  );
};

export default ThemeToggle;
