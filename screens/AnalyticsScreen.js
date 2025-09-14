import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProgressChart } from 'react-native-chart-kit';
import { getJSON } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';
import MemorizationManager from '../services/MemorizationManager';

const colors = {
  primary: '#14b8a6',
  primary_light: '#ccfbf1',
  secondary_50: '#f8fafc',
  secondary_600: '#475569',
  secondary_900: '#0f172a',
  white: '#FFFFFF',
  bg: '#f8fafc',
  text_dark: '#0f172a',
};

const AnalyticsScreen = () => {
  const [stats, setStats] = useState({
    totalAyahsRead: 0,
    favoriteSurahs: [],
    readingStreak: 0,
    timeSpent: 0,
    memorizationProgress: 0,
  });
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const progress = await getJSON(STORAGE_KEYS.PROGRESS, {});
      const bookmarks = await getJSON(STORAGE_KEYS.BOOKMARKS, {});
      await MemorizationManager.init();
      const memStats = await MemorizationManager.getStats();
      
      // Calculate statistics
      const totalAyahsRead = Object.values(progress).reduce((total, day) => 
        total + (day.ayahs ? day.ayahs.length : 0), 0);
      
      // Calculate reading streak
      const dates = Object.keys(progress).sort();
      let streak = 0;
      let currentStreak = 0;
      const today = new Date();
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toDateString();
        
        if (progress[dateStr] && progress[dateStr].ayahs.length > 0) {
          currentStreak++;
          streak = Math.max(streak, currentStreak);
        } else {
          currentStreak = 0;
        }
      }
      
      // Find favorite surahs
      const surahCount = {};
      Object.values(progress).forEach(day => {
        if (day.ayahs) {
          day.ayahs.forEach(ayah => {
            const surah = ayah.split(':')[0];
            surahCount[surah] = (surahCount[surah] || 0) + 1;
          });
        }
      });
      
      const favoriteSurahs = Object.entries(surahCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([surah, count]) => ({ surah, count }));
      
      setStats({
        totalAyahsRead,
        favoriteSurahs,
        readingStreak: streak,
        timeSpent: Object.values(progress).reduce((total, day) => 
          total + (day.timeSpent || 0), 0),
        memorizationProgress: memStats.mastered > 0 ? 
          Math.round((memStats.mastered / memStats.total) * 100) : 0,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: colors.white,
    backgroundGradientTo: colors.white,
    color: (opacity = 1) => `rgba(20, 184, 166, ${opacity})`,
    strokeWidth: 2,
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 25 : insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإحصائيات</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>التقدم العام</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalAyahsRead}</Text>
              <Text style={styles.statLabel}>آية مقروءة</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.readingStreak}</Text>
              <Text style={styles.statLabel}>يوم متتالي</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.memorizationProgress}%</Text>
              <Text style={styles.statLabel}>تم إتقانها</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>السور المفضلة</Text>
          {stats.favoriteSurahs.map((item, index) => (
            <View key={index} style={styles.favoriteItem}>
              <Text style={styles.favoriteName}>سورة {item.surah}</Text>
              <Text style={styles.favoriteCount}>{item.count} مرة</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.card}>
          <Text style={styles.cardTitle}>توزيع الوقت</Text>
          <ProgressChart
            data={{
              labels: ["حفظ", "مراجعة", "تلاوة"],
              data: [0.4, 0.3, 0.6]
            }}
            width={300}
            height={200}
            strokeWidth={16}
            radius={32}
            chartConfig={chartConfig}
            hideLegend={false}
          />
        </View>
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
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text_dark,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  card: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text_dark,
    marginBottom: 16,
    textAlign: 'right',
  },
  statsGrid: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.secondary_600,
    marginTop: 4,
  },
  favoriteItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.secondary_50,
  },
  favoriteName: {
    fontSize: 16,
    color: colors.text_dark,
  },
  favoriteCount: {
    fontSize: 14,
    color: colors.secondary_600,
  },
});

export default AnalyticsScreen;