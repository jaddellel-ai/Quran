import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Switch
} from 'react-native';
import { Slider } from '@rneui/themed';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getJSON, setJSON, showToast } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { useFontSettings } from '../context/FontSettingsContext';
import ReminderToggle from '../components/ReminderToggle';

// Define colors object
const colors = {
  primary: '#14b8a6',
  primary_light: '#ccfbf1',
  secondary_50: '#f8fafc',
  secondary_600: '#475569',
  secondary_700: '#334155',
  secondary_900: '#0f172a',
  white: '#FFFFFF',
  bg: '#f8fafc',
  text_dark: '#0f172a',
  text_light: '#64748b',
  border: '#e2e8f0',
  card: '#FFFFFF',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
};

const formatTime = (date) => {
  // Ensure we have a valid Date object
  const dateObj = date instanceof Date ? date : new Date(date);
  
  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid time';
  }
  
  return dateObj.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function SettingsScreen({ onShowOnboarding }) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme, colors: themeColors } = useTheme();
  const { interfaceFont, interfaceFontSize, quranFont, quranFontSize, updateFontSettings } = useFontSettings();
  const [reminders, setReminders] = useState({
    dailyWird: { enabled: false, time: new Date() },
    alMulk: { enabled: false, time: new Date() },
    fridayReminder: false
  });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [fontSize, setFontSize] = useState(quranFontSize);

  useFocusEffect(
    useCallback(() => {
      loadReminderSettings();
    }, [])
  );

  const loadReminderSettings = async () => {
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      if (settings.reminders) {
        setReminders(settings.reminders);
      }
    } catch (error) {
      console.error('Failed to load reminder settings:', error);
    }
  };

  const saveReminderSettings = async (newReminders) => {
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      settings.reminders = newReminders;
      await setJSON(STORAGE_KEYS.SETTINGS, settings);
      setReminders(newReminders);
      
      showToast('تم حفظ إعدادات التذكير.');
    } catch (error) {
      console.error('Failed to save reminder settings:', error);
      showToast('فشل حفظ إعدادات التذكير.');
    }
  };
  
  // Load reminder settings
  const loadReminder = async () => {
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      if (settings.reminder) {
        setNotificationsEnabled(settings.reminder.isEnabled);
        // Ensure we have a Date object
        setReminderTime(settings.reminder.time instanceof Date ? 
          settings.reminder.time : 
          new Date(settings.reminder.time)
        );
      }
    } catch (e) {
      console.error('Failed to load reminder settings:', e);
    }
  };

  const handleSaveReminders = async () => {
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      settings.reminder = {
        isEnabled: notificationsEnabled,
        // Store as ISO string to ensure proper serialization
        time: reminderTime.toISOString(),
      };
      await setJSON(STORAGE_KEYS.SETTINGS, settings);
      showToast('تم حفظ إعدادات التذكير.');
    } catch (e) {
      console.error('Failed to save reminder settings:', e);
      showToast('فشل حفظ إعدادات التذكير.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadReminder();
    }, [])
  );

  const showOnboarding = () => {
    if (onShowOnboarding) {
      onShowOnboarding();
    }
  };

  const handleTimeChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const showAbout = () => {
    alert('تطبيق القرآن - إصدار 1.0\nتم التطوير بواسطة فريق مخصص');
  };

  const contactSupport = () => {
    alert('للدعم الفني، يرجى التواصل عبر: support@quranapp.com');
  };

  const handleFontSizeChange = async (value) => {
    setFontSize(value);
    await updateFontSettings({ quranFontSize: value });
  };

  const handleFontChange = async (font) => {
    await updateFontSettings({ quranFont: font });
  };

  // Font preview component
  const FontPreview = () => {
    const { quranFont, quranFontSize } = useFontSettings();
    
    return (
      <View style={[styles.fontPreview, { backgroundColor: themeColors.primary_light }]}>
        <Text style={[styles.fontPreviewText, { fontFamily: quranFont, fontSize: quranFontSize }]}>
          بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
        </Text>
        <Text style={[styles.fontPreviewLabel, { color: themeColors.secondary_600 }]}>
          معاينة الخط والحجم
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 25 : insets.top, backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: themeColors.text_dark }]}>الإعدادات</Text>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: themeColors.text_dark }]}>التذكيرات الدينية</Text>

        <ReminderToggle
          label="تذكير الورد اليومي"
          isEnabled={reminders.dailyWird.enabled}
          onToggle={(enabled) => saveReminderSettings({
            ...reminders,
            dailyWird: { ...reminders.dailyWird, enabled }
          })}
          time={reminders.dailyWird.time}
          onTimeChange={(time) => saveReminderSettings({
            ...reminders,
            dailyWird: { ...reminders.dailyWird, time }
          })}
          colors={themeColors}
        />

        <ReminderToggle
          label="تذكير سورة الملك"
          isEnabled={reminders.alMulk.enabled}
          onToggle={(enabled) => saveReminderSettings({
            ...reminders,
            alMulk: { ...reminders.alMulk, enabled }
          })}
          time={reminders.alMulk.time}
          onTimeChange={(time) => saveReminderSettings({
            ...reminders,
            alMulk: { ...reminders.alMulk, time }
          })}
          colors={themeColors}
        />

        <View style={[styles.optionCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="weekend" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>تذكير الجمعة (سورة الكهف)</Text>
          </View>
          <Switch
            value={reminders.fridayReminder}
            onValueChange={(enabled) => saveReminderSettings({
              ...reminders,
              fridayReminder: enabled
            })}
            trackColor={{ false: '#767577', true: themeColors.primary }}
            thumbColor={reminders.fridayReminder ? themeColors.white : '#f4f3f4'}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.text_dark }]}>عام</Text>
        
        <TouchableOpacity style={[styles.optionCard, { backgroundColor: themeColors.card }]} onPress={showOnboarding}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="info" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>عرض شاشات التعريف</Text>
          </View>
          <MaterialIcons name="chevron-left" size={24} color={themeColors.text_light} />
        </TouchableOpacity>

        <View style={[styles.optionCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="notifications" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>التنبيهات</Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#767577', true: themeColors.primary }}
            thumbColor={notificationsEnabled ? themeColors.white : '#f4f3f4'}
          />
        </View>

        {notificationsEnabled && (
          <View style={[styles.optionCard, { backgroundColor: themeColors.card }]}>
            <View style={styles.optionLeft}>
              <MaterialIcons name="access-time" size={24} color={themeColors.primary} />
              <Text style={[styles.optionText, { color: themeColors.text_dark }]}>وقت التذكير</Text>
            </View>
            <TouchableOpacity onPress={() => setShowPicker(true)}>
              <Text style={[styles.timeText, { color: themeColors.primary }]}>{formatTime(reminderTime)}</Text>
            </TouchableOpacity>
          </View>
        )}

        {showPicker && (
          <DateTimePicker
            value={reminderTime instanceof Date ? reminderTime : new Date(reminderTime)}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <View style={[styles.optionCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="dark-mode" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>الوضع الليلي</Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={() => toggleTheme()}
            trackColor={{ false: '#767577', true: themeColors.primary }}
            thumbColor={isDarkMode ? themeColors.white : '#f4f3f4'}
          />
        </View>

        <View style={[styles.optionCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="volume-up" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>الصوت</Text>
          </View>
          <Switch
            value={audioEnabled}
            onValueChange={setAudioEnabled}
            trackColor={{ false: '#767577', true: themeColors.primary }}
            thumbColor={audioEnabled ? themeColors.white : '#f4f3f4'}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: themeColors.text_dark }]}>إعدادات الخط</Text>
        
        <View style={[styles.optionCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="text-fields" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>خط القرآن</Text>
          </View>
          <View style={styles.fontPicker}>
            <TouchableOpacity 
              style={[styles.fontOption, quranFont === 'Amiri_400Regular' && styles.activeFont]}
              onPress={() => handleFontChange('Amiri_400Regular')}
            >
              <Text style={[styles.fontOptionText, { color: quranFont === 'Amiri_400Regular' ? themeColors.primary : themeColors.text_dark }]}>Amiri</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.fontOption, quranFont === 'Kufam_400Regular' && styles.activeFont]}
              onPress={() => handleFontChange('Kufam_400Regular')}
            >
              <Text style={[styles.fontOptionText, { color: quranFont === 'Kufam_400Regular' ? themeColors.primary : themeColors.text_dark }]}>Kufam</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.optionCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="format-size" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>حجم خط القرآن</Text>
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              value={fontSize}
              onValueChange={handleFontSizeChange}
              minimumValue={20}
              maximumValue={40}
              step={2}
              style={{ width: 150 }}
              thumbStyle={{ height: 20, width: 20, backgroundColor: themeColors.primary }}
              minimumTrackTintColor={themeColors.primary}
              maximumTrackTintColor={themeColors.border}
            />
            <Text style={[styles.valueText, { color: themeColors.primary }]}>{fontSize}</Text>
          </View>
        </View>

        <FontPreview />

        <TouchableOpacity style={[styles.saveButton, { backgroundColor: themeColors.primary }]} onPress={handleSaveReminders}>
          <Text style={styles.saveButtonText}>حفظ الإعدادات</Text>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { color: themeColors.text_dark }]}>المزيد</Text>
        
        <TouchableOpacity style={[styles.optionCard, { backgroundColor: themeColors.card }]} onPress={showAbout}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="help" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>عن التطبيق</Text>
          </View>
          <MaterialIcons name="chevron-left" size={24} color={themeColors.text_light} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionCard, { backgroundColor: themeColors.card }]} onPress={contactSupport}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="support" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>الدعم الفني</Text>
          </View>
          <MaterialIcons name="chevron-left" size={24} color={themeColors.text_light} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="share" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>مشاركة التطبيق</Text>
          </View>
          <MaterialIcons name="chevron-left" size={24} color={themeColors.text_light} />
        </TouchableOpacity>

        <TouchableOpacity style={[styles.optionCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.optionLeft}>
            <MaterialIcons name="star" size={24} color={themeColors.primary} />
            <Text style={[styles.optionText, { color: themeColors.text_dark }]}>قيم التطبيق</Text>
          </View>
          <MaterialIcons name="chevron-left" size={24} color={themeColors.text_light} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 20,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
    textAlign: 'right',
  },
  optionCard: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  optionLeft: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fontPicker: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  fontOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  activeFont: {
    borderColor: '#0d9488',
    backgroundColor: '#ccfbf1',
  },
  fontOptionText: {
    fontSize: 14,
  },
  sliderContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    width: 30,
  },
  fontPreview: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  fontPreviewText: {
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  fontPreviewLabel: {
    marginTop: 8,
    fontSize: 12,
  },
});