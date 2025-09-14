import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import * as Progress from 'react-native-progress';

const MemorizationProgress = ({ progress, colors }) => {
  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text_dark }]}>التقدم في الحفظ</Text>
      <Progress.Bar 
        progress={progress} 
        width={null} 
        color={colors.primary} 
        unfilledColor={colors.border}
        borderWidth={0}
        height={8}
        borderRadius={4}
      />
      <Text style={[styles.percentage, { color: colors.primary }]}>
        {Math.round(progress * 100)}%
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    textAlign: 'right',
  },
  percentage: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});

export default MemorizationProgress;