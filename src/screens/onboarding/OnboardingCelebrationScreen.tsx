import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Container } from '../../components';
import { theme, haptics } from '../../theme';

interface OnboardingCelebrationScreenProps {
  name: string;
  onContinue: () => void;
}

const MISSION_STEPS = [
  { id: 1, status: 'complete', title: 'STRIKE 1', icon: 'checkmark-circle' },
  { id: 2, status: 'locked', title: 'STRIKE 2', icon: 'lock-closed' },
  { id: 3, status: 'locked', title: 'ENEMY REVEAL', icon: 'skull' },
];

export default function OnboardingCelebrationScreen({
  onContinue,
}: OnboardingCelebrationScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 20,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    haptics.patterns.success();
  }, []);

  return (
    <View style={styles.container}>
      <Container variant="plain" style={styles.contentContainer} scrollable>
        {/* Spacer */}
        <View style={{ height: 40 }} />

        {/* Hero Section */}
        <Animated.View style={{ alignItems: 'center', transform: [{ scale: scaleAnim }] }}>
          <View style={styles.heroCircle}>
             <Ionicons name="flash" size={60} color={theme.colors.brand.primary} />
          </View>
          <Text variant="largeTitle" align="center" weight="bold" style={styles.heroTitle}>
            STRIKE SUCCESSFUL
          </Text>
          <Text variant="headline" align="center" color="secondary" style={{ letterSpacing: 1 }}>
            INTEL SECURED: 33%
          </Text>
        </Animated.View>

        {/* Tactical Map */}
        <Animated.View 
          style={[
            styles.mapSection, 
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Text variant="headline" weight="bold" style={styles.sectionTitle}>
            MISSION TIMELINE
          </Text>
          
          <View style={styles.cardsRow}>
            {MISSION_STEPS.map((step, index) => {
              const isComplete = step.status === 'complete';
              const isLast = index === 2;
              
              return (
                <View 
                  key={step.id} 
                  style={[
                    styles.missionCard, 
                    isComplete ? styles.cardComplete : styles.cardLocked,
                    isLast && styles.cardDanger
                  ]}
                >
                  <View style={styles.cardIcon}>
                    <Ionicons 
                      name={step.icon as any} 
                      size={24} 
                      color={isComplete ? theme.colors.brand.white : (isLast ? theme.colors.brand.secondary : theme.colors.text.tertiary)} 
                    />
                  </View>
                  <Text 
                    variant="caption2" 
                    weight="bold" 
                    align="center"
                    style={{ 
                      color: isComplete ? theme.colors.brand.white : (isLast ? theme.colors.text.primary : theme.colors.text.secondary),
                      marginTop: 8,
                      fontSize: 10
                    }}
                  >
                    {step.title}
                  </Text>
                </View>
              );
            })}
            
            {/* Connecting Lines */}
            <View style={styles.connectorLine} />
          </View>
        </Animated.View>

        {/* Debrief Card */}
        <Animated.View 
          style={[
            styles.debriefCard,
            { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
          ]}
        >
          <View style={styles.debriefHeader}>
            <Ionicons name="warning" size={20} color={theme.colors.brand.primary} />
            <Text variant="headline" weight="bold" style={{ marginLeft: 8, color: theme.colors.text.primary }}>
              NEXT DEPLOYMENT
            </Text>
          </View>
          <Text variant="body" color="secondary" style={{ lineHeight: 22 }}>
            I will signal you tomorrow morning. We need 2 more reports to expose your gut's enemy. Stay sharp.
          </Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Action Button */}
        <Button
          title="RETURN TO BASE"
          onPress={() => {
            haptics.patterns.buttonPress();
            onContinue();
          }}
          variant="primary"
          size="large"
          fullWidth
          style={styles.button}
        />
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  heroCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.brand.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.brand.primary,
    marginBottom: theme.spacing.lg,
    shadowColor: theme.colors.brand.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  heroTitle: {
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
    fontSize: 28,
  },
  sectionTitle: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.tertiary,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  mapSection: {
    marginTop: theme.spacing['4xl'],
    marginBottom: theme.spacing['2xl'],
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    height: 100,
  },
  connectorLine: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    height: 2,
    backgroundColor: theme.colors.border.light,
    zIndex: -1,
  },
  missionCard: {
    width: '30%',
    height: 100,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
  },
  cardComplete: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
    transform: [{ scale: 1.05 }],
    shadowColor: theme.colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  cardLocked: {
    backgroundColor: theme.colors.background.card,
    borderColor: theme.colors.border.light,
  },
  cardDanger: {
    borderColor: theme.colors.text.primary,
    borderStyle: 'dashed',
  },
  cardIcon: {
    marginBottom: 8,
  },
  debriefCard: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.brand.primary,
  },
  debriefHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  button: {
    marginBottom: theme.spacing.xl,
  },
});