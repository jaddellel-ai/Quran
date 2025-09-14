import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  I18nManager,
  Platform,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';
import { getJSON, setJSON, showToast } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';
import { useFocusEffect } from '@react-navigation/native';

const colors = {
  primary: '#0d9488',
  text_dark: '#0f172a',
  text_light: '#64748b',
  card: '#FFFFFF',
  border: '#E5E7EB',
  bg: '#f8fafc',
  danger: '#DC2626',
  danger_bg: '#FEF2F2',
  chip_bg: '#E6FFFA',
  gray_400: '#9ca3af',
};

const normalizeArabic = (s = '') =>
  s
    .replace(/[\u064B-\u0652\u0670\u06D6-\u06ED]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');

export default function FavoritesScreen({ navigation }) {
  const [items, setItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    try {
      setRefreshing(true);
      const map = await getJSON(STORAGE_KEYS.BOOKMARKS, {});
      const arr = Object.entries(map).map(([key, v]) => ({ key, ...v }));
      arr.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setItems(arr);
    } catch (e) {
      console.error('Failed to load bookmarks:', e);
      showToast('فشل في تحميل المفضلة.');
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const removeBookmark = useCallback(async (key) => {
    try {
      setItems((prev) => prev.filter((x) => x.key !== key));
      const map = await getJSON(STORAGE_KEYS.BOOKMARKS, {});
      delete map[key];
      await setJSON(STORAGE_KEYS.BOOKMARKS, map);
      showToast('تمت إزالة العلامة المرجعية.');
    } catch (e) {
      console.error('Failed to remove bookmark:', e);
      showToast('فشل في إزالة العلامة المرجعية.');
    }
  }, []);

  const clearAll = useCallback(async () => {
    Alert.alert(
      'حذف كل المفضلة',
      'هل أنت متأكد أنك تريد حذف جميع العلامات المرجعية؟ لا يمكن التراجع عن هذا الإجراء.',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'حذف الكل',
          style: 'destructive',
          onPress: async () => {
            try {
              setItems([]);
              await setJSON(STORAGE_KEYS.BOOKMARKS, {});
              showToast('تم حذف كل العلامات المرجعية.');
            } catch (e) {
              console.error('Failed to clear bookmarks:', e);
              showToast('فشل في حذف المفضلة.');
            }
          },
        },
      ]
    );
  }, []);

  const openAyah = (surah, ayah) => {
    if (surah && ayah !== undefined) {
      navigation.navigate('SurahReader', {
        surahNumber: parseInt(surah),
        initialAyahNumberInSurah: parseInt(ayah),
      });
    }
  };

  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const qNorm = normalizeArabic(query).toLowerCase();
    return items.filter((it) =>
      normalizeArabic(it.surahName || '').toLowerCase().includes(qNorm) ||
      normalizeArabic(it.text || '').toLowerCase().includes(qNorm)
    );
  }, [items, query]);

  const renderRightActions = (key) => (
    <View style={styles.swipeRightWrap}>
      <TouchableOpacity onPress={() => removeBookmark(key)} style={styles.swipeDeleteBtn}>
        <MaterialIcons name="delete-outline" size={22} color={colors.danger} />
        <Text style={styles.swipeDeleteText}>حذف</Text>
      </TouchableOpacity>
    </View>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.key)}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.surahName}>{item.surahName}</Text>
          <View style={styles.headerRight}>
            <View style={styles.ayahChip}>
              <MaterialIcons name="bookmark" size={14} color={colors.primary} />
              <Text style={styles.ayahChipText}>آية {item.ayah}</Text>
            </View>
            <TouchableOpacity onPress={() => removeBookmark(item.key)}>
              <MaterialIcons name="delete-outline" size={20} color={colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openAyah(item.surah, item.ayah)}
        >
          <Text style={styles.ayahText} numberOfLines={3}>{item.text}</Text>
        </TouchableOpacity>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 25 : insets.top }]}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>المفضلة</Text>
          {items.length > 0 && (
            <TouchableOpacity onPress={clearAll} style={styles.clearBtn}>
              <MaterialIcons name="delete-sweep" size={22} color={colors.danger} />
              <Text style={styles.clearText}>حذف الكل</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.gray_400} style={styles.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ابحث في المفضلة…"
            placeholderTextColor={colors.gray_400}
            style={styles.searchInput}
            textAlign={I18nManager.isRTL ? 'right' : 'right'}
          />
        </View>

        {filtered.length === 0 ? (
          <View style={styles.emptyWrap}>
            <MaterialIcons name="bookmark-border" size={56} color={colors.text_light} />
            <Text style={styles.emptyTitle}>
              {query ? 'لا توجد نتائج' : 'لا توجد إشارات مرجعية'}
            </Text>
            <Text style={styles.emptyText}>
              {query ? 'جرّب كلمة أخرى.' : 'احفظ آية من شاشة القراءة لتظهر هنا.'}
            </Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(it) => it.key}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} tintColor={colors.primary} />}
            contentContainerStyle={styles.listContent}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          />
        )}
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text_dark,
  },
  clearBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, padding: 6 },
  clearText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
  searchContainer: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, marginHorizontal: 16, paddingHorizontal: 12, borderWidth: 1, borderColor: colors.border, height: 44, marginTop: 12, marginBottom: 8, },
  searchIcon: { marginLeft: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 16, color: colors.text_dark, writingDirection: 'rtl', },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 24 },
  emptyTitle: { fontSize: 18, color: colors.text_dark, fontWeight: '700' },
  emptyText: { fontSize: 14, color: colors.text_light, textAlign: 'center' },
  listContent: { paddingHorizontal: 16, paddingBottom: 16 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border },
  cardHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, },
  headerRight: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8 },
  surahName: { fontSize: 16, fontWeight: '700', color: colors.text_dark, fontFamily: 'Amiri_700Bold', },
  ayahChip: { backgroundColor: colors.chip_bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 6, },
  ayahChipText: { color: colors.primary, fontSize: 12 },
  ayahText: { fontSize: 20, color: colors.text_dark, textAlign: 'right', writingDirection: 'rtl', fontFamily: 'Amiri_400Regular', },
  swipeRightWrap: { justifyContent: 'center', alignItems: 'flex-start', backgroundColor: colors.danger_bg, borderRadius: 16, },
  swipeDeleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 24, height: '100%', },
  swipeDeleteText: { color: colors.danger, fontSize: 14, fontWeight: '600' },
});