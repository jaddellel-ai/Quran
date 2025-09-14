import { getJSON, setJSON } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';
import { MemorizationStatus } from '../types/memorization';

class MemorizationManager {
  constructor() {
    this.progress = {};
    this.isInitialized = false;
  }

  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.init();
    }
  }

  async init() {
    try {
      this.progress = await getJSON(STORAGE_KEYS.MEMORIZATION_PROGRESS, {});
      this.isInitialized = true;
      console.log('MemorizationManager initialized with', Object.keys(this.progress).length, 'verses');
    } catch (error) {
      console.error('Failed to load memorization data:', error);
      this.progress = {};
      this.isInitialized = true;
    }
  }

  async saveProgress() {
    try {
      await setJSON(STORAGE_KEYS.MEMORIZATION_PROGRESS, this.progress);
      console.log('Progress saved successfully');
    } catch (error) {
      console.error('Failed to save memorization progress:', error);
      throw error;
    }
  }

  getVerseKey(surahNumber, ayahNumber) {
    return `${surahNumber}:${ayahNumber}`;
  }

  getVerseProgress(surahNumber, ayahNumber) {
    const key = this.getVerseKey(surahNumber, ayahNumber);
    return this.progress[key] || {
      status: MemorizationStatus.NOT_STARTED,
      lastReviewed: null,
    };
  }

  async updateVerseStatus(surahNumber, ayahNumber, status) {
    try {
      await this.ensureInitialized();
      
      const key = this.getVerseKey(surahNumber, ayahNumber);
      
      console.log('Updating verse status:', key, 'to', status);
      
      const updatedProgress = {
        status: status,
        lastReviewed: new Date().toISOString(),
      };

      this.progress[key] = updatedProgress;
      await this.saveProgress();
      
      console.log('Verse status updated successfully');
      return updatedProgress;
    } catch (error) {
      console.error('Error in updateVerseStatus:', error);
      throw error;
    }
  }

  getVersesNeedingReview() {
    const versesNeedingReview = [];
    
    Object.entries(this.progress).forEach(([key, progress]) => {
      if (progress.status === MemorizationStatus.LEARNING || 
          progress.status === MemorizationStatus.REVIEWING) {
        const [surah, ayah] = key.split(':').map(Number);
        versesNeedingReview.push({ 
          surah, 
          ayah, 
          progress,
          priority: progress.lastReviewed ? new Date(progress.lastReviewed).getTime() : 0
        });
      }
    });
    
    // Sort by priority (oldest reviews first)
    return versesNeedingReview.sort((a, b) => a.priority - b.priority);
  }

  getMemorizedVerses() {
    const memorizedVerses = [];
    
    Object.entries(this.progress).forEach(([key, progress]) => {
      if (progress.status === MemorizationStatus.MASTERED) {
        const [surah, ayah] = key.split(':').map(Number);
        memorizedVerses.push({ surah, ayah, progress });
      }
    });
    
    return memorizedVerses;
  }

  async clearAllProgress() {
    try {
      this.progress = {};
      await this.saveProgress();
      console.log('All memorization progress cleared');
    } catch (error) {
      console.error('Failed to clear progress:', error);
      throw error;
    }
  }

  async getStats() {
    await this.ensureInitialized();
    
    const total = Object.keys(this.progress).length;
    const learning = Object.values(this.progress).filter(p => p.status === MemorizationStatus.LEARNING).length;
    const reviewing = Object.values(this.progress).filter(p => p.status === MemorizationStatus.REVIEWING).length;
    const mastered = Object.values(this.progress).filter(p => p.status === MemorizationStatus.MASTERED).length;
    
    return {
      total,
      learning,
      reviewing,
      mastered
    };
  }
}

export default new MemorizationManager();