import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Platform, FlatList, ActivityIndicator,
  TouchableOpacity, Dimensions, Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import FocusAyahView from '../components/FocusAyahView';
import { getJSON, setJSON, showToast } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';
import MemorizationManager from '../services/MemorizationManager';
import { MemorizationStatus } from '../types/memorization';
import AdvancedAudioPlayer from '../components/AdvancedAudioPlayer';
import ReciterModal from '../components/ReciterModal';
import AudioService from '../services/AudioService';

const { width } = Dimensions.get('window');



const colors = {
  primary: '#0d9488',
  text_dark: '#0f172a',
  text_light: '#64748b',
  background_light: '#F7F7F7',
  border: '#e2e8f0',
  white: '#FFFFFF',
  success: '#22c55e',
};

const BISMILLAH_CANONICAL = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';
const startsWithBasmala = (text = '') => text.trim().startsWith(BISMILLAH_CANONICAL);

export default function SurahReaderScreen({ route }) {
  const navigation = useNavigation();
  const { surahNumber, initialAyahNumberInSurah } = route.params || {};

  // Validate and convert parameters to numbers
  const validatedSurahNumber = surahNumber ? parseInt(surahNumber) : 1;
  const validatedAyahNumber = initialAyahNumberInSurah ? parseInt(initialAyahNumberInSurah) : 1;

  const [surahData, setSurahData] = useState({ name: '', ayahs: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [bookmarkedAyahs, setBookmarkedAyahs] = useState({});
  const [isMemorized, setIsMemorized] = useState(false);
  const [activeAyahIndicator, setActiveAyahIndicator] = useState('');
  const [initialScrollIndex, setInitialScrollIndex] = useState(0);
  const [verseProgress, setVerseProgress] = useState({});
  const [currentAyah, setCurrentAyah] = useState(null);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [showAudioPlayer, setShowAudioPlayer] = useState(false);
  const [showReciterModal, setShowReciterModal] = useState(false);
  const [currentVerse, setCurrentVerse] = useState(null);
  
  const flatListRef = useRef(null);
  const totalAyahsRef = useRef(0);

  const [audioSettings, setAudioSettings] = useState({
  playbackRate: 1.0,
  defaultReciter: 'ar.alafasy'
});

  // Initialize audio service
  useEffect(() => {
    AudioService.init();
    
    return () => {
      AudioService.cleanup();
    };
  }, []);

  // Load audio settings
 // Load audio settings
useEffect(() => {
  const loadAudioSettings = async () => {
    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      if (settings.audioPlaybackRate) {
        setAudioSettings(prev => ({
          ...prev,
          playbackRate: settings.audioPlaybackRate
        }));
        await AudioService.setPlaybackRate(settings.audioPlaybackRate);
      }
      if (settings.defaultReciter) {
        setAudioSettings(prev => ({
          ...prev,
          defaultReciter: settings.defaultReciter
        }));
        await AudioService.setReciter(settings.defaultReciter);
      }
      setAudioEnabled(settings.audioEnabled !== false);
    } catch (error) {
      console.error('Failed to load audio settings:', error);
    }
  };
  
  loadAudioSettings();
}, []);

  const loadData = useCallback(async () => {
    if (!validatedSurahNumber) return;
    
    setIsLoading(true);
    try {
      // Load bookmarks and memorized data sequentially to avoid transaction conflicts
      const bookmarks = await getJSON(STORAGE_KEYS.BOOKMARKS, {});
      const memorized = await getJSON(STORAGE_KEYS.MEMORIZED, {});
      
      setBookmarkedAyahs(bookmarks);
      setIsMemorized(!!memorized[validatedSurahNumber]);

      // Fetch surah data from API
      const response = await fetch(`https://api.alquran.cloud/v1/surah/${validatedSurahNumber}/ar.alafasy`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      
      if (json.code !== 200 || !json.data) {
        throw new Error('Failed to fetch surah data');
      }
      
      const originalAyahs = json.data.ayahs;
      totalAyahsRef.current = originalAyahs.length;
      let displayAyahs = [...originalAyahs];

      if (validatedSurahNumber !== 1 && validatedSurahNumber !== 9 && startsWithBasmala(originalAyahs[0]?.text)) {
        const firstAyahText = originalAyahs[0].text.replace(BISMILLAH_CANONICAL, '').trim();
        const basmalaAyah = { 
          ...originalAyahs[0], 
          text: BISMILLAH_CANONICAL, 
          numberInSurah: 0, 
          number: `${originalAyahs[0].number}-bsm` 
        };
        
        displayAyahs = firstAyahText
          ? [basmalaAyah, { ...originalAyahs[0], text: firstAyahText }, ...originalAyahs.slice(1)]
          : [basmalaAyah, ...originalAyahs.slice(1)];
      }
      
      setSurahData({ name: json.data.name, ayahs: displayAyahs });
      
      // Calculate initial scroll index after data is loaded
      if (validatedAyahNumber > 0) {
        let targetIndex = 0;
        if (validatedAyahNumber === 0) {
          targetIndex = displayAyahs.findIndex(a => a.numberInSurah === 0);
        } else {
          targetIndex = displayAyahs.findIndex(a => a.numberInSurah === validatedAyahNumber);
        }
        setInitialScrollIndex(Math.max(0, targetIndex));
      }
      
      // Load memorization progress for all verses
      await MemorizationManager.init();
      const progress = {};
      for (const ayah of displayAyahs) {
        progress[ayah.numberInSurah] = MemorizationManager.getVerseProgress(
          validatedSurahNumber, 
          ayah.numberInSurah
        );
      }
      setVerseProgress(progress);
      
    } catch (e) {
      console.error("Error loading data:", e);
      
      Alert.alert(
        'خطأ في التحميل',
        'فشل تحميل السورة. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.',
        [
          {
            text: 'حاول مرة أخرى',
            onPress: () => loadData()
          },
          {
            text: 'رجوع',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } finally {
      setIsLoading(false);
    }
  }, [validatedSurahNumber, validatedAyahNumber, navigation]); // Added navigation to dependencies

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [loadData])
  );

  const handleBookmark = useCallback(async (ayah) => {
    const key = `${validatedSurahNumber}:${ayah.numberInSurah}`;
    
    setBookmarkedAyahs(prevBookmarks => {
      const newBookmarks = { ...prevBookmarks };
      if (newBookmarks[key]) {
        delete newBookmarks[key];
        showToast('تمت إزالة العلامة المرجعية.');
      } else {
        newBookmarks[key] = {
          surah: validatedSurahNumber,
          ayah: ayah.numberInSurah,
          text: ayah.text,
          surahName: surahData.name,
          createdAt: Date.now(),
        };
        showToast('تم حفظ العلامة المرجعية.');
      }
      setJSON(STORAGE_KEYS.BOOKMARKS, newBookmarks);
      return newBookmarks;
    });
  }, [validatedSurahNumber, surahData.name]);

  const handleMemorized = useCallback(async () => {
    const memorizedMap = await getJSON(STORAGE_KEYS.MEMORIZED, {});
    const isCurrentlyMemorized = !!memorizedMap[validatedSurahNumber];

    if (isCurrentlyMemorized) {
      delete memorizedMap[validatedSurahNumber];
      showToast('تمت إزالة السورة من المحفوظات.');
    } else {
      memorizedMap[validatedSurahNumber] = {
        surah: validatedSurahNumber,
        ayahsCount: totalAyahsRef.current,
        surahName: surahData.name,
      };
      showToast('تم حفظ السورة كـ"محفوظة".');
    }
    setIsMemorized(prev => !prev);
    await setJSON(STORAGE_KEYS.MEMORIZED, memorizedMap);
  }, [validatedSurahNumber, surahData.name]);

  const handleProgress = useCallback(async (item) => {
    if (!item || !item.surah || item.numberInSurah === 0) return;

    try {
      const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
      if (!settings.goal) return;

      const today = new Date().toDateString();
      const progress = await getJSON(STORAGE_KEYS.PROGRESS, {}) || {};
      
      if (!progress[today]) {
        progress[today] = { ayahs: [], goalAchievedToday: false };
      }
      
      progress[today].currentSurahNumber = validatedSurahNumber;
      progress[today].totalAyahsInSurah = totalAyahsRef.current;
      
      const uniqueAyah = `${validatedSurahNumber}:${item.numberInSurah}`;

      if (!progress[today].ayahs.includes(uniqueAyah)) {
        progress[today].ayahs.push(uniqueAyah);
        
        let goalAchieved = false;
        if (settings.goal.type === 'verses' && progress[today].ayahs.length >= settings.goal.value) {
          goalAchieved = true;
        }
        
        if (goalAchieved && !progress[today].goalAchievedToday) {
          progress[today].goalAchievedToday = true;
          showToast('تهانينا! لقد حققت هدفك اليومي.');
        }
        await setJSON(STORAGE_KEYS.PROGRESS, progress);
      }
    } catch (e) { 
      console.error("Progress tracking error:", e); 
    }
  }, [validatedSurahNumber]);

  const handleMemorizationUpdate = useCallback(async (ayah, status) => {
    try {
      const updatedProgress = await MemorizationManager.updateVerseStatus(
        validatedSurahNumber,
        ayah.numberInSurah,
        status
      );
      
      setVerseProgress(prev => ({
        ...prev,
        [ayah.numberInSurah]: updatedProgress
      }));
      
      if (currentAyah && currentAyah.numberInSurah === ayah.numberInSurah) {
        setCurrentAyah({...currentAyah});
      }
      
      let statusText = '';
      switch (status) {
        case MemorizationStatus.MASTERED:
          statusText = 'مبارك! لقد أتقنت هذه الآية';
          break;
        case MemorizationStatus.REVIEWING:
          statusText = 'تم إضافة الآية إلى قائمة المراجعة';
          break;
        case MemorizationStatus.LEARNING:
          statusText = 'تم بدء عملية حفظ الآية';
          break;
        default:
          statusText = 'تم تحديث حالة الآية';
      }
      
      showToast(statusText);
    } catch (error) {
      console.error('Failed to update memorization progress:', error);
      showToast('فشل في تحديث حالة الحفظ');
    }
  }, [validatedSurahNumber, currentAyah]);

  const getStatusText = (status) => {
    switch (status) {
      case MemorizationStatus.MASTERED: return 'تم إتقانه';
      case MemorizationStatus.REVIEWING: return 'بحاجة مراجعة';
      case MemorizationStatus.LEARNING: return 'قيد الحفظ';
      default: return 'لم يبدأ بعد';
    }
  };

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const currentItem = viewableItems[0].item;
      setCurrentAyah(currentItem);
      
      if (currentItem.numberInSurah === 0) {
        setActiveAyahIndicator('بِسْمِ ٱللَّهِ');
      } else {
        setActiveAyahIndicator(`${currentItem.numberInSurah} / ${totalAyahsRef.current}`);
      }
    }
  }, [totalAyahsRef]);

  const handleToggleAyahMastery = useCallback(async () => {
    if (!currentAyah || currentAyah.numberInSurah === 0) return;
    
    try {
      const currentStatus = verseProgress[currentAyah.numberInSurah]?.status;
      const newStatus = currentStatus === MemorizationStatus.MASTERED ? 
        MemorizationStatus.NOT_STARTED : 
        MemorizationStatus.MASTERED;
      
      await handleMemorizationUpdate(currentAyah, newStatus);
    } catch (error) {
      console.error('Failed to toggle ayah mastery:', error);
    }
  }, [currentAyah, verseProgress, handleMemorizationUpdate]);
  
  const playSingleAyah = useCallback(async (ayah) => {
  if (!audioEnabled || !ayah.audio) return;
  
  try {
    await AudioService.play(ayah.audio);
  } catch (error) {
    console.error("Failed to play audio", error);
  }
}, [audioEnabled]);

  useEffect(() => {
    if (!isLoading && initialScrollIndex > 0 && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current.scrollToIndex({
          index: initialScrollIndex,
          animated: false
        });
      }, 100);
    }
  }, [isLoading, initialScrollIndex]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>جاري تحميل السورة...</Text>
      </View>
    );
  }

  const isCurrentAyahMastered = currentAyah && currentAyah.numberInSurah !== 0 && 
    verseProgress[currentAyah.numberInSurah]?.status === MemorizationStatus.MASTERED;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={20}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text_dark} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>{surahData.name}</Text>
          <Text style={styles.ayahIndicator}>{activeAyahIndicator}</Text>
        </View>
        
        <TouchableOpacity 
          onPress={handleToggleAyahMastery} 
          hitSlop={20}
          disabled={!currentAyah || currentAyah.numberInSurah === 0}
        >
          <MaterialIcons 
            name={isCurrentAyahMastered ? "check-circle" : "check-circle-outline"} 
            size={24} 
            color={isCurrentAyahMastered ? colors.success : colors.text_light}
          />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => setShowReciterModal(true)}
          hitSlop={20}
          style={{ marginLeft: 16 }}
        >
          <MaterialIcons name="music-note" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={surahData.ayahs}
        keyExtractor={(item) => String(item.number)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        initialScrollIndex={initialScrollIndex}
        renderItem={({ item }) => (
          <FocusAyahView
            ayah={item}
            isBookmarked={!!bookmarkedAyahs[`${validatedSurahNumber}:${item.numberInSurah}`]}
            onPlayAudio={() => playSingleAyah(item)}
            onBookmark={handleBookmark}
            onViewedAyah={handleProgress}
            memorizationProgress={verseProgress[item.numberInSurah]}
            onMemorizationUpdate={(status) => handleMemorizationUpdate(item, status)}
          />
        )}
      />
      
      {showAudioPlayer && (
        <AdvancedAudioPlayer 
          verse={currentVerse}
          onClose={() => {
            AudioService.stop();
            setShowAudioPlayer(false);
          }}
        />
      )}
      
      <ReciterModal
        visible={showReciterModal}
        onClose={() => setShowReciterModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F7F7F7', 
    paddingTop: Platform.OS === 'android' ? 25 : 50, 
  },
  centered: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  header: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1, 
    borderBottomColor: '#e2e8f0', 
    backgroundColor: '#FFFFFF', 
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 12,
  },
  headerTitle: { 
    textAlign: 'center',
    fontSize: 22, 
    fontWeight: 'bold', 
    color: '#0f172a', 
    fontFamily: 'Amiri_700Bold',
  },
  ayahIndicator: { 
    fontSize: 16, 
    color: '#64748b', 
    textAlign: 'center',
    marginTop: 4,
  },
});