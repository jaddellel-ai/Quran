// storage/fallback.js
let memoryStorage = {};

export const getJSON = async (key, defaultValue = null) => {
  try {
    return memoryStorage[key] || defaultValue;
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    return defaultValue;
  }
};

export const setJSON = async (key, value) => {
  try {
    memoryStorage[key] = value;
    return true;
  } catch (error) {
    console.error(`Error saving ${key}:`, error);
    return false;
  }
};

export const removeItem = async (key) => {
  try {
    delete memoryStorage[key];
    return true;
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return false;
  }
};

export const clearStorage = async () => {
  try {
    memoryStorage = {};
    return true;
  } catch (error) {
    console.error('Error clearing storage:', error);
    return false;
  }
};

export const showToast = (message) => {
  console.log('TOAST:', message);
};