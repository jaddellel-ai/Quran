// App.js
import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, Amiri_400Regular, Amiri_700Bold } from '@expo-google-fonts/amiri';
import { Kufam_400Regular, Kufam_700Bold } from '@expo-google-fonts/kufam';

// Import all top-level screens and navigators
import OnboardingScreen from './screens/OnboardingScreen';
import MainTabNavigator from './navigation/MainTabNavigator';
import SurahReaderScreen from './screens/SurahReaderScreen';

// Import context providers
import { ThemeProvider } from './context/ThemeContext';
import { FontSettingsProvider } from './context/FontSettingsContext';

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    Amiri_400Regular,
    Amiri_700Bold,
    Kufam_400Regular,
    Kufam_700Bold,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [initialTab, setInitialTab] = useState('السور');

  useEffect(() => {
    // Simulate loading process
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const handleFinishOnboarding = (targetTab = 'السور') => {
    setShowOnboarding(false);
    setInitialTab(targetTab);
  };

  const handleShowOnboarding = () => {
    setShowOnboarding(true);
  };

  // Show loading indicator while fonts are loading or app is initializing
  if (!fontsLoaded || isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.centered}>
          <ActivityIndicator size="large" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <FontSettingsProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {showOnboarding ? (
                <Stack.Screen name="Onboarding">
                  {(props) => <OnboardingScreen {...props} onFinish={handleFinishOnboarding} />}
                </Stack.Screen>
              ) : (
                <>
                  <Stack.Screen name="MainApp">
                    {(props) => <MainTabNavigator {...props} onShowOnboarding={handleShowOnboarding} initialTab={initialTab} />}
                  </Stack.Screen>
                  <Stack.Screen name="SurahReader" component={SurahReaderScreen} />
                </>
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </FontSettingsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});