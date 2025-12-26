import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, ActivityIndicator, Animated, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { theme, haptics } from '../theme';
import { Container, Text } from '../components';

// Legal text for footer
const LEGAL_TEXT = {
  prefix: 'By continuing, you agree to our',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
};

// Simplified solid mascot/logo component
interface AnimatedMascotProps {
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  bounceAnim: Animated.Value;
}

const AnimatedMascot: React.FC<AnimatedMascotProps> = ({ fadeAnim, scaleAnim, bounceAnim }) => {
  return (
    <Animated.View
      style={[
        styles.mascotContainer,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: bounceAnim },
          ],
        },
      ]}
    >
      <View style={[styles.mascotBg, { borderRadius: theme.borderRadius['3xl'] }]}>
         <Image
          source={require('../../assets/icon.png')}
          style={[styles.mascot, { width: 110, height: 110 }]}
        />
      </View>
    </Animated.View>
  );
};

export default function AuthScreen() {
  const { signInWithApple, signInWithGoogle, isAppleAuthAvailable } = useAuth();
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [loadingButton, setLoadingButton] = useState<'apple' | 'google' | null>(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAppleAuth();

    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 20,
        friction: 8,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

     // Gentle float animation for mascot
     Animated.loop(
      Animated.sequence([
        Animated.spring(bounceAnim, { // Using spring for bouncier feel
          toValue: -15, // Increased vertical movement
          useNativeDriver: true,
          ...theme.animations.springConfig.bouncy, // Use bouncy config
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          useNativeDriver: true,
          ...theme.animations.springConfig.bouncy,
        }),
      ])
    ).start();

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
      {/* Solid Background */}
      <View style={StyleSheet.absoluteFillObject} />

      {/* Main Content */}
      <Container variant="plain" style={styles.contentContainer} edges={['top', 'left', 'right', 'bottom']}>
        
        {/* Top Section: App Icon */}
        <View style={styles.topSection}>
           <AnimatedMascot
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
            bounceAnim={bounceAnim}
          />
        </View>

        {/* Bottom Section: Buttons + Legal */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
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
                onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, ...theme.animations.springConfig.bouncy }).start()}
                onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, ...theme.animations.springConfig.default }).start()}
                activeOpacity={1} 
              >
                {loadingButton === 'apple' ? (
                  <ActivityIndicator size="small" color={theme.colors.brand.white} />
                ) : (
                  <Ionicons name="logo-apple" size={24} color={theme.colors.brand.black} />
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
              onPressIn={() => Animated.spring(scaleAnim, { toValue: 0.92, useNativeDriver: true, ...theme.animations.springConfig.bouncy }).start()}
              onPressOut={() => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, ...theme.animations.springConfig.default }).start()}
              activeOpacity={1}
            >
              {loadingButton === 'google' ? (
                <ActivityIndicator size="small" color={theme.colors.brand.black} />
              ) : (
                <Ionicons name="logo-google" size={24} color={theme.colors.brand.black} />
              )}
              <Text variant="headline" style={styles.googleButtonText}>
                {loadingButton === 'google' ? 'Signing in...' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legal Text */}
          <View style={styles.legalContainer}>
            <Text variant="caption1" align="center" style={styles.legalText}>
              {LEGAL_TEXT.prefix}{' '}
              <Text variant="caption1" style={styles.legalLink}>
                {LEGAL_TEXT.terms}
              </Text>
              {' '}and{' '}
              <Text variant="caption1" style={styles.legalLink}>
                {LEGAL_TEXT.privacy}
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
    backgroundColor: theme.colors.background.primary,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingVertical: theme.spacing['2xl'],
    justifyContent: 'space-between', // Distribute space between Top and Bottom sections
  },
  topSection: {
    alignItems: 'center',
    width: '100%',
    paddingTop: theme.spacing['2xl'], // Add some top padding
  },
  // Mascot styles
  mascotContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['2xl'],
  },
  mascotBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.background.card, // Solid card background
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow
    shadowColor: theme.colors.brand.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mascot: {
    width: 100,
    height: 100,
    borderRadius: 50,
    resizeMode: 'contain',
  },
  header: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.md,
    color: theme.colors.text.primary,
  },
  subtitle: {
    marginBottom: theme.spacing['2xl'],
    color: theme.colors.text.secondary,
  },
  valuePropsContainer: {
    gap: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing['2xl'],
    width: '100%',
  },
  valuePropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
    backgroundColor: theme.colors.background.card, // Add background to row for card-like feel
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
  },
  valuePropIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.brand.primary + '15', // Light primary color background
    justifyContent: 'center',
    alignItems: 'center',
  },
  valuePropText: {
    flex: 1,
    color: theme.colors.text.primary,
  },
  footer: {
    width: '100%',
    paddingBottom: theme.spacing.xl,
  },
  authButtons: {
    width: '100%',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primary,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.pill,
    gap: theme.spacing.md,
    height: 56,
  },
  appleButtonText: {
    color: theme.colors.brand.black,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.cream,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.pill,
    gap: theme.spacing.md,
    height: 56,
  },
  googleButtonText: {
    color: theme.colors.brand.black,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  legalContainer: {
    paddingHorizontal: theme.spacing.md,
  },
  legalText: {
    color: theme.colors.text.secondary,
    lineHeight: 18,
  },
  legalLink: {
    color: theme.colors.text.primary,
    textDecorationLine: 'underline',
  },
});