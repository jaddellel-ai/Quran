import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReminderToggle = ({ label, isEnabled, onToggle, time, onTimeChange, colors }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleTimeChange = (event, selectedDate) => {
    setShowPicker(false);
    if (selectedDate) {
      onTimeChange(selectedDate);
    }
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

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: colors.text_dark }]}>{label}</Text>
        <Switch
          value={isEnabled}
          onValueChange={onToggle}
          trackColor={{ false: '#767577', true: colors.primary }}
          thumbColor={isEnabled ? colors.white : '#f4f3f4'}
        />
      </View>
      
      {isEnabled && (
        <TouchableOpacity 
          style={styles.timeContainer}
          onPress={() => setShowPicker(true)}
          disabled={!isEnabled}
        >
          <MaterialIcons name="access-time" size={20} color={colors.primary} />
          <Text style={[styles.timeText, { color: colors.primary }]}>
            {formatTime(time)}
          </Text>
        </TouchableOpacity>
      )}
      
      {showPicker && (
        <DateTimePicker
          value={time instanceof Date ? time : new Date(time)}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={handleTimeChange}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  timeContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
    padding: 8,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
    borderRadius: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReminderToggle;