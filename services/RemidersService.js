import * as Notifications from 'expo-notifications';
import { getJSON } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';


export class EnhancedRemindersService {
  static async scheduleSmartReminder(readingHabits) {
    // Analyze user's reading patterns and schedule reminders at optimal times
    const bestTime = this.calculateBestTime(readingHabits);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'وقت التلاوة',
        body: 'حان وقت تلاوة القرآن الكريم',
        sound: true,
      },
      trigger: {
        hour: bestTime.hour,
        minute: bestTime.minute,
        repeats: true,
      },
    });
  }

  static calculateBestTime(habits) {
    // Implement algorithm to find best reminder time
    return { hour: 18, minute: 30 }; // Example
  }
}

export class RemindersService {

  static async scheduleDailyReminder(time, title, body) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: title,
          body: body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          hour: time.getHours(),
          minute: time.getMinutes(),
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
    }
  }

  static async scheduleFridayReminder() {
    try {
      // Schedule for Thursday night (8 PM)
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'تذكير بقراءة سورة الكهف',
          body: 'غدًا الجمعة، لا تنسى قراءة سورة الكهف',
          sound: true,
        },
        trigger: {
          hour: 20, // 8 PM
          minute: 0,
          repeats: true,
        },
      });
    } catch (error) {
      console.error('Failed to schedule Friday reminder:', error);
    }
  }

  static async scheduleAllReminders() {
    try {
      // Cancel all existing notifications first
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      
      if (settings.reminders) {
        // Schedule daily wird reminder
        if (settings.reminders.dailyWird?.enabled) {
          const dailyTime = new Date(settings.reminders.dailyWird.time);
          await this.scheduleDailyReminder(
            dailyTime,
            'وقت الورد اليومي',
            'حان وقت قراءة وردك اليومي من القرآن'
          );
        }
        
        // Schedule Surat Al-Mulk reminder
        if (settings.reminders.alMulk?.enabled) {
          const alkulkTime = new Date(settings.reminders.alMulk.time);
          await this.scheduleDailyReminder(
            alkulkTime,
            'وقت قراءة سورة الملك',
            'حان وقت قراءة سورة الملك قبل النوم'
          );
        }
        
        // Schedule Friday reminder
        if (settings.reminders.fridayReminder) {
          await this.scheduleFridayReminder();
        }
      }
    } catch (error) {
      console.error('Failed to schedule reminders:', error);
    }
  }

  static async requestPermissions() {
    try {
      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request notification permissions:', error);
      return false;
    }
  }
}