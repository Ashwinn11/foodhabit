import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';
import { IconContainer, Typography } from '../components';
import {
  HomeScreen,
  GutProfileScreen,
  AddEntryScreen,
  ProfileScreen,
  PrivacyPolicyScreen,
  AuthScreen,
  HelpSupportScreen,
  NotificationsScreen,
  ScanFoodScreen,
} from '../screens';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom tab bar icon component with animations
interface TabIconProps {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ iconName, label, focused }) => {
  const scale = useSharedValue(focused ? 1.1 : 1);
  const color = focused ? colors.pink : colors.iconInactive;
  
  React.useEffect(() => {
    scale.value = withSpring(focused ? 1 : 1);
  }, [focused, scale]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  return (
    <Animated.View style={[styles.tabIconContainer, animatedStyle]}>
      <IconContainer
        name={iconName}
        size={32}
        iconSize={24}
        color={color}
        variant="transparent"
        shadow={false}
      />
      <Typography 
        variant="bodyXS" 
        style={[
          styles.tabLabel,
          { color: color }
        ]}
      >
        {label}
      </Typography>
    </Animated.View>
  );
};

// Main tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="home" label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={GutProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="book" label="History" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="person" label="Me" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main app navigator with stack for modals
export const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="AddEntry"
        component={AddEntryScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
      <Stack.Screen
        name="GutProfile"
        component={GutProfileScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ScanFood"
        component={ScanFoodScreen}
        options={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

// Auth Navigator for when user is not logged in
export const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  centerButton: {
    alignItems: 'center',
    backgroundColor: colors.yellow,
    borderRadius: 32.5,
    height: 65,
    justifyContent: 'center',
    width: 65,
    ...shadows.md,
    borderColor: colors.white,
    borderWidth: 4,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
  },
  centerButtonWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    top: -15,
  },
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.border,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    height: 70,
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 12,
  },
});
