import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  OnboardingWelcomeScreen,
  OnboardingGoalScreen,
  OnboardingQuizScreen,
  OnboardingValueInterruptScreen,
  OnboardingStoolScreen,
  OnboardingRegularityScreen,
  OnboardingMedicalScreen,
  OnboardingProcessingScreen,
  OnboardingResultsScreen,
  OnboardingConditionScreen,
  OnboardingValueScreen,
} from '../screens/Onboarding';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingWelcome"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OnboardingWelcome" component={OnboardingWelcomeScreen} />
      <Stack.Screen name="OnboardingGoal" component={OnboardingGoalScreen} />
      <Stack.Screen name="OnboardingSymptoms" component={OnboardingQuizScreen} />
      <Stack.Screen name="OnboardingValueInterrupt" component={OnboardingValueInterruptScreen} />
      <Stack.Screen name="OnboardingStool" component={OnboardingStoolScreen} />
      <Stack.Screen name="OnboardingRegularity" component={OnboardingRegularityScreen} />
      <Stack.Screen name="OnboardingMedical" component={OnboardingMedicalScreen} />
      <Stack.Screen name="OnboardingProcessing" component={OnboardingProcessingScreen} />
      <Stack.Screen name="OnboardingResults" component={OnboardingResultsScreen} />
      <Stack.Screen name="OnboardingCondition" component={OnboardingConditionScreen} />
      <Stack.Screen name="OnboardingValue" component={OnboardingValueScreen} />
    </Stack.Navigator>
  );
};
