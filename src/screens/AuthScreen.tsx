import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Platform, ActivityIndicator, Animated, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { theme, haptics } from '../theme';
import { Container, Text, Modal } from '../components';
import Gigi from '../components/Gigi';

// Legal text for footer
const LEGAL_TEXT = {
  prefix: 'By continuing, you agree to our',
  terms: 'Terms of Service',
  privacy: 'Privacy Policy',
};

// Animated mascot component using AnimatedCrownMascot
interface AnimatedMascotProps {
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  bounceAnim: Animated.Value;
}

const AnimatedMascot: React.FC<AnimatedMascotProps> = ({ fadeAnim, scaleAnim }) => {
  return (
    <Animated.View
      style={[
        styles.mascotContainer,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <Gigi emotion="happy-cute" size="md" />
    </Animated.View>
  );
};

export default function AuthScreen({ navigation }: any) {
  const { signInWithApple, signInWithGoogle, isAppleAuthAvailable } = useAuth();
  const [appleAuthAvailable, setAppleAuthAvailable] = useState(false);
  const [loadingButton, setLoadingButton] = useState<'apple' | 'google' | null>(null);
  
  // Modal State
  const [errorModalVisible, setErrorModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    checkAppleAuth();

    // Entrance animations
    const animation = Animated.parallel([
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
    ]);
    
    animation.start();

    return () => {
      animation.stop();
      fadeAnim.stopAnimation();
      slideAnim.stopAnimation();
      scaleAnim.stopAnimation();
      bounceAnim.stopAnimation();
    };
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
      setErrorMessage(error.message || 'Failed to sign in');
      setErrorModalVisible(true);
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
      setErrorMessage(error.message || 'Failed to sign in');
      setErrorModalVisible(true);
    } finally {
      setLoadingButton(null);
    }
  };

  return (
      <Container 
        scrollable={true} 
        style={styles.container}
        contentContainerStyle={styles.contentContainer} 
        edges={['top', 'left', 'right', 'bottom']}
      >
        {/* Top Section: App Icon */}
        <View style={styles.topSection}>
           <AnimatedMascot
            fadeAnim={fadeAnim}
            scaleAnim={scaleAnim}
            bounceAnim={bounceAnim}
          />
          
          {/* Welcome Text */}
          <Text variant="largeTitle" weight="bold" style={styles.title}>
            GutScan
          </Text>
          <Text variant="body" style={styles.subtitle}>
            Your personal gut health companion
          </Text>
        </View>

        {/* Value Propositions */}
        <Animated.View style={[styles.valuePropsContainer, { opacity: fadeAnim }]}>
          <View style={styles.valuePropRow}>
            <View style={styles.valuePropIconContainer}>
              <Ionicons name="camera" size={24} color={theme.colors.brand.coral} />
            </View>
            <View style={styles.valuePropTextContainer}>
              <Text variant="headline" style={styles.valuePropTitle}>
                Scan
              </Text>
              <Text variant="caption1" style={styles.valuePropSubtitle}>
                Take a photo and get instant gut scores.
              </Text>
            </View>
          </View>
          
          <View style={styles.valuePropRow}>
            <View style={styles.valuePropIconContainer}>
              <Ionicons name="analytics" size={24} color={theme.colors.brand.coral} />
            </View>
            <View style={styles.valuePropTextContainer}>
              <Text variant="headline" style={styles.valuePropTitle}>
                Track
              </Text>
              <Text variant="caption1" style={styles.valuePropSubtitle}>
                Monitor fiber, triggers & plant diversity.
              </Text>
            </View>
          </View>
          
          <View style={styles.valuePropRow}>
            <View style={styles.valuePropIconContainer}>
              <Ionicons name="heart" size={24} color={theme.colors.brand.coral} />
            </View>
            <View style={styles.valuePropTextContainer}>
              <Text variant="headline" style={styles.valuePropTitle}>
                Grow
              </Text>
              <Text variant="caption1" style={styles.valuePropSubtitle}>
                Build healthy habits with Gigi.
              </Text>
            </View>
          </View>
        </Animated.View>

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
                  <ActivityIndicator size="small" color={theme.colors.brand.cream} />
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
              <Text variant="caption1" style={styles.legalLink} onPress={() => navigation.navigate('TermsOfService')}>
                {LEGAL_TEXT.terms}
              </Text>
              {' '}and{' '}
              <Text variant="caption1" style={styles.legalLink} onPress={() => navigation.navigate('PrivacyPolicy')}>
                {LEGAL_TEXT.privacy}
              </Text>
            </Text>
          </View>
        </Animated.View>
        
        <Modal
            visible={errorModalVisible}
            title="Authentication Error"
            message={errorMessage}
            primaryButtonText="OK"
            onPrimaryPress={() => setErrorModalVisible(false)}
            onClose={() => setErrorModalVisible(false)}
            variant="error"
        />
      </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1, // Allow content to grow and enable centering
    justifyContent: 'center', // Center content vertically
    paddingHorizontal: theme.spacing['2xl'],
    paddingTop: theme.spacing['2xl'],
    paddingBottom: theme.spacing['3xl'], // Extra bottom padding for safe area
    maxWidth: 600, // Constrain width on larger screens like iPad
    alignSelf: 'center', // Center the content
    width: '100%', // Take full width up to maxWidth
  },
  topSection: {
    alignItems: 'center',
    width: '100%',
    paddingTop: theme.spacing.md,
    marginBottom: theme.spacing['2xl'], // Reduced from overflow visible
  },
  // Mascot styles
  mascotContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    overflow: 'visible',
  },
  mascotBg: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.brand.cream,
    justifyContent: 'center',
    alignItems: 'center',
    // Subtle shadow
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  mascot: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  header: {
    width: '100%',
    paddingHorizontal: theme.spacing.md,
  },
  title: {
    marginBottom: theme.spacing.xs,
    color: theme.colors.text.white,
  },
  subtitle: {
    marginBottom: theme.spacing.lg,
    color: theme.colors.text.white,
  },
  valuePropsContainer: {
    gap: theme.spacing.lg, // Reduced from xl for tighter spacing
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing['3xl'], // Good spacing before footer
    width: '100%',
  },
  valuePropRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  valuePropIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.brand.coral + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valuePropTextContainer: {
    flex: 1,
  },
  valuePropTitle: {
    color: theme.colors.text.white,
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  valuePropSubtitle: {
    color: theme.colors.text.white,
    fontSize: 14,
    opacity: 0.7,
  },
  footer: {
    width: '100%',
    paddingTop: theme.spacing.lg, // Added top padding for better separation
    paddingBottom: theme.spacing.lg, // Increased padding to prevent cropping
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
    backgroundColor: theme.colors.brand.coral,
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
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: theme.spacing.md, // Added vertical padding for better spacing
  },
  legalText: {
    color: theme.colors.text.white,
    lineHeight: 18,
  },
  legalLink: {
    color: theme.colors.text.white,
    textDecorationLine: 'underline',
  },
});