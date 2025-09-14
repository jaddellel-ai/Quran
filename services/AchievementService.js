// services/AchievementService.js
export const ACHIEVEMENTS = {
  FIRST_VERSE: {
    id: 'first_verse',
    name: 'أول آية',
    description: 'حفظت أول آية',
    icon: 'star'
  },
  DAILY_STREAK_7: {
    id: 'daily_streak_7',
    name: 'مثابر',
    description: '7 أيام متتالية من الحفظ',
    icon: 'fire'
  },
  // More achievements...
};

export class AchievementService {
  static checkAchievements(progress) {
    const unlocked = [];
    
    // Check various conditions and award achievements
    if (progress.totalAyahsMemorized > 0 && !progress.achievements.first_verse) {
      unlocked.push(ACHIEVEMENTS.FIRST_VERSE);
    }
    
    if (progress.dailyStreak >= 7 && !progress.achievements.daily_streak_7) {
      unlocked.push(ACHIEVEMENTS.DAILY_STREAK_7);
    }
    
    return unlocked;
  }
}