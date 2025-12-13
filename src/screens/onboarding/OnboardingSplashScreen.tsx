import React, { useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Text, Button, Container } from '../../components';
import { theme, haptics } from '../../theme';
import { APP_TEXTS } from '../../constants/appText';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface OnboardingSplashScreenProps {
  onContinue: () => void;
}

export default function OnboardingSplashScreen({
  onContinue,
}: OnboardingSplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 15,
        friction: 9,
        delay: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 15,
        friction: 9,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={[
          theme.colors.background.primary,
          theme.colors.background.card,
        ]}
        style={StyleSheet.absoluteFillObject}
      />

      <Container variant="plain" style={styles.contentContainer}>
        {/* Icon Circle */}
        <Animated.View
          style={[
            styles.iconContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconCircle}>
            <Ionicons
              name="medkit"
              size={64}
              color={theme.colors.brand.primary}
            />
          </View>
        </Animated.View>

        {/* Title and Subtitle */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text
            variant="largeTitle"
            align="center"
            style={[styles.title, { color: theme.colors.text.primary }]}
          >
            {APP_TEXTS.onboardingSplash.title}
          </Text>

          <Text
            variant="title3"
            align="center"
            style={[styles.subtitle, { color: theme.colors.text.secondary }]}
          >
            {APP_TEXTS.onboardingSplash.subtitle}
          </Text>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Value Props */}
        <Animated.View
          style={[
            styles.valueProps,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {APP_TEXTS.onboardingSplash.valueProps.map((prop) => (
            <ValueProp
              key={prop.title}
              icon={prop.icon}
              title={prop.title}
              description={prop.description}
            />
          ))}
        </Animated.View>

        {/* CTA Button */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Button
            title={APP_TEXTS.onboardingSplash.cta}
            onPress={() => {
              haptics.patterns.buttonPress();
              onContinue();
            }}
            variant="primary"
            size="large"
            fullWidth
          />

          <Text
            variant="caption1"
            align="center"
            style={[styles.disclaimer, { color: theme.colors.text.secondary }]}
          >
            {APP_TEXTS.onboardingSplash.disclaimer}
          </Text>
        </Animated.View>
      </Container>
    </View>
  );
}

interface ValuePropProps {
  icon: string;
  title: string;
  description: string;
}

function ValueProp({ icon, title, description }: ValuePropProps) {
  return (
    <View style={styles.valueProp}>
      <View style={styles.valuePropIcon}>
        <Ionicons name={icon as any} size={24} color={theme.colors.brand.primary} />
      </View>
      <View style={styles.valuePropContent}>
        <Text
          variant="headline"
          style={[styles.valuePropTitle, { color: theme.colors.text.primary }]}
        >
          {title}
        </Text>
        <Text
          variant="body"
          style={[
            styles.valuePropDescription,
            { color: theme.colors.text.secondary },
          ]}
        >
          {description}
        </Text>
      </View>
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
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['3xl'],
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: `${theme.colors.brand.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  title: {
    marginBottom: theme.spacing.md,
  },
  subtitle: {
    lineHeight: 28,
  },
  spacer: {
    flex: 1,
  },
  valueProps: {
    gap: theme.spacing.lg,
    marginBottom: theme.spacing['2xl'],
  },
  valueProp: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  valuePropIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: `${theme.colors.brand.primary}10`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valuePropContent: {
    flex: 1,
    justifyContent: 'center',
  },
  valuePropTitle: {
    marginBottom: theme.spacing.xs,
  },
  valuePropDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    width: '100%',
    paddingBottom: theme.spacing['3xl'],
    gap: theme.spacing.lg,
  },
  disclaimer: {
    lineHeight: 18,
  },
});
