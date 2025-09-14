import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Platform,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MemorizationManager from '../services/MemorizationManager';
import { MemorizationStatus } from '../types/memorization';


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
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444'
};

const MemorizationScreen = ({ navigation }) => {
  const [reviewVerses, setReviewVerses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentVerseIndex, setCurrentVerseIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  useFocusEffect(
    React.useCallback(() => {
      loadReviewVerses();
    }, [])
  );

  const loadReviewVerses = async () => {
    setIsLoading(true);
    setRefreshing(true);
    try {
      await MemorizationManager.init();
      const verses = MemorizationManager.getVersesNeedingReview();
      
      // Get surah names for display
      const surahsData = require('../data/surahs.json');
      const versesWithDetails = verses.map(verse => {
        const surah = surahsData.find(s => s.number === verse.surah);
        return {
          ...verse,
          surahName: surah ? surah.name : `سورة ${verse.surah}`,
        };
      });
      
      setReviewVerses(versesWithDetails);
    } catch (e) {
      console.error('Failed to load review verses:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const startSession = () => {
    setSessionActive(true);
    setCurrentVerseIndex(0);
  };

  const endSession = async () => {
    setSessionActive(false);
    // Reload verses to update the list
    loadReviewVerses();
  };

  const handleVerseResult = async (success) => {
    const currentVerse = reviewVerses[currentVerseIndex];
    
    // Determine new status based on success
    let newStatus;
    if (success) {
      // If successful, move to mastered or keep reviewing based on current status
      newStatus = currentVerse.progress.status === MemorizationStatus.REVIEWING 
        ? MemorizationStatus.MASTERED 
        : MemorizationStatus.REVIEWING;
    } else {
      // If not successful, mark as needing review
      newStatus = MemorizationStatus.REVIEWING;
    }
    
    await MemorizationManager.updateVerseStatus(
      currentVerse.surah,
      currentVerse.ayah,
      newStatus
    );
    
    // Move to next verse or end session
    if (currentVerseIndex < reviewVerses.length - 1) {
      setCurrentVerseIndex(currentVerseIndex + 1);
    } else {
      endSession();
    }
  };

  // Update the getStatusColor function similarly
const getStatusColor = (status) => {
  if (!status) return colors.secondary_600;
  
  switch (status) {
    case MemorizationStatus.MASTERED: return colors.success;
    case MemorizationStatus.REVIEWING: return colors.warning;
    case MemorizationStatus.LEARNING: return colors.primary;
    case MemorizationStatus.NOT_STARTED: return colors.secondary_600;
    default: return colors.secondary_600;
  }
};


  // Update the getStatusText function to handle NOT_STARTED
const getStatusText = (status) => {
  if (!status) return 'لم يبدأ بعد';
  
  switch (status) {
    case MemorizationStatus.MASTERED: return 'تم إتقانه';
    case MemorizationStatus.REVIEWING: return 'بحاجة مراجعة';
    case MemorizationStatus.LEARNING: return 'قيد الحفظ';
    case MemorizationStatus.NOT_STARTED: return 'لم يبدأ بعد';
    default: return 'لم يبدأ بعد';
  }
};

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>جاري تحميل آيات المراجعة...</Text>
      </View>
    );
  }

  if (sessionActive && reviewVerses.length > 0) {
    const currentVerse = reviewVerses[currentVerseIndex];
    return (
      <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 25 : insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>جلسة المراجعة</Text>
          <Text style={styles.progressText}>
            {currentVerseIndex + 1} / {reviewVerses.length}
          </Text>
        </View>
        
        <View style={styles.verseContainer}>
          <Text style={styles.verseReference}>
            سورة {currentVerse.surahName} - آية {currentVerse.ayah}
          </Text>
          <Text style={styles.instructionText}>
            حاول تذكر هذه الآية من الذاكرة
          </Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.successButton]}
            onPress={() => handleVerseResult(true)}
          >
            <MaterialIcons name="check" size={24} color={colors.white} />
            <Text style={styles.actionButtonText}>تذكرتها</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]}
            onPress={() => handleVerseResult(false)}
          >
            <MaterialIcons name="close" size={24} color={colors.white} />
            <Text style={styles.actionButtonText}>نسيتها</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.viewButton}
          onPress={() => navigation.navigate('SurahReader', {
            surahNumber: currentVerse.surah,
            initialAyahNumberInSurah: currentVerse.ayah
          })}
        >
          <Text style={styles.viewButtonText}>عرض الآية</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 25 : insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>المراجعة اليومية</Text>
        <TouchableOpacity onPress={loadReviewVerses}>
          <MaterialIcons name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={loadReviewVerses} 
            tintColor={colors.primary} 
          />
        }
      >
        {reviewVerses.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="emoji-events" size={64} color={colors.secondary_600} />
            <Text style={styles.emptyStateTitle}>لا توجد آيات للمراجعة</Text>
            <Text style={styles.emptyStateText}>
              قم بتحديد بعض الآيات كـ "قيد الحفظ" أو "بحاجة مراجعة" لتظهر هنا
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryText}>
                لديك {reviewVerses.length} آية للمراجعة
              </Text>
              <TouchableOpacity style={styles.startButton} onPress={startSession}>
                <Text style={styles.startButtonText}>بدء المراجعة</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.versesList}>
              {reviewVerses.map((verse, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.verseItem}
                  onPress={() => navigation.navigate('SurahReader', {
                    surahNumber: verse.surah,
                    initialAyahNumberInSurah: verse.ayah
                  })}
                >
                  <View style={styles.verseInfo}>
                    <Text style={styles.verseName}>
                      سورة {verse.surahName} - آية {verse.ayah}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(verse.progress.status) }]}>
                      <Text style={styles.statusText}>{getStatusText(verse.progress.status)}</Text>
                    </View>
                  </View>
                  <MaterialIcons name="chevron-left" size={24} color={colors.secondary_600} />
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text_dark,
    fontFamily: 'Amiri_700Bold',
  },
  progressText: {
    fontSize: 16,
    color: colors.secondary_600,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.secondary_600,
    fontFamily: 'Amiri_400Regular',
  },
  verseContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 20,
    margin: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  verseReference: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text_dark,
    fontFamily: 'Amiri_700Bold',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    color: colors.secondary_600,
    textAlign: 'center',
    fontFamily: 'Amiri_400Regular',
  },
  actions: {
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    gap: 16,
    marginVertical: 20,
  },
  actionButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  successButton: {
    backgroundColor: colors.success,
  },
  dangerButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Amiri_400Regular',
  },
  viewButton: {
    backgroundColor: colors.primary_light,
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  viewButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Amiri_400Regular',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: colors.text_dark,
    fontWeight: '700',
    fontFamily: 'Amiri_700Bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.secondary_600,
    textAlign: 'center',
    fontFamily: 'Amiri_400Regular',
  },
  summary: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  summaryText: {
    fontSize: 16,
    color: colors.text_dark,
    fontFamily: 'Amiri_400Regular',
    marginBottom: 16,
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Amiri_400Regular',
  },
  versesList: {
    gap: 12,
  },
  verseItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  verseInfo: {
    flex: 1,
  },
  verseName: {
    fontSize: 16,
    color: colors.text_dark,
    fontFamily: 'Amiri_700Bold',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'Amiri_400Regular',
  },
});

export default MemorizationScreen;