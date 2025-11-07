import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, Alert, ActivityIndicator, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../hooks/useAuth';
import { getAllRedirectUrls } from '../config/supabase';
import { theme, r } from '../theme';
import { Container, Text, Button } from '../components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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
  const { loading, error, signInWithApple, signInWithGoogle, isAppleAuthAvailable } = useAuth();
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    checkAppleAuth();

    // Entrance animations - slower and more subtle
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

  useEffect(() => {
    if (error) {
      Alert.alert('Authentication Error', error.message);
    }
  }, [error]);

  const handleAppleSignIn = async () => {
    await signInWithApple();
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleShowRedirectUrl = () => {
    const urls = getAllRedirectUrls();

    const message = `Add BOTH URLs to your Supabase project:\n\n1. Expo Go (Dev):\n${urls.expoGo}\n\n2. Standalone Build:\n${urls.standalone}\n\nCurrently using:\n${urls.current}\n\nGo to: Authentication > URL Configuration > Redirect URLs`;

    Alert.alert(
      'Supabase Redirect URLs',
      message,
      [
        {
          text: 'Copy to Console',
          onPress: () => {
            console.log('=== SUPABASE REDIRECT URLs ===');
            console.log('Expo Go (Dev):', urls.expoGo);
            console.log('Standalone:', urls.standalone);
            console.log('Current:', urls.current);
            console.log('============================');
          }
        },
        { text: 'OK' },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        {/* Gradient Background */}
        <LinearGradient
          colors={['#ff7664', '#ff9a8a', '#ffb5a7']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />

        {/* Animated Orbs */}
        <AnimatedOrb delay={0} size={250} initialX={-50} initialY={-100} duration={15000} />
        <AnimatedOrb delay={800} size={200} initialX={SCREEN_WIDTH - 150} initialY={SCREEN_HEIGHT / 2} duration={18000} />
        <AnimatedOrb delay={1500} size={180} initialX={SCREEN_WIDTH / 2} initialY={SCREEN_HEIGHT - 200} duration={16000} />

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text variant="body" style={styles.loadingText}>
            Signing in...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Gradient Background */}
      <LinearGradient
        colors={['#ff7664', '#ff9a8a', '#ffb5a7']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Animated Orbs */}
      <AnimatedOrb delay={0} size={250} initialX={-50} initialY={-100} duration={15000} />
      <AnimatedOrb delay={800} size={200} initialX={SCREEN_WIDTH - 150} initialY={SCREEN_HEIGHT / 2} duration={18000} />
      <AnimatedOrb delay={1500} size={180} initialX={SCREEN_WIDTH / 2} initialY={SCREEN_HEIGHT - 200} duration={16000} />

      {/* Main Content */}
      <Container variant="plain" center style={styles.contentContainer}>
        <Animated.View
          style={[
            styles.glassContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
        >
          {/* Glass Morphism Card */}
          <BlurView intensity={20} tint="light" style={styles.glassCard}>
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text variant="largeTitle" align="center" style={styles.title}>
                  Food Habit
                </Text>
                <Text variant="callout" align="center" style={styles.subtitle}>
                  Track your eating habits and build healthier routines
                </Text>
              </View>

              {/* Auth Buttons */}
              <View style={styles.authButtons}>
                {appleAuthAvailable && Platform.OS === 'ios' && (
                  <View style={styles.buttonContainer}>
                    <AppleAuthentication.AppleAuthenticationButton
                      buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                      buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                      cornerRadius={theme.borderRadius.pill}
                      style={styles.appleButton}
                      onPress={handleAppleSignIn}
                    />
                  </View>
                )}

                <Button
                  title="Continue with Google"
                  onPress={handleGoogleSignIn}
                  variant="primary"
                  size="large"
                  fullWidth
                  disabled={loading}
                  loading={loading}
                />

                {__DEV__ && (
                  <Button
                    title="Show Redirect URL"
                    onPress={handleShowRedirectUrl}
                    variant="ghost"
                    size="small"
                    style={styles.debugButton}
                  />
                )}
              </View>
            </View>
          </BlurView>
        </Animated.View>

        {__DEV__ && (
          <BlurView intensity={15} tint="dark" style={styles.devInfo}>
            <Text variant="caption2" style={styles.devInfoText}>
              Using Supabase Auth
            </Text>
          </BlurView>
        )}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ff7664',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  glassContainer: {
    width: '100%',
    maxWidth: 420,
  },
  glassCard: {
    borderRadius: theme.borderRadius['2xl'],
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    ...theme.shadows.xl,
  },
  content: {
    padding: theme.spacing['3xl'],
    width: '100%',
  },
  header: {
    marginBottom: theme.spacing['3xl'],
    width: '100%',
  },
  title: {
    marginBottom: theme.spacing.lg,
    color: '#1a1a1a',
    fontWeight: '700',
  },
  subtitle: {
    color: '#4a4a4a',
    opacity: 0.9,
  },
  authButtons: {
    width: '100%',
    gap: theme.spacing.lg,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  appleButton: {
    width: '100%',
    height: 56,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: theme.spacing.lg,
    color: '#ffffff',
    fontSize: 17,
  },
  debugButton: {
    marginTop: theme.spacing.md,
  },
  devInfo: {
    position: 'absolute',
    bottom: theme.spacing['2xl'],
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  devInfoText: {
    color: '#ffffff',
  },
  // Animated orb styles
  orb: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
