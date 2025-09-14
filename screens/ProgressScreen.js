import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getJSON } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';
import * as Progress from 'react-native-progress';
import { getDailyProgress, resetDailyProgress } from '../storage/progress';
import MemorizationManager from '../services/MemorizationManager';
import { MemorizationStatus } from '../types/memorization';

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

const ProgressScreen = () => {
  const [goal, setGoal] = useState({});
  const [progressData, setProgressData] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const insets = useSafeAreaInsets();

  const loadProgress = useCallback(async () => {
    setRefreshing(true);
    const progress = await getDailyProgress();
    const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
    
    // Load memorization progress for the day
    await MemorizationManager.init();
    const memorizedVerses = MemorizationManager.getMemorizedVerses();
    const today = new Date().toDateString();
    const todayMemorized = memorizedVerses.filter(v => {
      const progressDate = new Date(v.progress.lastReviewed).toDateString();
      return progressDate === today;
    });

    setProgressData({
      ...progress,
      memorizedAyahs: todayMemorized.length,
    });
    setGoal(settings.goal || {});
    setRefreshing(false);
  }, []);

  useFocusEffect(useCallback(() => { loadProgress(); }, [loadProgress]));
  
  const handleReset = useCallback(async () => {
    await resetDailyProgress();
    await loadProgress();
  }, [loadProgress]);

  const renderProgressContent = () => {
    if (!goal || !goal.type) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>لم يتم تعيين هدف بعد. اذهب إلى علامة تبويب "الأهداف" لتبدأ.</Text>
        </View>
      );
    }

    const goalValue = goal.value;
    const isGoalAchieved = progressData?.goalAchievedToday || false;
    let progressPercentage = 0;
    let progressText = '';
    let descriptionText = '';

    switch (goal.type) {
      case 'verses': {
        const ayahsMemorized = progressData?.memorizedAyahs || 0;
        progressPercentage = goalValue > 0 ? Math.min(ayahsMemorized / goalValue, 1) : 0;
        progressText = `${ayahsMemorized} / ${goalValue} آية`;
        descriptionText = `لقد حفظت ${ayahsMemorized} آية من أصل ${goalValue} آية.`;
        break;
      }
      case 'percentage': {
        const ayahsMemorized = progressData?.memorizedAyahs || 0;
        const totalAyahs = progressData?.totalAyahsInSurah || 1;
        const currentPercentage = totalAyahs > 0 ? (ayahsMemorized / totalAyahs) * 100 : 0;
        progressPercentage = goalValue > 0 ? Math.min(currentPercentage / goalValue, 1) : 0;
        progressText = `${Math.round(currentPercentage)}% / ${goalValue}%`;
        descriptionText = `لقد أكملت ${Math.round(currentPercentage)}% من السورة.`;
        break;
      }
      case 'time': {
        const timeSpentInSeconds = progressData?.timeSpent || 0;
        const goalInSeconds = goalValue * 60;
        const timeSpentInMinutes = Math.floor(timeSpentInSeconds / 60);
        progressPercentage = goalInSeconds > 0 ? Math.min(timeSpentInSeconds / goalInSeconds, 1) : 0;
        progressText = `${timeSpentInMinutes} / ${goalValue} دقيقة`;
        descriptionText = `لقد قضيت ${timeSpentInMinutes} دقيقة من هدفك وهو ${goalValue} دقيقة.`;
        break;
      }
    }

    return (
      <View style={styles.content}>
        <Text style={styles.goalTitle}>{isGoalAchieved ? 'تهانينا!' : 'هدف اليوم'}</Text>
        <Text style={styles.goalSubtitle}>{isGoalAchieved ? 'لقد حققت هدفك اليومي.' : progressText}</Text>
        <View style={styles.progressBarContainer}>
          <Progress.Bar progress={progressPercentage} width={null} color={colors.primary} unfilledColor={colors.primary_light} borderWidth={0} height={10} borderRadius={10} />
        </View>
        <Text style={styles.progressText}>{descriptionText}</Text>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>إعادة تعيين الهدف اليومي</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 25 : insets.top }]}>
      <View style={styles.header}>
          <Text style={styles.headerTitle}>تقدمك</Text>
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadProgress} tintColor={colors.primary} />}>
        {renderProgressContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
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
  scrollContent: { flexGrow: 1, paddingHorizontal: 16 },
  content: { backgroundColor: colors.white, borderRadius: 12, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3, },
  goalTitle: { fontSize: 22, fontWeight: 'bold', color: colors.secondary_900 },
  goalSubtitle: { fontSize: 16, color: colors.secondary_600, marginTop: 4 },
  progressBarContainer: { width: '100%', marginTop: 20 },
  progressText: { fontSize: 16, color: colors.secondary_600, marginTop: 10, textAlign: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  emptyText: { fontSize: 16, color: colors.secondary_600, textAlign: 'center', paddingHorizontal: 20 },
  resetButton: { marginTop: 20, backgroundColor: colors.primary_light, paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, },
  resetButtonText: { color: colors.primary, fontWeight: 'bold', }
});

export default ProgressScreen;