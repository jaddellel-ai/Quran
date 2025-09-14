import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Slider } from '@rneui/themed'; // Import from the new library
import { MaterialIcons } from '@expo/vector-icons';

const colors = {
  primary: '#14b8a6',
  secondary_200: '#e2e8f0',
};

const GoalSlider = ({ label, value, onValueChange, min, max, step, disabled = false }) => {
  return (
    <View style={[styles.card, disabled && styles.disabledCard]}>
      <Text style={[styles.label, disabled && styles.disabledText]}>{label}</Text>
      <View style={styles.sliderContainer}>
        <Slider
          style={{ flex: 1 }}
          minimumValue={min}
          maximumValue={max}
          step={step}
          value={value}
          onValueChange={onValueChange}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.secondary_200}
          thumbStyle={{ height: 20, width: 20, backgroundColor: disabled ? colors.secondary_200 : colors.primary }}
          disabled={disabled}
        />
        <Text style={[styles.valueText, disabled && styles.disabledText]}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.secondary_200,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  disabledCard: {
    backgroundColor: '#f8fafc',
  },
  disabledText: {
    color: '#cbd5e1',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'right',
  },
  sliderContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  valueText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    width: 40,
  },
});

export default GoalSlider;