import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, ActivityIndicator, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../hooks/useAuth';
import { theme, r, haptics } from '../theme';
import { Container, Text } from '../components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Decorative pattern component using simple overlays
const DecorativePattern: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Top gradient overlay */}
      <LinearGradient
        colors={['rgba(255, 255, 255, 0.12)', 'transparent']}
        style={styles.topOverlay}
      />

      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(255, 255, 255, 0.08)']}
        style={styles.bottomOverlay}
      />

      {/* Decorative circles */}
      <View style={[styles.decorCircle, { top: -50, right: -50, width: 200, height: 200 }]} />
      <View style={[styles.decorCircle, { bottom: -80, left: -80, width: 250, height: 250 }]} />
    </View>
  );
};

// Floating animated orb component for background
const AnimatedOrb: React.FC<{ delay?: number; size?: number; initialX?: number; initialY?: number; duration?: number }> = ({
  delay = 0,
  size = 200,
  initialX = 0,
  initialY = 0,
  duration = 8000,
}) => {
  const translateX = useRef(new Animated.Value(initialX)).current;
  const translateY = useRef(new Animated.Value(initialY)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation - slower and more subtle
    Animated.timing(opacity, {
      toValue: 0.4,
      duration: 1500,
      delay,
      useNativeDriver: true,
    }).start();

    // Floating animation - slower and gentler movement
    const animate = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: Math.random() * 40 - 20, // Reduced from 100 to 40
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(translateX, {
              toValue: initialX,
              duration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(translateY, {
              toValue: Math.random() * 40 - 20, // Reduced from 100 to 40
              duration,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: initialY,
              duration,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    };

    setTimeout(animate, delay);
  }, []);

  return (
    <Animated.View
      style={[
        styles.orb,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          transform: [{ translateX }, { translateY }],
          opacity,
        },
      ]}
    />
  );
};

export default function AuthScreen() {
  const { signInWithApple, signInWithGoogle, isAppleAuthAvailable } = useAuth();
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [loadingButton, setLoadingButton] = useState<'apple' | 'google' | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    checkAppleAuth();

    // Entrance animations
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

  const checkAppleAuth = async () => {
    const available = await isAppleAuthAvailable();
    setAppleAuthAvailable(available);
  };

  const handleAppleSignIn = async () => {
    haptics.patterns.buttonPress();
    setLoadingButton('apple');
    try {
      await signInWithApple();
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'Failed to sign in');
    } finally {
      setLoadingButton(null);
    }
  };

  const handleGoogleSignIn = async () => {
    haptics.patterns.buttonPress();
    setLoadingButton('google');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Authentication Error', error.message || 'Failed to sign in');
    } finally {
      setLoadingButton(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Background - Light at top, heavy at bottom */}
      <LinearGradient
        colors={['#ffb5a7', '#ff9a8a', '#ff7664']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative Pattern */}
      <DecorativePattern />

      {/* Animated Orbs */}
      <AnimatedOrb delay={0} size={250} initialX={-50} initialY={-100} duration={15000} />
      <AnimatedOrb delay={800} size={200} initialX={SCREEN_WIDTH - 150} initialY={SCREEN_HEIGHT / 2} duration={18000} />
      <AnimatedOrb delay={1500} size={180} initialX={SCREEN_WIDTH / 2} initialY={SCREEN_HEIGHT - 200} duration={16000} />

      {/* Main Content */}
      <Container variant="plain" style={styles.contentContainer}>
        {/* Header at Top */}
        <Animated.View
          style={[
            styles.header,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text variant="largeTitle" align="center" style={styles.title}>
            Food Habit
          </Text>
          <Text variant="title3" align="center" style={styles.subtitle}>
            Track your eating habits and build healthier routines
          </Text>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Footer with Auth Buttons and Legal */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Auth Buttons */}
          <View style={styles.authButtons}>
            {appleAuthAvailable && Platform.OS === 'ios' && (
              <TouchableOpacity
                style={[
                  styles.appleButton,
                  loadingButton !== null && styles.buttonDisabled,
                ]}
                onPress={handleAppleSignIn}
                disabled={loadingButton !== null}
                activeOpacity={0.8}
              >
                {loadingButton === 'apple' ? (
                  <ActivityIndicator size="small" color={theme.colors.brand.white} />
                ) : (
                  <Ionicons name="logo-apple" size={24} color={theme.colors.brand.white} />
                )}
                <Text variant="headline" style={styles.appleButtonText}>
                  {loadingButton === 'apple' ? 'Signing in...' : 'Continue with Apple'}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={[
                styles.googleButton,
                loadingButton !== null && styles.buttonDisabled,
              ]}
              onPress={handleGoogleSignIn}
              disabled={loadingButton !== null}
              activeOpacity={0.8}
            >
              {loadingButton === 'google' ? (
                <ActivityIndicator size="small" color={theme.colors.brand.black} />
              ) : (
                <Ionicons name="logo-google" size={24} color="#EA4335" />
              )}
              <Text variant="headline" style={styles.googleButtonText}>
                {loadingButton === 'google' ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legal Text */}
          <View style={styles.legalContainer}>
            <Text variant="caption1" align="center" style={styles.legalText}>
              By continuing, you agree to our{' '}
              <Text variant="caption1" style={styles.legalLink}>
                Terms of Service
              </Text>
              {' '}and{' '}
              <Text variant="caption1" style={styles.legalLink}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </Animated.View>
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.primary,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['6xl'],
  },
  header: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.brand.white,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: theme.colors.brand.white,
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  spacer: {
    flex: 1,
  },
  footer: {
    width: '100%',
    paddingBottom: theme.spacing['3xl'],
  },
  authButtons: {
    width: '100%',
    gap: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
  },
  // Apple Button - Black background with white text/icon (OAuth - keep as-is)
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.black,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.pill,
    gap: theme.spacing.md,
    ...theme.shadows.lg,
    height: 56,
  },
  appleButtonText: {
    color: theme.colors.brand.white,
  },
  // Google Button - White background with black text and colored logo (OAuth - keep as-is)
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.white,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.pill,
    gap: theme.spacing.md,
    ...theme.shadows.lg,
    height: 56,
  },
  googleButtonText: {
    color: theme.colors.brand.black,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  legalContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  legalText: {
    color: theme.colors.brand.white,
    lineHeight: 18,
  },
  legalLink: {
    color: theme.colors.brand.white,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    color: theme.colors.brand.white,
    fontSize: 17,
  },
  // Animated orb styles
  orb: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  // Decorative pattern styles
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 300,
  },
  decorCircle: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 9999,
  },
});
