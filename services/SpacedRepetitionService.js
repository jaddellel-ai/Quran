// services/SpacedRepetitionService.js
export class SpacedRepetitionService {
  static intervals = [1, 3, 7, 14, 30, 60, 90]; // Days between reviews
  
  static calculateNextReview(performanceRating, currentInterval, repetitions) {
    let newInterval;
    
    if (performanceRating >= 4) { // Easy
      newInterval = Math.round(currentInterval * 2.5);
      repetitions++;
    } else if (performanceRating >= 3) { // Good
      newInterval = Math.round(currentInterval * 1.5);
      repetitions++;
    } else { // Again
      newInterval = 1;
      repetitions = 0;
    }
    
    return {
      interval: Math.min(newInterval, 365), // Cap at 1 year
      repetitions,
      nextReview: new Date(Date.now() + newInterval * 24 * 60 * 60 * 1000)
    };
  }
}