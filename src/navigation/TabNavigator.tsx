import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native'; // Added View import
import * as Haptics from 'expo-haptics';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import HistoryScreen from '../screens/HistoryScreen';
import TriggerAnalysisScreen from '../screens/TriggerAnalysisScreen';
import { theme, r } from '../theme';

const Tab = createBottomTabNavigator();

// Custom tab icon with brand color for active state, dark/grey for inactive
const TabIcon: React.FC<{
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  size: number;
}> = ({ focused, iconName, size }) => {
  const color = focused ? theme.colors.brand.primary : theme.colors.text.tertiary; // Updated inactive color for dark mode
  
  return (
    <Ionicons
      name={iconName}
      size={size}
      color={color}
    />
  );
};

// Removed BlurView import

export default function TabNavigator(): React.ReactElement {
  const previousRouteRef = useRef<string | undefined>(undefined);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Analysis') {
            iconName = focused ? 'pulse' : 'pulse-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <TabIcon focused={focused} iconName={iconName} size={size} />;
        },
        tabBarActiveTintColor: theme.colors.brand.primary,
        tabBarInactiveTintColor: theme.colors.text.tertiary, // Updated inactive color
        tabBarBackground: () => (
          <View 
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.colors.background.card }, // Solid background color
            ]}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: theme.colors.background.card, // Updated to card background color
          borderRadius: theme.borderRadius.pill,
          marginHorizontal: r.scaleWidth(40),
          marginBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingBottom: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          borderTopWidth: 0,
          // Subtle border for definition
          borderColor: theme.colors.border.light,
          borderWidth: StyleSheet.hairlineWidth, // Very thin border
          // Soft shadow for modern card look
          shadowColor: theme.shadows.md.shadowColor, // Using theme shadows
          shadowOffset: theme.shadows.md.shadowOffset,
          shadowOpacity: theme.shadows.md.shadowOpacity,
          shadowRadius: theme.shadows.md.shadowRadius,
          elevation: theme.shadows.md.elevation, // Android elevation
          alignSelf: 'center',
          overflow: 'hidden', // Important for borderRadius to work with shadows
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
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          tabBarLabel: 'History',
        }}
      />
      <Tab.Screen
        name="Analysis"
        component={TriggerAnalysisScreen}
        options={{
          tabBarLabel: 'Triggers',
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