import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Slider } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import AudioService from '../services/AudioService';

const AdvancedAudioPlayer = ({ verse, onClose }) => {
  const { colors } = useTheme();
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLooping, setIsLooping] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    const loadAudio = async () => {
      if (!verse || !verse.audio) return;
      
      const success = await AudioService.loadTrack(verse.audio, {
        surah: verse.surah,
        ayah: verse.ayah,
        text: verse.text
      });
      
      if (success) {
        const status = await AudioService.sound.getStatusAsync();
        if (status.isLoaded) {
          setDuration(status.durationMillis);
        }
        
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        
        intervalRef.current = setInterval(updatePosition, 500);
      }
    };

    loadAudio();
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [verse]);

  const updatePosition = async () => {
    if (AudioService.sound) {
      const status = await AudioService.sound.getStatusAsync();
      if (status.isLoaded) {
        setPosition(status.positionMillis);
      }
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await AudioService.pause();
    } else {
      await AudioService.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = async (value) => {
    const newPosition = value * duration;
    await AudioService.seekTo(newPosition);
    setPosition(newPosition);
  };

  const handlePlaybackRateChange = async (rate) => {
    setPlaybackRate(rate);
    await AudioService.setPlaybackRate(rate);
  };

  const handleLoopToggle = async () => {
    const newLooping = !isLooping;
    setIsLooping(newLooping);
    await AudioService.setLooping(newLooping);
  };

  const formatTime = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  if (!verse) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text_dark }]}>
          سورة {verse.surahName} - آية {verse.ayah}
        </Text>
        <TouchableOpacity onPress={onClose}>
          <MaterialIcons name="close" size={24} color={colors.text_dark} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.progressContainer}>
        <Slider
          value={duration > 0 ? position / duration : 0}
          onValueChange={handleSeek}
          minimumTrackTintColor={colors.primary}
          maximumTrackTintColor={colors.border}
          thumbTintColor={colors.primary}
          style={styles.slider}
        />
        <View style={styles.timeContainer}>
          <Text style={[styles.time, { color: colors.text_light }]}>
            {formatTime(position)}
          </Text>
          <Text style={[styles.time, { color: colors.text_light }]}>
            {formatTime(duration)}
          </Text>
        </View>
      </View>
      
      <View style={styles.controls}>
        <TouchableOpacity onPress={handleLoopToggle}>
          <MaterialIcons 
            name="repeat" 
            size={24} 
            color={isLooping ? colors.primary : colors.text_light} 
          />
        </TouchableOpacity>
        
        <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
          <MaterialIcons 
            name={isPlaying ? "pause" : "play-arrow"} 
            size={36} 
            color={colors.primary} 
          />
        </TouchableOpacity>
        
        <View style={styles.playbackRateContainer}>
          <Text style={[styles.playbackRateLabel, { color: colors.text_light }]}>
            السرعة:
          </Text>
          <TouchableOpacity 
            onPress={() => handlePlaybackRateChange(0.75)}
            style={[styles.rateButton, playbackRate === 0.75 && styles.activeRateButton]}
          >
            <Text style={[styles.rateText, { color: playbackRate === 0.75 ? colors.primary : colors.text_light }]}>
              0.75x
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handlePlaybackRateChange(1.0)}
            style={[styles.rateButton, playbackRate === 1.0 && styles.activeRateButton]}
          >
            <Text style={[styles.rateText, { color: playbackRate === 1.0 ? colors.primary : colors.text_light }]}>
              1.0x
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handlePlaybackRateChange(1.5)}
            style={[styles.rateButton, playbackRate === 1.5 && styles.activeRateButton]}
          >
            <Text style={[styles.rateText, { color: playbackRate === 1.5 ? colors.primary : colors.text_light }]}>
              1.5x
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginBottom: 16,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  timeContainer: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  time: {
    fontSize: 12,
  },
  controls: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  playButton: {
    padding: 8,
    borderRadius: 30,
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  playbackRateContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  playbackRateLabel: {
    fontSize: 12,
    marginLeft: 8,
  },
  rateButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: 4,
  },
  activeRateButton: {
    backgroundColor: 'rgba(13, 148, 136, 0.1)',
  },
  rateText: {
    fontSize: 12,
  },
});

export default AdvancedAudioPlayer;