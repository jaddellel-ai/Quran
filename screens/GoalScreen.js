import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GoalSlider from '../components/GoalSlider';
import { getJSON, setJSON, showToast } from '../storage';
import { STORAGE_KEYS } from '../storage/schema';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';

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
};

const GoalScreen = () => {
  const [goalType, setGoalType] = useState('verses');
  const [verses, setVerses] = useState(10);
  const [time, setTime] = useState(30);
  const [percentage, setPercentage] = useState(5);
  const [isSaving, setIsSaving] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute();

  useFocusEffect(
    useCallback(() => {
      const loadGoals = async () => {
        try {
          const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
          const goal = settings.goal;
          if (goal) {
            setGoalType(goal.type);
            switch (goal.type) {
              case 'verses': setVerses(goal.value); break;
              case 'time': setTime(goal.value); break;
              case 'percentage': setPercentage(goal.value); break;
            }
          }
        } catch (e) {
          console.error('Failed to load goals:', e);
        }
      };
      loadGoals();
    }, [])
  );

  // In GoalScreen.js, update the handleSaveGoals function
// In GoalScreen.js, update the handleSaveGoals function
// In GoalScreen.js, update the handleSaveGoals function
const handleSaveGoals = async () => {
  if (isSaving) return;
  
  setIsSaving(true);
  
  try {
    const settings = await getJSON(STORAGE_KEYS.SETTINGS, {});
    let goalToSave = {};

    switch (goalType) {
      case 'verses': goalToSave = { type: 'verses', value: verses }; break;
      case 'time': goalToSave = { type: 'time', value: time }; break;
      case 'percentage': goalToSave = { type: 'percentage', value: percentage }; break;
    }
    
    settings.goal = goalToSave;
    await setJSON(STORAGE_KEYS.SETTINGS, settings);
    
    showToast('تم حفظ هدفك بنجاح.');
    
    // Navigate to Surahs screen after saving
    navigation.navigate('السور');
  } catch (e) {
    console.error('Failed to save goals:', e);
    if (e.message !== 'Toast debounced') {
      showToast('فشل في حفظ الهدف.');
    }
  } finally {
    setIsSaving(false);
  }
};
  return (
    <View style={[styles.container, { paddingTop: Platform.OS === 'android' ? 25 : insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>تحديد الأهداف</Text>
      </View>

      <ScrollView contentContainerStyle={styles.mainContent}>
        <View style={styles.goalTypeSelector}>
           <TouchableOpacity
              style={[styles.goalTypeButton, goalType === 'verses' && styles.activeButton]}
              onPress={() => setGoalType('verses')}>
              <Text style={[styles.goalTypeText, goalType === 'verses' && styles.activeText]}>عدد الآيات</Text>
           </TouchableOpacity>
           <TouchableOpacity
              style={[styles.goalTypeButton, goalType === 'time' && styles.activeButton]}
              onPress={() => setGoalType('time')}>
              <Text style={[styles.goalTypeText, goalType === 'time' && styles.activeText]}>الوقت</Text>
           </TouchableOpacity>
           <TouchableOpacity
              style={[styles.goalTypeButton, goalType === 'percentage' && styles.activeButton]}
              onPress={() => setGoalType('percentage')}>
              <Text style={[styles.goalTypeText, goalType === 'percentage' && styles.activeText]}>نسبة السورة</Text>
           </TouchableOpacity>
        </View>

        <View style={styles.sliderSection}>
          <GoalSlider
            label="عدد الآيات"
            min={1} max={100} step={1}
            value={verses}
            onValueChange={setVerses}
            disabled={goalType !== 'verses'}
          />
          <GoalSlider
            label="الوقت المخصص (بالدقائق)"
            min={5} max={120} step={5}
            value={time}
            onValueChange={setTime}
            disabled={goalType !== 'time'}
          />
          <GoalSlider
            label="نسبة السورة المئوية"
            min={1} max={100} step={1}
            value={percentage}
            onValueChange={setPercentage}
            disabled={goalType !== 'percentage'}
          />
        </View>
        <TouchableOpacity 
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]} 
          onPress={handleSaveGoals}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? 'جاري الحفظ...' : 'حفظ الأهداف'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bg },
    header: {
      paddingHorizontal: 16,
      paddingTop: 20,
      paddingBottom: 20,
      flexDirection: 'row-reverse',
      alignItems: 'center',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text_dark,
    },
    mainContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 24 },
    goalTypeSelector: { flexDirection: 'row-reverse', backgroundColor: colors.primary_light, borderRadius: 12, padding: 4 },
    goalTypeButton: { flex: 1, paddingVertical: 10, borderRadius: 8 },
    activeButton: { backgroundColor: colors.white, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 3 },
    goalTypeText: { textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.secondary_700 },
    activeText: { color: colors.primary },
    sliderSection: { gap: 16 },
    saveButton: { backgroundColor: colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 16 },
    saveButtonDisabled: { backgroundColor: colors.secondary_600, opacity: 0.7 },
    saveButtonText: { color: colors.white, fontSize: 18, fontWeight: 'bold' }
});

export default GoalScreen;