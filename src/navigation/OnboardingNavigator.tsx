import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { 
  OnboardingQuizScreen,
  OnboardingResultsScreen,
  OnboardingSymptomsScreen,
  OnboardingSolutionScreen,
  OnboardingReviewsScreen,
  OnboardingFeaturesScreen,
  OnboardingCommitmentScreen,
  OnboardingCustomPlanScreen,
} from '../screens/Onboarding';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="OnboardingQuiz"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="OnboardingQuiz" component={OnboardingQuizScreen} />
      <Stack.Screen name="OnboardingResults" component={OnboardingResultsScreen} />
      <Stack.Screen name="OnboardingSymptoms" component={OnboardingSymptomsScreen} />
      <Stack.Screen name="OnboardingSolution" component={OnboardingSolutionScreen} />
      <Stack.Screen name="OnboardingReviews" component={OnboardingReviewsScreen} />
      <Stack.Screen name="OnboardingFeatures" component={OnboardingFeaturesScreen} />
      <Stack.Screen name="OnboardingCommitment" component={OnboardingCommitmentScreen} />
      <Stack.Screen name="OnboardingCustomPlan" component={OnboardingCustomPlanScreen} />
    </Stack.Navigator>
  );
};
