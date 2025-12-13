import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, ActivityIndicator, Animated, Dimensions, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { theme, haptics } from '../theme';
import { Container, Text } from '../components';
import { APP_TEXTS } from '../constants/appText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Solid, modern value prop component
interface ValuePropRowProps {
  icon: string;
  text: string;
  index: number;
}

const ValuePropRow: React.FC<ValuePropRowProps> = ({ icon, text, index }) => {
  return (
    <View style={styles.valuePropRow}>
      <View style={styles.valuePropIconContainer}>
        <Ionicons name={icon as any} size={20} color={theme.colors.brand.primary} />
      </View>
      <Text variant="body" style={styles.valuePropText}>
        {text}
      </Text>
    </View>
  );
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
      <View style={styles.mascotBg}>
         <Image
          source={require('../../assets/icon.png')}
          style={styles.mascot}
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
        Animated.timing(bounceAnim, {
          toValue: -10,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: true,
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
        
        {/* Spacer for top */}
        <View style={{ height: theme.spacing['4xl'] }} />

        {/* Mascot */}
        <AnimatedMascot
          fadeAnim={fadeAnim}
          scaleAnim={scaleAnim}
          bounceAnim={bounceAnim}
        />

        {/* Header */}
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
            {APP_TEXTS.auth.title}
          </Text>
          <Text variant="body" align="center" style={styles.subtitle}>
            {APP_TEXTS.auth.subtitle}
          </Text>

          <View style={styles.valuePropsContainer}>
            {APP_TEXTS.auth.valueProps.map((prop, index) => (
              <ValuePropRow
                key={prop.text}
                icon={prop.icon}
                text={prop.text}
                index={index}
              />
            ))}
          </View>
        </Animated.View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Footer */}
        <Animated.View
          style={[
            styles.footer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }], // Reuse slide anim for footer
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
              activeOpacity={0.8}
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
              {APP_TEXTS.auth.legalPrefix}{' '}
              <Text variant="caption1" style={styles.legalLink}>
                {APP_TEXTS.auth.termsLink}
              </Text>
              {' '}and{' '}
              <Text variant="caption1" style={styles.legalLink}>
                {APP_TEXTS.auth.privacyLink}
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
    paddingTop: theme.spacing['2xl'],
  },
  // Mascot styles
  mascotContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
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
    marginTop: theme.spacing.lg,
  },
  valuePropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  valuePropIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.background.card,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valuePropText: {
    flex: 1,
    color: theme.colors.text.primary,
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
  // Apple Button - Black background with white text/icon (Standard Apple Design)
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primary, // #ff7664
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.pill,
    gap: theme.spacing.md,
    height: 56,
  },
  appleButtonText: {
    color: theme.colors.brand.black,
  },
  // Google Button - White background with black text
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.white,
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