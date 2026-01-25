import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  OnboardingHookScreen,
  OnboardingQuizScreen,
  OnboardingResultsScreen,
  OnboardingSolutionScreen,
  OnboardingCustomPlanScreen,
} from '../screens/Onboarding';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OnboardingHook" component={OnboardingHookScreen} />
      <Stack.Screen name="OnboardingQuiz" component={OnboardingQuizScreen} />
      <Stack.Screen name="OnboardingResults" component={OnboardingResultsScreen} />
      <Stack.Screen name="OnboardingSolution" component={OnboardingSolutionScreen} />
      <Stack.Screen name="OnboardingCustomPlan" component={OnboardingCustomPlanScreen} />
    </Stack.Navigator>
  );
};
