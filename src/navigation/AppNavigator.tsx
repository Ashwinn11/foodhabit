import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows, fonts } from '../theme';
import {
  HomeScreen,
  GutProfileScreen,
  AddEntryScreen,
  InsightsScreen,
  SettingsScreen,
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
      <Ionicons name={iconName} size={24} color={color} />
      <Text style={[
        styles.tabLabel,
        { color: color }
      ]}>
        {label}
      </Text>
    </Animated.View>
  );
};

// Center floating add button (Paw Print)
const CenterAddButton: React.FC<{ onPress: () => void }> = ({ onPress }) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
    onPress();
  };
  
  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.centerButtonWrapper}
    >
      <Animated.View style={[styles.centerButton, animatedStyle]}>
        <Ionicons name="paw" size={28} color={colors.black} />
      </Animated.View>
    </Pressable>
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
        name="PlanTab"
        component={GutProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="calendar" label="Plan" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={AddEntryScreen}
        options={({ navigation }) => ({
          tabBarButton: () => (
            <CenterAddButton onPress={() => navigation.navigate('AddEntry')} />
          ),
        })}
      />
      <Tab.Screen
        name="InsightsTab"
        component={InsightsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="pulse" label="Health" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="settings" label="Settings" focused={focused} />
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
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 0,
    height: 90, // Taller
    paddingTop: 10, // Adjust centering
    paddingBottom: 25, // Adjust for Home Indicator area
    position: 'absolute',
    bottom: 25, // Float above bottom
    left: 20,
    right: 20,
    borderRadius: 35, // Rounded corners for floating pill
    ...shadows.md,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: fonts.bodyBold,
    marginTop: 4,
  },
  centerButtonWrapper: {
    top: -25, // Lift above bar
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 65, // Slightly larger
    height: 65,
    borderRadius: 32.5,
    backgroundColor: colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    borderWidth: 5,
    borderColor: colors.white, // Match tab bar for cutout effect
  },
});
