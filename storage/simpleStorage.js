// storage/simpleStorage.js
// Simple in-memory storage to avoid any localStorage issues
let memoryStorage = {};

export const getJSON = async (key, defaultValue = null) => {
  return memoryStorage[key] || defaultValue;
};

export const setJSON = async (key, value) => {
  memoryStorage[key] = value;
  return true;
};

export const removeItem = async (key) => {
  delete memoryStorage[key];
  return true;
};

export const clearStorage = async () => {
  memoryStorage = {};
  return true;
};

export const showToast = (message) => {
  console.log('TOAST:', message);
};