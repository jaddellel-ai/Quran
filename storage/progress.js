import { getJSON, setJSON } from './index';
import { STORAGE_KEYS } from './schema';

export async function getDailyProgress() {
  const today = new Date().toDateString();
  try {
    const progress = await getJSON(STORAGE_KEYS.PROGRESS, {});
    return progress[today] || {};
  } catch (e) {
    console.error("Failed to get daily progress:", e);
    return {};
  }
}

export async function resetDailyProgress() {
  const today = new Date().toDateString();
  try {
    const progress = await getJSON(STORAGE_KEYS.PROGRESS, {});
    if (progress[today]) {
      delete progress[today];
      await setJSON(STORAGE_KEYS.PROGRESS, progress);
    }
  } catch (e) {
    console.error("Failed to reset daily progress:", e);
  }
}
