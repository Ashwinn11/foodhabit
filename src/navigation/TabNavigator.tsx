import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Platform, StyleSheet, View } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { theme, r } from '../theme';

const Tab = createBottomTabNavigator();

// Custom tab icon with colored container for active state
const TabIcon: React.FC<{
  focused: boolean;
  iconName: keyof typeof Ionicons.glyphMap;
  size: number;
}> = ({ focused, iconName, size }) => {
  if (focused) {
    return (
      <View style={styles.activeIconContainer}>
        <Ionicons name={iconName} size={size - 4} color={theme.colors.brand.white} />
      </View>
    );
  }
  return <Ionicons name={iconName} size={size} color={theme.colors.brand.black} />;
};

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse';
          }

          return <TabIcon focused={focused} iconName={iconName} size={size} />;
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

const styles = StyleSheet.create({
  activeIconContainer: {
    backgroundColor: theme.colors.brand.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
