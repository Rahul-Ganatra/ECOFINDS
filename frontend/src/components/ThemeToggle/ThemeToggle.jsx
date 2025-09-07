import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import styles from './ThemeToggle.module.css';

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      className={styles.themeToggle}
      onClick={toggleTheme}
      aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
    >
      <div className={`${styles.toggleTrack} ${isDarkMode ? styles.dark : styles.light}`}>
        <div className={`${styles.toggleThumb} ${isDarkMode ? styles.darkThumb : styles.lightThumb}`}>
          {isDarkMode ? (
            <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.64,13l-3.54-3.54c-0.34-0.34-0.84-0.39-1.24-0.12c-1.83,1.23-4.26,1.23-6.09,0C10.38,9.05,9.88,9.1,9.54,9.44L6,13c-0.39,0.39-0.39,1.02,0,1.41l3.54,3.54c0.34,0.34,0.84,0.39,1.24,0.12c1.83-1.23,4.26-1.23,6.09,0c0.4,0.27,0.9,0.22,1.24-0.12L21.64,14.41C22.03,14.02,22.03,13.39,21.64,13z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          ) : (
            <svg className={styles.icon} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,18c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6S15.31,18,12,18zM12,8c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4S14.21,8,12,8z"/>
              <path d="M12,4c-0.55,0-1-0.45-1-1V1c0-0.55,0.45-1,1-1s1,0.45,1,1v2C13,3.55,12.55,4,12,4z"/>
              <path d="M17.66,7.34c-0.39,0.39-1.02,0.39-1.41,0c-0.39-0.39-0.39-1.02,0-1.41l1.41-1.41c0.39-0.39,1.02-0.39,1.41,0s0.39,1.02,0,1.41L17.66,7.34z"/>
              <path d="M21,13h-2c-0.55,0-1-0.45-1-1s0.45-1,1-1h2c0.55,0,1,0.45,1,1S21.55,13,21,13z"/>
              <path d="M17.66,19.66c-0.39,0.39-1.02,0.39-1.41,0l-1.41-1.41c-0.39-0.39-0.39-1.02,0-1.41s1.02-0.39,1.41,0l1.41,1.41C18.05,18.64,18.05,19.27,17.66,19.66z"/>
              <path d="M12,23c-0.55,0-1-0.45-1-1v-2c0-0.55,0.45-1,1-1s1,0.45,1,1v2C13,22.55,12.55,23,12,23z"/>
              <path d="M6.34,19.66c-0.39,0.39-1.02,0.39-1.41,0s-0.39-1.02,0-1.41l1.41-1.41c0.39-0.39,1.02-0.39,1.41,0s0.39,1.02,0,1.41L6.34,19.66z"/>
              <path d="M5,13H3c-0.55,0-1-0.45-1-1s0.45-1,1-1h2c0.55,0,1,0.45,1,1S5.55,13,5,13z"/>
              <path d="M6.34,7.34C5.95,7.73,5.32,7.73,4.93,7.34l-1.41-1.41c-0.39-0.39-0.39-1.02,0-1.41s1.02-0.39,1.41,0l1.41,1.41C6.73,6.32,6.73,6.95,6.34,7.34z"/>
            </svg>
          )}
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
