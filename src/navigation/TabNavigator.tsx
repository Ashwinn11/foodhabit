import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import ExploreScreen from '../screens/ExploreScreen';
import ActivityScreen from '../screens/ActivityScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { theme, r } from '../theme';

const Tab = createBottomTabNavigator();

// Custom tab icon with brand color for active state, white/grey for inactive
const TabIcon: React.FC<{
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  size: number;
}> = ({ focused, iconName, size }) => {
  const color = focused ? theme.colors.brand.primary : theme.colors.text.primary;
  
  return (
    <Ionicons
      name={iconName}
      size={size}
      color={color}
    />
  );
};

import { BlurView } from 'expo-blur';

// ... (TabIcon remains same)

export default function TabNavigator(): React.ReactElement {
  const previousRouteRef = useRef<string | undefined>(undefined);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Explore') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Activity') {
            iconName = focused ? 'flame' : 'flame-outline';
          } else if (route.name === 'Search') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <TabIcon focused={focused} iconName={iconName} size={size} />;
        },
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.primary,
        tabBarBackground: () => (
          <BlurView 
            tint="light" 
            intensity={80} 
            style={StyleSheet.absoluteFill} 
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(26, 35, 50, 0.9)', // Semi-transparent dark blue
          borderRadius: theme.borderRadius.pill,
          marginHorizontal: r.scaleWidth(40),
          marginBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingBottom: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          borderTopWidth: 0,
          // Glassmorphic border
          borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: 1,
          // Soft shadow
          shadowColor: theme.colors.neumorphism.darkShadow,
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
          elevation: 10,
          alignSelf: 'center',
          overflow: 'hidden', // Required for BlurView to respect borderRadius
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontSize: r.adaptiveFontSize.xs,
          fontWeight: '600',
        },
        headerShown: false,
        tabBarHideOnKeyboard: true,
      })}
      screenListeners={({ route }) => ({
        tabPress: async () => {
          // Get the previous route
          const previousRoute = previousRouteRef.current;
          previousRouteRef.current = route.name;

          // Only trigger haptic if we're switching to a different tab
          if (previousRoute !== route.name) {
            // Trigger iOS-like spring haptic feedback
            if (Platform.OS === 'ios') {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
              // For Android, use selection feedback
              await Haptics.selectionAsync();
            }
          }
        },
      })}
    >
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarLabel: 'Explore',
        }}
      />
      <Tab.Screen
        name="Activity"
        component={ActivityScreen}
        options={{
          tabBarLabel: 'Activity',
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: 'Search',
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
