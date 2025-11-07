import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { theme, r } from '../theme';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.brand.black,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: theme.colors.brand.white,
          borderRadius: theme.borderRadius.xl,
          marginHorizontal: theme.spacing.lg,
          marginBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingBottom: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          borderTopWidth: 0,
          ...theme.shadows.lg,
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontSize: r.adaptiveFontSize.xs,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}
