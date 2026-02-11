import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Pressable } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { analyticsService } from '../../analytics/analyticsService';

type HeightUnit = 'inches' | 'cm';
type WeightUnit = 'lbs' | 'kg';

export const OnboardingDemographicsScreen = () => {
  const navigation = useNavigation<any>();
  const { setGutCheckAnswer, totalSteps, setCurrentStep, gutCheckAnswers } = useOnboardingStore();

  const [age, setAge] = useState(gutCheckAnswers.age?.toString() || '');
  const [height, setHeight] = useState(gutCheckAnswers.height?.toString() || '');
  const [heightUnit, setHeightUnit] = useState<HeightUnit>('inches');
  const [weight, setWeight] = useState(gutCheckAnswers.weight?.toString() || '');
  const [weightUnit, setWeightUnit] = useState<WeightUnit>('lbs');
  const [gender, setGender] = useState<'male' | 'female' | null>(gutCheckAnswers.gender || null);

  const isComplete = age && height && weight && gender;

  useEffect(() => {
    analyticsService.trackOnboardingScreenView('demographics', 6, totalSteps);
  }, [totalSteps]);

  const handleNext = () => {
    if (!isComplete) return;

    // Convert to standard units (inches and lbs)
    const heightInInches = heightUnit === 'cm' ? Math.round(parseInt(height) / 2.54) : parseInt(height);
    const weightInLbs = weightUnit === 'kg' ? Math.round(parseInt(weight) * 2.20462) : parseInt(weight);

    setGutCheckAnswer('age', parseInt(age));
    setGutCheckAnswer('height', heightInInches);
    setGutCheckAnswer('weight', weightInLbs);
    setGutCheckAnswer('gender', gender!);

    setCurrentStep(7);
    navigation.navigate('OnboardingCondition');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(5);
  };

  const GenderButton = ({ value, label, icon }: { value: 'male' | 'female'; label: string; icon: string }) => {
    const isSelected = gender === value;
    return (
      <Animated.View entering={FadeInDown} style={{ flex: 1 }}>
        <Pressable
          onPress={() => setGender(value)}
          style={[
            styles.genderButton,
            {
              backgroundColor: isSelected ? colors.pink : colors.white,
              borderColor: isSelected ? colors.pink : colors.border,
            }
          ]}
        >
          <View style={styles.genderContent}>
            <Ionicons name={icon as any} size={24} color={isSelected ? colors.white : colors.black} />
            <Typography
              variant="bodyBold"
              color={isSelected ? colors.white : colors.black}
              style={{ marginLeft: spacing.sm }}
            >
              {label}
            </Typography>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <OnboardingScreen
      currentStep={6}
      totalSteps={totalSteps}
      title="About You"
      subtitle="Help us personalize your calorie and nutrition goals"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="Continue"
      nextDisabled={!isComplete}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        {/* Gender Selection */}
        <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
          <Typography variant="bodyBold" style={{ marginBottom: spacing.md }}>
            Gender
          </Typography>
          <View style={styles.genderRow}>
            <GenderButton value="male" label="Male" icon="male" />
            <View style={{ width: spacing.md }} />
            <GenderButton value="female" label="Female" icon="female" />
          </View>
        </Animated.View>

        {/* Age Input */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Typography variant="bodyBold" style={{ marginBottom: spacing.md }}>
            Age
          </Typography>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <TextInput
              style={styles.input}
              placeholder="Enter your age"
              placeholderTextColor={colors.textSecondary}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              maxLength={3}
            />
            {age && <Typography variant="caption" color={colors.textSecondary}>years</Typography>}
          </View>
        </Animated.View>

        {/* Height Input */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Typography variant="bodyBold">Height</Typography>
            <View style={styles.unitToggle}>
              <Pressable
                style={[styles.unitButton, heightUnit === 'inches' && styles.unitButtonActive]}
                onPress={() => setHeightUnit('inches')}
              >
                <Typography variant="caption" color={heightUnit === 'inches' ? colors.white : colors.text}>
                  in
                </Typography>
              </Pressable>
              <Pressable
                style={[styles.unitButton, heightUnit === 'cm' && styles.unitButtonActive]}
                onPress={() => setHeightUnit('cm')}
              >
                <Typography variant="caption" color={heightUnit === 'cm' ? colors.white : colors.text}>
                  cm
                </Typography>
              </Pressable>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="body-outline" size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <TextInput
              style={styles.input}
              placeholder={`Enter your height`}
              placeholderTextColor={colors.textSecondary}
              value={height}
              onChangeText={setHeight}
              keyboardType="numeric"
              maxLength={3}
            />
            {height && <Typography variant="caption" color={colors.textSecondary}>{heightUnit}</Typography>}
          </View>
        </Animated.View>

        {/* Weight Input */}
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Typography variant="bodyBold">Weight</Typography>
            <View style={styles.unitToggle}>
              <Pressable
                style={[styles.unitButton, weightUnit === 'lbs' && styles.unitButtonActive]}
                onPress={() => setWeightUnit('lbs')}
              >
                <Typography variant="caption" color={weightUnit === 'lbs' ? colors.white : colors.text}>
                  lbs
                </Typography>
              </Pressable>
              <Pressable
                style={[styles.unitButton, weightUnit === 'kg' && styles.unitButtonActive]}
                onPress={() => setWeightUnit('kg')}
              >
                <Typography variant="caption" color={weightUnit === 'kg' ? colors.white : colors.text}>
                  kg
                </Typography>
              </Pressable>
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="scale-outline" size={20} color={colors.textSecondary} style={{ marginRight: spacing.md }} />
            <TextInput
              style={styles.input}
              placeholder="Enter your weight"
              placeholderTextColor={colors.textSecondary}
              value={weight}
              onChangeText={setWeight}
              keyboardType="numeric"
              maxLength={3}
            />
            {weight && <Typography variant="caption" color={colors.textSecondary}>{weightUnit}</Typography>}
          </View>
        </Animated.View>

        {/* Info Card */}
        <Animated.View entering={FadeInDown.delay(400)} style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.blue} />
          <Typography variant="caption" color={colors.textSecondary} style={{ marginLeft: spacing.md, flex: 1 }}>
            We use this to calculate your personalized daily calorie and nutrition goals based on your activity level.
          </Typography>
        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },

  genderRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },

  genderButton: {
    flex: 1,
    paddingVertical: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 2,
  },

  genderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.blue + '15',
    padding: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.xl,
    alignItems: 'flex-start',
  },

  unitToggle: {
    flexDirection: 'row',
    backgroundColor: colors.border,
    borderRadius: radii.md,
    padding: 2,
    gap: 2,
  },

  unitButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
    backgroundColor: 'transparent',
  },

  unitButtonActive: {
    backgroundColor: colors.pink,
  },
});
