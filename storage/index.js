// storage/index.js
import { Platform } from 'react-native';

// Simple memory storage as fallback
let memoryStorage = {};

// Determine storage mechanism based on platform
let storageEngine = null;

if (Platform.OS === 'web') {
  // Web environment - use localStorage with fallback to memory
  storageEngine = {
    getItem: async (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          return window.localStorage.getItem(key);
        }
        return memoryStorage[key] || null;
      } catch (e) {
        console.error('Storage get error:', e);
        return memoryStorage[key] || null;
      }
    },
    setItem: async (key, value) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
        memoryStorage[key] = value;
      } catch (e) {
        console.error('Storage set error:', e);
        memoryStorage[key] = value;
      }
    },
    removeItem: async (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
        }
        delete memoryStorage[key];
      } catch (e) {
        console.error('Storage remove error:', e);
        delete memoryStorage[key];
      }
    },
    clear: async () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.clear();
        }
        memoryStorage = {};
      } catch (e) {
        console.error('Storage clear error:', e);
        memoryStorage = {};
      }
    },
  };
} else {
  // Native environment - use AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  storageEngine = AsyncStorage;
}

export const getJSON = async (key, defaultValue = null) => {
  try {
    const value = await storageEngine.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

export const setJSON = async (key, value) => {
  try {
    await storageEngine.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};

export const removeItem = async (key) => {
  try {
    await storageEngine.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
};

export const clearStorage = async () => {
  try {
    await storageEngine.clear();
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

// Simple toast implementation
let toastTimeout = null;
export const showToast = (message) => {
  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }
  
  // Simple console log for now
  console.log('TOAST:', message);
  
  toastTimeout = setTimeout(() => {
    // Hide toast logic would go here
  }, 3000);
};