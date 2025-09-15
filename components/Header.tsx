import React from 'react';
import ThemeToggle from './ThemeToggle';
import { Theme } from '../types';

interface HeaderProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const Header: React.FC<HeaderProps> = ({ theme, setTheme }) => {
  return (
    <header className="app-header">
      <h1 className="header-title">
        AI <span className="highlight">Sudoku Solver</span>
      </h1>
      <ThemeToggle theme={theme} setTheme={setTheme} />
    </header>
  );
};

export default Header;
