// services/AudioService.js
import { Audio } from 'expo-av';

class AudioService {
  constructor() {
    this.sound = null;
    this.isPlaying = false;
    this.playbackRate = 1.0;
  }

  async init() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      return true;
    } catch (error) {
      console.error('Failed to initialize audio service:', error);
      return false;
    }
  }

  async play(audioUrl) {
    try {
      // Stop any currently playing audio
      if (this.sound) {
        await this.sound.stopAsync();
        await this.sound.unloadAsync();
      }

      // Load and play the new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true }
      );

      this.sound = sound;
      this.isPlaying = true;
      
      return true;
    } catch (error) {
      console.error("Failed to play audio:", error);
      return false;
    }
  }

  async stop() {
    if (this.sound) {
      await this.sound.stopAsync();
      await this.sound.unloadAsync();
      this.sound = null;
      this.isPlaying = false;
    }
  }

  async cleanup() {
    if (this.sound) {
      await this.sound.unloadAsync();
      this.sound = null;
    }
    this.isPlaying = false;
  }
}

export default new AudioService();