import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Text, Button, Input, Container, AnimatedSelectionCard, IconButton } from '../../components';
import { theme, haptics } from '../../theme';
import { APP_TEXTS } from '../../constants/appText';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface OnboardingProfileScreenProps {
  onContinue: (data: {
    name: string;
    condition: string;
  }) => Promise<void>;
  onBack: () => void;
}

const CONDITIONS = APP_TEXTS.conditions;

export default function OnboardingProfileScreen({
  onContinue,
  onBack,
}: OnboardingProfileScreenProps) {
  const [name, setName] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Animate content entry
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  const canContinue = name.trim() && selectedCondition;

  const handleContinue = async () => {
    if (!canContinue) return;

    setLoading(true);
    try {
      haptics.patterns.buttonPress();
      await onContinue({
        name: name.trim(),
        condition: selectedCondition,
      });
    } catch (error) {
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setLoading(false);
    }
  };

  const handleSelectCondition = (id: string) => {
    LayoutAnimation.configureNext(theme.animations.layoutAnimations.spring);
    setSelectedCondition(id);
  };

  return (
    <View style={styles.container}>
      <Container
        scrollable
        variant="plain"
        keyboardAvoiding
        edges={['top', 'left', 'right']}
        padding={false}
      >
      {/* Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-back"
          onPress={() => {
            haptics.patterns.buttonPress();
            onBack();
          }}
          disabled={loading}
          color={theme.colors.text.primary}
          style={styles.backButton}
        />
      </View>

      {/* Title */}
      <Text variant="largeTitle" style={styles.title}>
        {APP_TEXTS.onboardingProfile.title}
      </Text>
      <Text variant="body" style={styles.subtitle} color="secondary">
        {APP_TEXTS.onboardingProfile.subtitle}
      </Text>

      {/* Name Input */}
      <View style={styles.section}>
        <Text variant="headline" style={styles.sectionLabel}>
          {APP_TEXTS.onboardingProfile.nameLabel}
        </Text>
        <Input
          placeholder={APP_TEXTS.onboardingProfile.namePlaceholder}
          value={name}
          onChangeText={setName}
          editable={!loading}
          placeholderTextColor={theme.colors.text.tertiary}
          style={styles.input}
        />
      </View>

      {/* Condition Selection */}
      <View style={styles.section}>
        <Text variant="headline" style={styles.sectionLabel}>
          {APP_TEXTS.onboardingProfile.conditionLabel}
        </Text>
        <View style={styles.gridContainer}>
          {CONDITIONS.map((condition) => (
            <View key={condition.id} style={styles.gridItemContainer}>
               <AnimatedSelectionCard
                  selected={selectedCondition === condition.id}
                  onPress={() => handleSelectCondition(condition.id)}
                  disabled={loading}
                  isCreamBg={selectedCondition === condition.id}
                  style={[
                    styles.cardContent,
                    selectedCondition === condition.id && styles.selectedCardBackground,
                  ]}
               >
                  <Text
                    variant="body"
                    style={{
                      color:
                        selectedCondition === condition.id
                          ? theme.colors.brand.black
                          : theme.colors.text.primary,
                      textAlign: 'center',
                    }}
                  >
                    {condition.label}
                  </Text>
               </AnimatedSelectionCard>
            </View>
          ))}
        </View>
      </View>

      </Container>

      {/* Continue Button - Fixed Footer */}
      <View style={styles.footer}>
        <Button
          title={loading ? 'Setting up...' : APP_TEXTS.onboardingProfile.continueButton}
          onPress={handleContinue}
          variant="primary"
          size="large"
          fullWidth
          disabled={!canContinue || loading}
        />

        {loading && (
          <ActivityIndicator
            size="large"
            color={theme.colors.brand.primary}
            style={{ marginTop: theme.spacing.lg }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing['2xl'],
    marginTop: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.primary,
    paddingHorizontal: theme.spacing['2xl'],
  },
  subtitle: {
    marginBottom: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing['2xl'],
  },
  section: {
    marginBottom: theme.spacing['3xl'],
    paddingHorizontal: theme.spacing['2xl'],
  },
  sectionLabel: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  input: {
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.md,
    alignContent: 'flex-start',
  },
  gridItemContainer: {
    width: '47%',
    minHeight: 70,
    maxHeight: 100,
  },
  cardContent: {
    minHeight: 60,
    paddingVertical: theme.spacing.lg,
  },
  selectedCardBackground: {
    backgroundColor: theme.colors.brand.cream,
  },
  footer: {
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing.lg,
    paddingBottom: theme.spacing['3xl'],
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
});