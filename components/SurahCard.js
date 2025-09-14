import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// Add this import at the top
import MemorizationProgress from './MemorizationProgress';

// Then use it in your component
<MemorizationProgress 
  progress={memorizationProgress[item.number] || 0} 
  colors={colors} 
/>

const colors = {
    primary: '#0d9488',
    text_dark: '#1e293b',
    text_light: '#64748b',
    background: '#F8F9FA',
    border: '#E5E7EB',
    icon_bg: '#F5EFE7',
    white: '#FFFFFF'
};

/**
 * Returns the grammatically correct Arabic string for the number of ayahs.
 * @param {number} count The number of ayahs.
 * @returns {string} The formatted string (e.g., "آية واحدة", "آيتان", "10 آيات", "11 آية").
 */
const getAyahCountText = (count) => {
    if (count === 1) {
        return 'آية واحدة';
    }
    if (count === 2) {
        return 'آيتان';
    }
    if (count >= 3 && count <= 10) {
        return `${count} آيات`;
    }
    // For 11 and above, the counted noun (tamyiz) reverts to singular.
    return `${count} آية`;
};

// In your surah card component
<MemorizationProgress 
  progress={memorizationProgress[item.number] || 0} 
  colors={colors} 
/>

const SurahCard = ({ number, name, numberOfAyahs, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <View style={styles.leftContainer}>
        <View style={styles.iconPlaceholder}>
            <MaterialIcons name="auto-stories" size={24} color={colors.primary} />
        </View>
        <View style={styles.textContainer}>
            <Text style={styles.surahName}>{name}</Text>
            {/* Use the helper function to display the correct text */}
            <Text style={styles.ayahCount}>{getAyahCountText(numberOfAyahs)}</Text>
        </View>
    </View>
    <View style={styles.numberCircle}>
        <Text style={styles.numberText}>{number}</Text>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row-reverse',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 16,
        padding: 12,
        marginHorizontal: 16,
        borderWidth: 1,
        borderColor: colors.border
    },
    leftContainer: {
        flexDirection: 'row-reverse',
        alignItems: 'center',
        gap: 16
    },
    iconPlaceholder: {
        width: 60,
        height: 60,
        borderRadius: 12,
        backgroundColor: colors.icon_bg,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textContainer: {},
    surahName: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text_dark,
        textAlign: 'right',
        marginBottom: 4,
        fontFamily: 'Amiri_700Bold'
    },
    ayahCount: {
        fontSize: 14,
        color: colors.text_light,
        textAlign: 'right',
        fontFamily: 'Amiri_400Regular'
    },
    numberCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border
    },
    numberText: {
        color: colors.text_light,
        fontWeight: '600',
        fontSize: 14
    }
});

export default SurahCard;

