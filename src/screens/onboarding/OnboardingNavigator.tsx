import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { theme } from '../../theme';
import OnboardingProfileScreen from './OnboardingProfileScreen';
import OnboardingFirstLogScreen from './OnboardingFirstLogScreen';
import OnboardingCelebrationScreen from './OnboardingCelebrationScreen';
import { createUserProfile, initializeUserStreak } from '../../services/gutHarmony/userService';
import { logStoolEntry, logMealEntry } from '../../services/gutHarmony/entryService';
import { updateStreak, unlockAchievement } from '../../services/gutHarmony/streakService';

type OnboardingStep =
  | 'profile'
  | 'firstlog'
  | 'celebration'
  | 'loading';

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

interface UserData {
  name: string;
  condition: string;
}

export default function OnboardingNavigator({
  onComplete,
}: OnboardingNavigatorProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('profile');
  const [userData, setUserData] = useState<UserData | null>(null);

  const handleProfileContinue = async (profileData: UserData) => {
    if (!user?.id) throw new Error('User not authenticated');

    setCurrentStep('loading');
    try {
      setUserData(profileData);
      setCurrentStep('firstlog');
    } catch (error) {
      console.error('Error in profile setup:', error);
      throw error;
    }
  };

  const handleFirstLogContinue = async (logData: {
    stool_type: number;
    energy_level: number;
    symptoms: Record<string, boolean>;
    meals: string[];
    main_issue: string;
  }) => {
    if (!user?.id) throw new Error('User not authenticated');
    if (!userData) throw new Error('User data not initialized');

    setCurrentStep('loading');
    try {
      const now = new Date();

      // Create user profile with main_issue from firstlog
      await createUserProfile(user.id, {
        name: userData.name,
        condition: userData.condition,
        main_issue: logData.main_issue,
        personality_style: 'motivational_buddy',
      });

      // Initialize streak tracking
      await initializeUserStreak(user.id);

      // Log stool entry with sensible lifestyle defaults
      await logStoolEntry(user.id, {
        entry_time: now.toISOString(),
        stool_type: logData.stool_type,
        energy_level: logData.energy_level,
        symptoms: logData.symptoms,
        // Lifestyle defaults for first log
        stress_level: 5, // Neutral
        sleep_quality: 7, // Good
        sleep_hours: 7.5, // Recommended
        water_intake: 2000, // 2L default
        exercise_minutes: 0, // Haven't tracked yet
        exercise_type: undefined,
        medications: undefined,
      });

      // Log meal entries
      if (logData.meals.length > 0) {
        for (const meal of logData.meals) {
          await logMealEntry(user.id, {
            meal_time: now.toISOString(),
            meal_name: meal,
            foods: [meal],
          });
        }
      }

      // Update streak
      await updateStreak(user.id);

      // Unlock first step achievement
      await unlockAchievement(
        user.id,
        'first_step',
        'First Step',
        'Started your journey toward better gut health!'
      );

      setCurrentStep('celebration');
    } catch (error) {
      console.error('Error in first log:', error);
      throw error;
    }
  };

  const handleCelebrationContinue = () => {
    // Onboarding complete
    onComplete();
  };

  if (currentStep === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: theme.colors.background.primary,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.brand.primary} />
      </View>
    );
  }

  if (currentStep === 'profile') {
    return (
      <OnboardingProfileScreen
        onContinue={handleProfileContinue}
        onBack={() => {
          // Back navigation handled by stack
        }}
      />
    );
  }

  if (currentStep === 'firstlog') {
    return (
      <OnboardingFirstLogScreen
        onContinue={handleFirstLogContinue}
        onBack={() => setCurrentStep('profile')}
      />
    );
  }

  if (currentStep === 'celebration' && userData) {
    return (
      <OnboardingCelebrationScreen
        name={userData.name}
        onContinue={handleCelebrationContinue}
      />
    );
  }

  return null;
}