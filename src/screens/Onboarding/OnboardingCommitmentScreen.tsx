import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, Card, IconContainer } from '../../components';
import { colors, spacing, radii } from '../../theme';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const COMMITMENTS = [
  { id: 'time', text: 'I can commit 5 mins a day to logging', icon: 'time-outline' },
  { id: 'honesty', text: 'I will be honest about my symptoms', icon: 'heart-outline' },
  { id: 'consistency', text: 'I want to reach my health goals', icon: 'trending-up-outline' },
];

export const OnboardingCommitmentScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep } = useOnboardingStore();
  const [selected, setSelected] = useState<string[]>([]);
  
  const toggleSelection = (id: string) => {
    if (selected.includes(id)) {
      setSelected(selected.filter(i => i !== id));
    } else {
      setSelected([...selected, id]);
    }
  };

  const handleNext = () => {
    setCurrentStep(7);
    navigation.navigate('OnboardingCustomPlan');
  };

  const handleBack = () => {
    navigation.goBack();
    setCurrentStep(5);
  };

  const allSelected = selected.length === COMMITMENTS.length;

  return (
    <OnboardingScreen
      currentStep={6}
      totalSteps={totalSteps}
      title="One Last Thing..."
      subtitle="Success requires a small commitment. Are you ready?"
      onNext={handleNext}
      onBack={handleBack}
      nextLabel="I'm Ready to Heal"
      nextDisabled={!allSelected}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        <Animated.View entering={FadeInDown.delay(100)} style={{ gap: spacing.md, marginTop: spacing.md }}>
          <Typography variant="body" color={colors.mediumGray} align="center">
            To get the best results from your 90-day protocol, we need your word on these 3 things:
          </Typography>

          {COMMITMENTS.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              onPress={() => toggleSelection(item.id)}
              activeOpacity={0.7}
            >
              <Card style={[
                styles.commitmentCard, 
                selected.includes(item.id) && styles.selectedCard
              ]}>
                <IconContainer 
                  name={item.icon as any} 
                  size={44} 
                  iconSize={22} 
                  color={selected.includes(item.id) ? colors.white : colors.pink} 
                  variant={selected.includes(item.id) ? "solid" : "transparent"}
                  style={styles.iconMargin}
                />
                <Typography 
                  variant="body" 
                  color={selected.includes(item.id) ? colors.white : colors.black} 
                  style={{ flex: 1, fontSize: 16 }}
                >
                  {item.text}
                </Typography>
                <View style={[
                  styles.checkbox, 
                  selected.includes(item.id) && styles.checkboxSelected
                ]}>
                  {selected.includes(item.id) && <Ionicons name="checkmark" size={16} color={colors.black} />}
                </View>
              </Card>
            </TouchableOpacity>
          ))}

          {allSelected && (
            <Animated.View entering={FadeInDown} style={styles.successMessage}>
                <Ionicons name="sparkles" size={20} color={colors.pink} />
                <Typography variant="bodyBold" color={colors.black} style={{ marginLeft: 8 }}>
                    Identity shift complete! You're a healer.
                </Typography>
            </Animated.View>
          )}

          <Typography 
            variant="caption" 
            color={colors.mediumGray} 
            align="center" 
            style={{ marginTop: spacing.md, fontStyle: 'italic' }}
          >
            "98% of people who commit to these 3 things reach their goal health score."
          </Typography>
        </Animated.View>
      </ScrollView>
    </OnboardingScreen>
  );
};

const styles = StyleSheet.create({
  commitmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selectedCard: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  iconMargin: {
    marginRight: spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  checkboxSelected: {
    backgroundColor: colors.yellow,
    borderColor: colors.yellow,
  },
  successMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.yellow + '15',
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.yellow + '40',
  }
});
