import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet, LogBox } from 'react-native';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';
import Icon, { AppIcons } from './src/components/Icon';

// Import screens
import EventsScreen from './src/screens/EventsScreen';
import GiftIdeasScreen from './src/screens/GiftIdeasScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import TermsScreen from './src/screens/TermsScreen';
import LicenseScreen from './src/screens/LicenseScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Settings Stack Navigator
function SettingsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsMain" component={SettingsScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="License" component={LicenseScreen} />
    </Stack.Navigator>
  );
}

// Main Tab Navigator
function TabNavigator() {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.cardBackground,
          borderTopColor: colors.borderColor,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon {...AppIcons.birthday} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Gift Ideas"
        component={GiftIdeasScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon {...AppIcons.gift} size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon {...AppIcons.settings} size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// App Component with Theme
function AppContent() {
  useEffect(() => {
    // Suppress warnings
    LogBox.ignoreLogs([
      'expo-notifications',
      'remote notifications',
      'Push notifications',
    ]);
  }, []);

  return (
    <NavigationContainer>
      <TabNavigator />
    </NavigationContainer>
  );
}

// Root App with ThemeProvider
export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}