import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  QuizHealthGoalScreen, 
  QuizGutIssuesScreen, 
  QuizLifestyleScreen,
  OnboardingResultsScreen,
  OnboardingValuePropScreen,
  OnboardingCustomPlanScreen
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
      <Stack.Screen name="QuizHealthGoal" component={QuizHealthGoalScreen} />
      <Stack.Screen name="QuizGutIssues" component={QuizGutIssuesScreen} />
      <Stack.Screen name="QuizLifestyle" component={QuizLifestyleScreen} />
      <Stack.Screen name="OnboardingResults" component={OnboardingResultsScreen} />
      <Stack.Screen name="OnboardingValueProp" component={OnboardingValuePropScreen} />
      <Stack.Screen name="OnboardingCustomPlan" component={OnboardingCustomPlanScreen} />
    </Stack.Navigator>
  );
};
