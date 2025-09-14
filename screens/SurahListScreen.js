import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Platform,
  TextInput,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { getJSON, setJSON, showToast } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';
import SurahTipsModal from '../components/SurahTipsModal';
import surahTips from '../data/surahTips.json';

const surahsData = require('../data/surahs.json');

const colors = {
  primary: '#0d9488',
  text_dark: '#0f172a',
  text_light: '#64748b',
  card: '#FFFFFF',
  border: '#E5E7EB',
  bg: '#f8fafc',
  gray_400: '#9ca3af',
};

const normalizeArabic = (s = '') => s.replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, '').replace(/[أإآٱ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي');

const revelationTypeArabic = {
  "Meccan": "مكية",
  "Medinan": "مدنية"
};

const SurahListScreen = ({ navigation }) => {
  const [query, setQuery] = useState('');
  const [memorized, setMemorized] = useState({});
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [tipsModalVisible, setTipsModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  const loadMemorized = useCallback(async () => {
    const memorizedSurahs = await getJSON(STORAGE_KEYS.MEMORIZED, {});
    setMemorized(memorizedSurahs);
  }, []);

  useFocusEffect(loadMemorized);

  const handleToggleMemorized = useCallback(async (surah) => {
    const surahNumber = surah.number;
    const isCurrentlyMemorized = !!memorized[surahNumber];
    
    const updatedMemorized = { ...memorized };
    if (isCurrentlyMemorized) {
      delete updatedMemorized[surahNumber];
      showToast('تمت الإزالة من المحفوظات.');
    } else {
      updatedMemorized[surahNumber] = {
        surah: surahNumber,
        ayahsCount: surah.numberOfAyahs,
        surahName: surah.name,
      };
      showToast('تم الحفظ في المحفوظات.');
    }
    
    setMemorized(updatedMemorized);
    await setJSON(STORAGE_KEYS.MEMORIZED, updatedMemorized);
  }, [memorized]);

  const handleTipsPress = (surah) => {
    setSelectedSurah(surah);
    setTipsModalVisible(true);
  };

  const filteredSurahs = useMemo(() => {
    if (!query.trim()) return surahsData;
    const qNorm = normalizeArabic(query);
    return surahsData.filter(
      (s) =>
        s.englishName.toLowerCase().includes(query.toLowerCase()) ||
        normalizeArabic(s.name).includes(qNorm)
    );
  }, [query]);

  const renderSurahCard = ({ item }) => {
    const isMemorized = !!memorized[item.number];
    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.card}
          onPress={() => navigation.navigate('SurahReader', { surahNumber: item.number })}
        >
          <View style={styles.cardLeftSection}>
            <TouchableOpacity 
              hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }} 
              onPress={() => handleToggleMemorized(item)}
            >
              <MaterialIcons
                name={isMemorized ? 'check-circle' : 'check-circle-outline'}
                size={26}
                color={isMemorized ? colors.primary : colors.text_light}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.cardRightSection}>
            <View style={styles.surahInfo}>
              <Text style={styles.surahName}>{item.name}</Text>
              <View style={styles.surahMeta}>
                <Text style={styles.metaText}>{revelationTypeArabic[item.revelationType]}</Text>
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{item.numberOfAyahs} آية</Text>
              </View>
            </View>
            <View style={styles.surahNumberCircle}>
              <Text style={styles.surahNumberText}>{item.number}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => handleTipsPress(item)}
          style={styles.tipsButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="lightbulb-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 25 : insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>السور</Text>
      </View>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={colors.gray_400} style={styles.searchIcon} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="ابحث عن سورة..."
          placeholderTextColor={colors.gray_400}
          style={styles.searchInput}
          textAlign={I18nManager.isRTL ? 'right' : 'right'}
        />
      </View>

      <FlatList
        data={filteredSurahs}
        keyExtractor={(item) => String(item.number)}
        renderItem={renderSurahCard}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <MaterialIcons name="search-off" size={48} color={colors.text_light} />
            <Text style={styles.emptyTitle}>لا نتائج</Text>
            <Text style={styles.emptyText}>جرّب كلمة أخرى.</Text>
          </View>
        )}
      />

      <SurahTipsModal
        visible={tipsModalVisible}
        onClose={() => setTipsModalVisible(false)}
        surahNumber={selectedSurah?.number}
        surahName={selectedSurah?.name}
        tipsData={selectedSurah ? surahTips[selectedSurah.number] : null}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text_dark,
  },
  searchContainer: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    backgroundColor: colors.card, 
    borderRadius: 12, 
    marginHorizontal: 16, 
    paddingHorizontal: 12, 
    borderWidth: 1, 
    borderColor: colors.border, 
    height: 44, 
    marginTop: 12, 
    marginBottom: 8, 
  },
  searchIcon: { marginLeft: 8 },
  searchInput: { 
    flex: 1, 
    height: 44, 
    fontSize: 16, 
    color: colors.text_dark, 
    writingDirection: 'rtl', 
  },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  cardContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  card: { 
    backgroundColor: colors.card, 
    borderRadius: 16, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderWidth: 1, 
    borderColor: colors.border, 
    flexDirection: 'row-reverse', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginLeft: 40, // Add space for the tips button
  },
  cardRightSection: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    gap: 16, 
    flex: 1 
  },
  surahNumberCircle: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: colors.primary, 
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  surahNumberText: { 
    color: 'white', 
    fontWeight: 'bold' 
  },
  surahInfo: { 
    alignItems: 'flex-end', 
    flex: 1 
  },
  surahName: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: colors.text_dark, 
    textAlign: 'right', 
  },
  surahMeta: { 
    flexDirection: 'row-reverse', 
    alignItems: 'center', 
    gap: 8, 
    marginTop: 4 
  },
  metaText: { 
    fontSize: 14, 
    color: colors.text_light 
  },
  metaDot: { 
    color: colors.text_light, 
    fontSize: 14 
  },
  cardLeftSection: { 
    paddingLeft: 8 
  },
  tipsButton: {
    position: 'absolute',
    left: 8, // Position on the left side with some padding
    top: '50%',
    marginTop: -15, // Center vertically (half of the icon size + padding)
    padding: 8,
    zIndex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Add background to make it more visible
    borderRadius: 20,
  },
  emptyWrap: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginTop: 50, 
    gap: 10, 
  },
  emptyTitle: { 
    fontSize: 18, 
    color: colors.text_dark, 
    fontWeight: '700', 
  },
  emptyText: { 
    fontSize: 14, 
    color: colors.text_light, 
    textAlign: 'center', 
  },
});

export default SurahListScreen;