import React, { createContext, useContext, useState, useEffect } from 'react';
import { getJSON, setJSON } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';

const FontSettingsContext = createContext();

export const useFontSettings = () => {
  const context = useContext(FontSettingsContext);
  if (!context) {
    throw new Error('useFontSettings must be used within a FontSettingsProvider');
  }
  return context;
};

export const FontSettingsProvider = ({ children }) => {
  const [interfaceFont, setInterfaceFont] = useState('System');
  const [interfaceFontSize, setInterfaceFontSize] = useState(16);
  const [quranFont, setQuranFont] = useState('Amiri_400Regular');
  const [quranFontSize, setQuranFontSize] = useState(26);

  useEffect(() => {
    loadFontSettings();
  }, []);

  const loadFontSettings = async () => {
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      if (settings.fonts) {
        setInterfaceFont(settings.fonts.interfaceFont || 'System');
        setInterfaceFontSize(settings.fonts.interfaceFontSize || 16);
        setQuranFont(settings.fonts.quranFont || 'Amiri_400Regular');
        setQuranFontSize(settings.fonts.quranFontSize || 26);
      }
    } catch (error) {
      console.error('Failed to load font settings:', error);
    }
  };

  const updateFontSettings = async (newSettings) => {
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      settings.fonts = { ...settings.fonts, ...newSettings };
      await setJSON(STORAGE_KEYS.SETTINGS, settings);
      
      if (newSettings.interfaceFont) setInterfaceFont(newSettings.interfaceFont);
      if (newSettings.interfaceFontSize) setInterfaceFontSize(newSettings.interfaceFontSize);
      if (newSettings.quranFont) setQuranFont(newSettings.quranFont);
      if (newSettings.quranFontSize) setQuranFontSize(newSettings.quranFontSize);
    } catch (error) {
      console.error('Failed to save font settings:', error);
    }
  };

  return (
    <FontSettingsContext.Provider value={{
      interfaceFont,
      interfaceFontSize,
      quranFont,
      quranFontSize,
      updateFontSettings
    }}>
      {children}
    </FontSettingsContext.Provider>
  );
};