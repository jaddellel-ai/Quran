import React from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const SurahTipsModal = ({ visible, onClose, surahNumber, surahName, tipsData }) => {
  const { colors } = useTheme();

  if (!tipsData) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text_dark }]}>
              نصائح لحفظ {surahName}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text_dark} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.tipsContainer}>
            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                هيكل السورة
              </Text>
              <Text style={[styles.sectionContent, { color: colors.text_dark }]}>
                {tipsData.structure}
              </Text>
            </View>

            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                المدة المقترحة للحفظ
              </Text>
              <Text style={[styles.sectionContent, { color: colors.text_dark }]}>
                {tipsData.daysToMemorize} يوم
              </Text>
            </View>

            <View style={[styles.section, { borderBottomColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                القراء المقترحون
              </Text>
              <Text style={[styles.sectionContent, { color: colors.text_dark }]}>
                {tipsData.recommendedReciters.join('، ')}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                نصائح الحفظ
              </Text>
              {tipsData.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <Text style={[styles.tipNumber, { color: colors.primary }]}>
                    {index + 1}
                  </Text>
                  <Text style={[styles.tipText, { color: colors.text_dark }]}>
                    {tip}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: colors.primary }]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>حسناً</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  tipsContainer: {
    marginBottom: 20,
  },
  section: {
    borderBottomWidth: 1,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'right',
  },
  sectionContent: {
    fontSize: 16,
    textAlign: 'right',
    lineHeight: 24,
  },
  tipItem: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    lineHeight: 24,
  },
  closeButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SurahTipsModal;