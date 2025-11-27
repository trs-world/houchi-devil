import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import TowerScreen from '@/screens/TowerScreen';
import DemonsScreen from '@/screens/DemonsScreen';
import UpgradesScreen from '@/screens/UpgradesScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import { useGameLoop } from '@/hooks/useGameLoop';

const Tab = createBottomTabNavigator();

export default function App() {
  useGameLoop();

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#120a1f',
            borderTopColor: '#241133',
          },
          tabBarActiveTintColor: '#e945ff',
          tabBarInactiveTintColor: '#aaa',
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';
            if (route.name === 'Tower') iconName = 'podium';
            if (route.name === 'Demons') iconName = 'flame';
            if (route.name === 'Upgrades') iconName = 'sparkles';
            if (route.name === 'Settings') iconName = 'settings';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Tower" component={TowerScreen} />
        <Tab.Screen name="Demons" component={DemonsScreen} />
        <Tab.Screen name="Upgrades" component={UpgradesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
