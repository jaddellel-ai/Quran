import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { MemorizationStatus } from '../types/memorization';
import { useFontSettings } from '../context/FontSettingsContext';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#0d9488',
  primary_light: '#ccfbf1',
  text_dark: '#0f172a',
  text_light: '#64748b',
  white: '#FFFFFF',
  border: '#e2e8f0',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  background: '#F8F9FA'
};

const FocusAyahView = ({ 
  ayah, 
  isBookmarked, 
  onPlayAudio, 
  onBookmark, 
  onViewedAyah,
  memorizationProgress,
  onMemorizationUpdate,
  onToggleMastery
}) => {
  const { quranFont, quranFontSize } = useFontSettings();
  
  useEffect(() => {
    if (onViewedAyah && ayah.numberInSurah > 0) {
      const timer = setTimeout(() => {
        onViewedAyah(ayah);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [ayah, onViewedAyah]);

  const isBasmala = ayah.numberInSurah === 0;

  const getStatusText = (status) => {
    if (!status) return 'لم يبدأ بعد';
    
    switch (status) {
      case MemorizationStatus.MASTERED: return 'تم إتقانه';
      case MemorizationStatus.REVIEWING: return 'بحاجة مراجعة';
      case MemorizationStatus.LEARNING: return 'قيد الحفظ';
      default: return 'لم يبدأ بعد';
    }
  };

  const getStatusColor = (status) => {
    if (!status) return colors.text_light;
    
    switch (status) {
      case MemorizationStatus.MASTERED: return colors.success;
      case MemorizationStatus.REVIEWING: return colors.warning;
      case MemorizationStatus.LEARNING: return colors.primary;
      default: return colors.text_light;
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.ayahText, { fontFamily: quranFont, fontSize: quranFontSize }]}>
            {ayah.text}
          </Text>
          
          {/* Memorization Status Display */}
          {memorizationProgress && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(memorizationProgress.status) }]}>
              <Text style={styles.statusText}>
                {getStatusText(memorizationProgress.status)}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => onBookmark(ayah)} style={styles.controlButton}>
          <MaterialIcons
            name={isBookmarked ? 'bookmark' : 'bookmark-border'}
            size={28}
            color={isBookmarked ? colors.primary : colors.text_dark}
          />
        </TouchableOpacity>
        
        {/* Memorization Controls */}
        {onMemorizationUpdate && (
          <View style={styles.memorizationControls}>
            <TouchableOpacity 
              style={[styles.memorizationButton, styles.learningButton]}
              onPress={() => onMemorizationUpdate(MemorizationStatus.LEARNING)}
            >
              <MaterialIcons name="play-arrow" size={20} color={colors.white} />
              <Text style={styles.memorizationButtonText}>قيد الحفظ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.memorizationButton, styles.reviewButton]}
              onPress={() => onMemorizationUpdate(MemorizationStatus.REVIEWING)}
            >
              <MaterialIcons name="refresh" size={20} color={colors.white} />
              <Text style={styles.memorizationButtonText}>مراجعة</Text>
            </TouchableOpacity>
          </View>
        )}
        
        <TouchableOpacity onPress={() => onPlayAudio(ayah.audio)} style={styles.controlButton}>
          <MaterialIcons name="play-arrow" size={32} color={colors.text_dark} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  page: {
    width: width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  ayahText: {
    textAlign: 'center',
    lineHeight: 60,
    flexWrap: 'wrap',
    textAlignVertical: 'center',
    writingDirection: 'rtl',
    width: '100%',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 16,
  },
  statusText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingTop: 24,
  },
  controlButton: {
    padding: 12,
  },
  memorizationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  memorizationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  learningButton: {
    backgroundColor: colors.primary,
  },
  reviewButton: {
    backgroundColor: colors.warning,
  },
  memorizationButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FocusAyahView;