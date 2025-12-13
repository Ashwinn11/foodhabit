import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, ActivityIndicator, Animated, Dimensions, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { theme, haptics } from '../theme';
import { Container, Text } from '../components';
import { APP_TEXTS } from '../constants/appText';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Modern Value Prop Component with glassmorphism
interface ValuePropRowProps {
  icon: string;
  text: string;
  index: number;
}

const ValuePropRow: React.FC<ValuePropRowProps> = ({ icon, text, index }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.valuePropRow,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <TouchableOpacity
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
        style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, flex: 1 }}
      >
        <View style={styles.valuePropIconContainer}>
          <Ionicons name={icon as any} size={20} color={theme.colors.brand.primary} />
        </View>
        <Text variant="body" style={styles.valuePropText}>
          {text}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Cute animated mascot component
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
      <View style={styles.mascotGlow} />
      <Image
        source={require('../../assets/icon.png')}
        style={styles.mascot}
      />
    </Animated.View>
  );
};

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
  const bounceAnim = useRef(new Animated.Value(0)).current;

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

    // Bounce animation for mascot (starts after initial animations)
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, {
            toValue: -20,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(bounceAnim, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, 1600);
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
      {/* Dark blue/navy background */}
      <View style={StyleSheet.absoluteFillObject} />

      {/* Decorative Pattern */}
      <DecorativePattern />

      {/* Animated Orbs */}
      <AnimatedOrb delay={0} size={250} initialX={-50} initialY={-100} duration={15000} />
      <AnimatedOrb delay={800} size={200} initialX={SCREEN_WIDTH - 150} initialY={SCREEN_HEIGHT / 2} duration={18000} />
      <AnimatedOrb delay={1500} size={180} initialX={SCREEN_WIDTH / 2} initialY={SCREEN_HEIGHT - 200} duration={16000} />

      {/* Main Content */}
      <Container variant="plain" style={styles.contentContainer} edges={['top', 'left', 'right', 'bottom']}>
        {/* Cute Mascot */}
        <AnimatedMascot
          fadeAnim={fadeAnim}
          scaleAnim={scaleAnim}
          bounceAnim={bounceAnim}
        />

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
            {APP_TEXTS.auth.title}
          </Text>
          <Text variant="title3" align="center" style={styles.subtitle}>
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
                  <ActivityIndicator size="small" color={theme.colors.brand.black} />
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
    backgroundColor: theme.colors.background.primary, // Dark blue/navy
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['3xl'],
  },
  // Mascot styles
  mascotContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing['3xl'],
  },
  mascotGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255, 118, 100, 0.2)',
    blur: 40,
  },
  mascot: {
    width: 140,
    height: 140,
    borderRadius: 70,
    resizeMode: 'contain',
  },
  header: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.md,
    color: theme.colors.brand.white,
    textShadowColor: 'rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    marginBottom: theme.spacing.xl,
    color: theme.colors.brand.white,
    textShadowColor: 'rgba(0, 0, 0, 0.08)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  valuePropsContainer: {
    gap: theme.spacing.md,
  },
  valuePropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: `rgba(255, 255, 255, 0.08)`,
    borderRadius: theme.spacing.lg,
    borderWidth: 1,
    borderColor: `rgba(255, 255, 255, 0.1)`,
  },
  valuePropIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: `rgba(255, 118, 100, 0.2)`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valuePropText: {
    flex: 1,
    color: theme.colors.brand.white,
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
  // Apple Button - Coral background with white text/icon
  appleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.brand.primary, // #ff7664
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.pill,
    gap: theme.spacing.md,
    ...theme.shadows.lg,
    height: 56,
  },
  appleButtonText: {
    color: theme.colors.brand.black,
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
    ...theme.typography.body,
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
    borderRadius: theme.borderRadius.circle,
  },
});
