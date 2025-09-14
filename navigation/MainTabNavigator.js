import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import AnalyticsScreen from '../screens/AnalyticsScreen';

import SurahListScreen from '../screens/SurahListScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import GoalScreen from '../screens/GoalScreen';
import ProgressScreen from '../screens/ProgressScreen';
import MemorizationScreen from '../screens/MemorizationScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function MainTabNavigator({ route, onShowOnboarding, initialTab = 'السور' }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0d9488',
        tabBarInactiveTintColor: '#64748b',
      }}
      initialRouteName={initialTab}
    >
      <Tab.Screen 
        name="السور" 
        component={SurahListScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="menu-book" size={size} color={color} />
          ) 
        }} 
      />
      <Tab.Screen 
        name="المفضلة" 
        component={FavoritesScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="favorite" size={size} color={color} />
          ) 
        }} 
      />
      <Tab.Screen 
        name="الحفظ" 
        component={MemorizationScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="school" size={size} color={color} />
          ) 
        }} 
      />
      <Tab.Screen 
        name="الأهداف" 
        component={GoalScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="flag" size={size} color={color} />
          ) 
        }} 
      />
      <Tab.Screen 
        name="التقدم" 
        component={ProgressScreen} 
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="leaderboard" size={size} color={color} />
          ) 
        }} 
      />
      <Tab.Screen 
  name="الإحصائيات" 
  component={AnalyticsScreen} 
  options={{ 
    tabBarIcon: ({ color, size }) => (
      <MaterialIcons name="analytics" size={size} color={color} />
    ) 
  }} 
/>
      <Tab.Screen 
        name="الإعدادات"
        component={SettingsScreen}
        options={{ 
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="settings" size={size} color={color} />
          ) 
        }}
      />
    </Tab.Navigator>
  );
}