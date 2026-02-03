import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme';
import { IconContainer, Typography } from '../components';
import {
  HomeScreen,
  GutProfileScreen,
  AddEntryScreen,
  InsightsScreen,
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

// Center floating add button
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
        <IconContainer
          name="add"
          size={55}
          iconSize={32}
          color={colors.black}
          variant="transparent"
          shadow={false}
        />
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
        name="HistoryTab"
        component={GutProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon iconName="book" label="History" focused={focused} />
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
            <TabIcon iconName="bar-chart" label="Insights" focused={focused} />
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
  tabBar: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: 70,
    paddingTop: 8,
    paddingBottom: 8,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  tabLabel: {
    fontSize: 12,
  },
  centerButtonWrapper: {
    top: -15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: colors.yellow,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
    shadowColor: colors.black,
    shadowOpacity: 0.15,
    borderWidth: 4,
    borderColor: colors.white,
  },
});
