import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useFontSettings } from '../context/FontSettingsContext';

const AyahView = ({ number, text, isActive }) => {
  const { colors } = useTheme();
  const { quranFont, quranFontSize } = useFontSettings();

  return (
    <View style={[
      styles.container, 
      { 
        borderColor: colors.border,
        backgroundColor: isActive ? colors.primary_light : 'transparent'
      }
    ]}>
      <Text style={[
        styles.ayahText, 
        { 
          color: colors.text_dark, 
          fontFamily: quranFont,
          fontSize: quranFontSize,
          lineHeight: quranFontSize * 1.8
        }
      ]}>{text}</Text>
      <View style={[
        styles.numberCircle, 
        { 
          borderColor: colors.primary,
          backgroundColor: isActive ? colors.primary : 'transparent'
        }
      ]}>
        <Text style={[
          styles.numberText, 
          { 
            color: isActive ? '#FFFFFF' : colors.primary
          }
        ]}>{number}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    paddingVertical: 16, 
    paddingHorizontal: 16, 
    borderBottomWidth: 1, 
    borderRadius: 8 
  },
  ayahText: { 
    textAlign: 'right', 
    writingDirection: 'rtl',
  },
  numberCircle: { 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    borderWidth: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 12,
    alignSelf: 'flex-end'
  },
  numberText: { 
    fontSize: 14,
  }
});

export default AyahView;