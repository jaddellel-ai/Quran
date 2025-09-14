import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import { getJSON, setJSON } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const loadThemePreference = useCallback(async () => {
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      if (settings.theme) {
        setIsDarkMode(settings.theme === 'dark');
      } else {
        setIsDarkMode(systemColorScheme === 'dark');
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      setIsDarkMode(systemColorScheme === 'dark');
    }
  }, [systemColorScheme]);

  useEffect(() => {
    loadThemePreference();
  }, [loadThemePreference]);

  const toggleTheme = async (theme) => {
    const newTheme = theme || (isDarkMode ? 'light' : 'dark');
    setIsDarkMode(newTheme === 'dark');
    
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      settings.theme = newTheme;
      await setJSON(STORAGE_KEYS.SETTINGS, settings);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const colors = isDarkMode ? {
    primary: '#0d9488',
    primary_light: '#0f766e',
    text_dark: '#f1f5f9',
    text_light: '#cbd5e1',
    background: '#0f172a',
    card: '#1e293b',
    border: '#334155',
    white: '#1e293b',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    bg: '#0f172a'
  } : {
    primary: '#0d9488',
    primary_light: '#ccfbf1',
    text_dark: '#0f172a',
    text_light: '#64748b',
    background: '#F7F7F7',
    card: '#FFFFFF',
    border: '#e2e8f0',
    white: '#FFFFFF',
    success: '#22c55e',
    warning: '#f59e0b',
    danger: '#ef4444',
    bg: '#f8fafc'
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};