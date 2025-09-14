import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Switch, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getJSON, setJSON, showToast } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colors = {
  primary: '#14b8a6',
  primary_light: '#ccfbf1',
  secondary_50: '#f8fafc',
  secondary_600: '#475569',
  secondary_900: '#0f172a',
  white: '#FFFFFF',
  border: '#E5E7EB',
  bg: '#f8fafc',
  text_dark: '#0f172a',
};

const RemindersScreen = () => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const loadReminder = async () => {
        try {
          const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
          if (settings.reminder) {
            setIsEnabled(settings.reminder.isEnabled);
            setReminderTime(new Date(settings.reminder.time));
          }
        } catch (e) {
          console.error('Failed to load reminder settings:', e);
        }
      };
      loadReminder();
    }, [])
  );

  const handleTimeChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      setReminderTime(selectedDate);
    }
  };

  const handleSave = async () => {
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      settings.reminder = {
        isEnabled,
        time: reminderTime.toISOString(),
      };
      await setJSON(STORAGE_KEYS.SETTINGS, settings);
      showToast('تم حفظ إعدادات التذكير.');

      if (isEnabled) {
        Alert.alert(
          'تم تفعيل التذكير',
          `سيتم تذكيرك يوميًا في الساعة ${formatTime(reminderTime)}.`
        );
      }
    } catch (e) {
      console.error('Failed to save reminder settings:', e);
      showToast('فشل حفظ إعدادات التذكير.');
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 25 : insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>التذكيرات</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>تفعيل التذكير اليومي</Text>
          <Switch
            trackColor={{ false: '#767577', true: colors.primary_light }}
            thumbColor={isEnabled ? colors.primary : '#f4f3f4'}
            onValueChange={setIsEnabled}
            value={isEnabled}
          />
        </View>

        <View style={[styles.timeContainer, { opacity: isEnabled ? 1 : 0.4 }]}>
          <Text style={styles.timeLabel}>وقت التذكير</Text>
          <TouchableOpacity
            style={styles.timeDisplay}
            disabled={!isEnabled}
            onPress={() => setShowPicker(true)}>
            <MaterialIcons name="edit" size={20} color={colors.secondary_600} />
            <Text style={styles.timeText}>{formatTime(reminderTime)}</Text>
          </TouchableOpacity>
        </View>

        {showPicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>حفظ الإعدادات</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
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
    color: colors.text_dark,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    marginHorizontal: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 18,
    color: colors.secondary_900,
    fontWeight: '600',
  },
  timeContainer: {
    alignItems: 'center',
    marginVertical: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  timeLabel: {
    fontSize: 16,
    color: colors.secondary_600,
    marginBottom: 10,
  },
  timeDisplay: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 20,
    backgroundColor: colors.secondary_50,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
    fontVariant: ['tabular-nums'],
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RemindersScreen;