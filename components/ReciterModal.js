// components/ReciterModal.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AudioService from '../services/AudioService';

const ReciterModal = ({ visible, onClose }) => {
  const { colors } = useTheme();
  const [reciters, setReciters] = useState([]);
  const [selectedReciter, setSelectedReciter] = useState('');

  useEffect(() => {
    loadReciters();
  }, []);

  const loadReciters = async () => {
    const availableReciters = AudioService.getReciters();
    const currentReciter = AudioService.getCurrentReciter();
    
    setReciters(availableReciters);
    setSelectedReciter(currentReciter);
  };

  const handleReciterSelect = async (reciterId) => {
    setSelectedReciter(reciterId);
    await AudioService.setReciter(reciterId);
    
    // Close modal after a short delay
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const renderReciterItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.reciterItem,
        { backgroundColor: colors.card, borderColor: colors.border }
      ]}
      onPress={() => handleReciterSelect(item.id)}
    >
      <Text style={[styles.reciterName, { color: colors.text_dark }]}>
        {item.name}
      </Text>
      {selectedReciter === item.id && (
        <MaterialIcons name="check" size={20} color={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text_dark }]}>
              اختر القارئ
            </Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={colors.text_dark} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={reciters}
            keyExtractor={(item) => item.id}
            renderItem={renderReciterItem}
            contentContainerStyle={styles.listContent}
          />
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
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 16,
  },
  reciterItem: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  reciterName: {
    fontSize: 16,
  },
});

export default ReciterModal;