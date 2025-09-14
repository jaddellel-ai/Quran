// AchievementSystem.js
export class AchievementSystem {
  static badges = {
    firstAyah: { name: 'أول آية', description: 'قرأت أول آية' },
    dailyStreak: { name: 'مواظب', description: '7 أيام متتالية' },
    // More badges...
  };

  static checkAchievements(progress) {
    const achievements = [];
    
    if (progress.totalAyahsRead > 0 && !progress.achievements.firstAyah) {
      achievements.push(this.badges.firstAyah);
    }
    
    // Check other achievements...
    
    return achievements;
  }
}