import React, { useCallback } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOnboarding } from '../../hooks/useOnboarding';
import { OnboardingData } from '../../types/profile';
import OnboardingHookScreen from './OnboardingHookScreen';
import OnboardingEducationScreen from './OnboardingEducationScreen';
import OnboardingBodyBasicsScreen from './OnboardingBodyBasicsScreen';
import OnboardingLifestyleScreen from './OnboardingLifestyleScreen';
import OnboardingGoalsScreen from './OnboardingGoalsScreen';
import OnboardingLoadingScreen from './OnboardingLoadingScreen';
import OnboardingSummaryScreen from './OnboardingSummaryScreen';

const Stack = createNativeStackNavigator();

/**
 * Type guard to check if partial onboarding data is complete
 */
function isCompleteOnboardingData(data: Partial<OnboardingData>): data is OnboardingData {
  return !!(
    typeof data.age === 'number' &&
    data.gender &&
    typeof data.height === 'number' &&
    typeof data.weight === 'number' &&
    data.activity_level &&
    typeof data.sleep_hours === 'number' &&
    data.diet_type &&
    data.eating_window_start &&
    data.eating_window_end &&
    data.focus_area &&
    typeof data.water_intake === 'number' &&
    typeof data.cooking_ratio === 'number'
  );
}

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

/**
 * Onboarding Navigator
 * Manages the 7-screen onboarding flow with state management
 *
 * Screen Flow:
 * 0. Hook (emotional trigger)
 * 1. Education (show value)
 * 2. Body Basics (age, gender, height, weight)
 * 3. Lifestyle (activity, sleep, diet, eating window)
 * 4. Goals (focus area, water, cooking ratio)
 * 5. Loading (8.5s synthetic analysis)
 * 6. Summary (dopamine hit with calculated metrics)
 *
 * Data Flow:
 * - Each screen updates state via useOnboarding hook
 * - Loading screen triggers metrics calculation
 * - Summary screen displays calculated results
 * - Completion saves all data to Supabase
 */
export function OnboardingNavigator({ onComplete }: OnboardingNavigatorProps) {
  const { state, updateData, nextStep, setRingProgress, completeOnboarding, metrics } = useOnboarding();

  const navigationOptions = {
    headerShown: false,
    animationEnabled: true,
    cardStyle: { backgroundColor: 'transparent' },
  };

  const handleHookNext = useCallback((navigation: any) => {
    setRingProgress(20);
    nextStep();
    navigation.navigate('Education');
  }, [setRingProgress, nextStep]);

  const handleEducationNext = useCallback((navigation: any) => {
    setRingProgress(35);
    nextStep();
    navigation.navigate('BodyBasics');
  }, [setRingProgress, nextStep]);

  const handleBodyBasicsNext = useCallback((navigation: any) => {
    nextStep();
    navigation.navigate('Lifestyle');
  }, [nextStep]);

  const handleLifestyleNext = useCallback((navigation: any) => {
    nextStep();
    navigation.navigate('Goals');
  }, [nextStep]);

  const handleGoalsNext = useCallback(async (navigation: any) => {
    setRingProgress(90);
    nextStep();
    navigation.navigate('Loading');
  }, [setRingProgress, nextStep]);

  const handleLoadingComplete = useCallback(async (navigation: any) => {
    try {
      // Validate that all required data is present
      if (!isCompleteOnboardingData(state.data)) {
        console.error('Incomplete onboarding data');
        // TODO: Show error to user or navigate back to incomplete screen
        return;
      }

      // Complete onboarding and save to Supabase
      const calculatedMetrics = await completeOnboarding(state.data);

      if (calculatedMetrics) {
        nextStep();
        navigation.navigate('Summary');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  }, [state.data, completeOnboarding, nextStep]);

  const handleSummaryComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  return (
    <Stack.Navigator
      screenOptions={navigationOptions}
      initialRouteName="Hook"
    >
      {/* Screen 0: Hook - Emotional Trigger */}
      <Stack.Screen
        name="Hook"
        options={navigationOptions}
      >
        {({ navigation }) => <OnboardingHookScreen onNext={() => handleHookNext(navigation)} />}
      </Stack.Screen>

      {/* Screen 1: Education - Show Value */}
      <Stack.Screen
        name="Education"
        options={navigationOptions}
      >
        {({ navigation }) => (
          <OnboardingEducationScreen
            onNext={() => handleEducationNext(navigation)}
            ringProgress={state.ringProgress}
          />
        )}
      </Stack.Screen>

      {/* Screen 2: Body Basics */}
      <Stack.Screen
        name="BodyBasics"
        options={navigationOptions}
      >
        {({ navigation }) => (
          <OnboardingBodyBasicsScreen
            onNext={() => handleBodyBasicsNext(navigation)}
            data={state.data}
            updateData={updateData}
            ringProgress={state.ringProgress}
            setRingProgress={setRingProgress}
          />
        )}
      </Stack.Screen>

      {/* Screen 3: Lifestyle */}
      <Stack.Screen
        name="Lifestyle"
        options={navigationOptions}
      >
        {({ navigation }) => (
          <OnboardingLifestyleScreen
            onNext={() => handleLifestyleNext(navigation)}
            data={state.data}
            updateData={updateData}
            ringProgress={state.ringProgress}
            setRingProgress={setRingProgress}
          />
        )}
      </Stack.Screen>

      {/* Screen 4: Goals */}
      <Stack.Screen
        name="Goals"
        options={navigationOptions}
      >
        {({ navigation }) => (
          <OnboardingGoalsScreen
            onNext={() => handleGoalsNext(navigation)}
            data={state.data}
            updateData={updateData}
            ringProgress={state.ringProgress}
            setRingProgress={setRingProgress}
          />
        )}
      </Stack.Screen>

      {/* Screen 5: Loading - Synthetic Analysis */}
      <Stack.Screen
        name="Loading"
        options={{
          ...navigationOptions,
          gestureEnabled: false, // Prevent swipe back during loading
        }}
      >
        {({ navigation }) => <OnboardingLoadingScreen onComplete={() => handleLoadingComplete(navigation)} />}
      </Stack.Screen>

      {/* Screen 6: Summary - Metrics Display */}
      <Stack.Screen
        name="Summary"
        options={{
          ...navigationOptions,
          gestureEnabled: false, // Prevent swipe back from summary
        }}
      >
        {() =>
          metrics ? (
            <OnboardingSummaryScreen
              metrics={metrics}
              onNavigateToDashboard={handleSummaryComplete}
            />
          ) : null
        }
      </Stack.Screen>
    </Stack.Navigator>
  );
}
