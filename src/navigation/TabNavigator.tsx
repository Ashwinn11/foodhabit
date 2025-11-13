import React, { useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import HomeScreen from '../screens/HomeScreen';
import MealLogScreen from '../screens/MealLogScreen';
import InsightsScreen from '../screens/InsightsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { theme, r } from '../theme';

const Tab = createBottomTabNavigator();

// Custom tab icon with white color for active state, reduced opacity for inactive
const TabIcon: React.FC<{
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  size: number;
}> = ({ focused, iconName, size }) => {
  const color = theme.colors.brand.white;
  const opacity = focused ? 1 : 0.5;

  return (
    <Ionicons
      name={iconName}
      size={size}
      color={color}
      style={{ opacity }}
    />
  );
};

export default function TabNavigator(): React.ReactElement {
  const previousRouteRef = useRef<string | undefined>(undefined);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Meals') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Insights') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <TabIcon focused={focused} iconName={iconName} size={size} />;
        },
        tabBarActiveTintColor: theme.colors.brand.white,
        tabBarInactiveTintColor: theme.colors.brand.white,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: theme.colors.brand.black,
          borderRadius: theme.borderRadius.pill, // Pill shape
          marginHorizontal: r.scaleWidth(50), // Smaller margin for longer bar
          marginBottom: Platform.OS === 'ios' ? theme.spacing.lg : theme.spacing.md,
          height: Platform.OS === 'ios' ? 70 : 60,
          paddingBottom: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
          paddingTop: theme.spacing.sm,
          borderTopWidth: 0,
          ...theme.shadows.lg,
          alignSelf: 'center',
        },
        tabBarLabelStyle: {
          ...theme.typography.caption,
          fontSize: r.adaptiveFontSize.xs,
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
        name="Meals"
        component={MealLogScreen}
        options={{
          tabBarLabel: 'Meals',
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: 'Insights',
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
