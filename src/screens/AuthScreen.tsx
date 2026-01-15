import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme';
import { GutAvatar, ScreenWrapper } from '../components';

export default function AuthScreen() {
  const { signInWithApple, signInWithGoogle, isAppleAuthAvailable } = useAuth();
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  
  const avatarWiggle = useSharedValue(0);
  
  React.useEffect(() => {
    checkAppleAuth();
    // Start wiggle animation
    avatarWiggle.value = withRepeat(
      withSequence(
        withTiming(-5, { duration: 1000 }),
        withTiming(5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [avatarWiggle]);

  const checkAppleAuth = async () => {
    const available = await isAppleAuthAvailable();
    setAppleAvailable(available);
  };

  const handleAppleSignIn = async () => {
    setLoading('apple');
    try {
      await signInWithApple();
    } catch (error: any) {
      Alert.alert('Oops!', error.message || 'Failed to sign in with Apple');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Oops!', error.message || 'Failed to sign in with Google');
    } finally {
      setLoading(null);
    }
  };
  
  const avatarStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${avatarWiggle.value}deg` }],
  }));

  return (
    <ScreenWrapper style={styles.container}>
      <View style={styles.content}>
        {/* Header with mascot */}
        <Animated.View 
          entering={FadeInDown.delay(100).springify()}
          style={styles.header}
        >
          <Animated.View style={avatarStyle}>
            <GutAvatar mood="happy" size={120} showBadge badgeIcon="hand-right" />
          </Animated.View>
          
          <Text style={styles.title}>Gut Buddy</Text>
          <Text style={styles.subtitle}>Your friendly poop tracker!</Text>
        </Animated.View>
        
        {/* Welcome text */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.welcomeCard}
        >
          <Ionicons name="sparkles" size={32} color={colors.yellow} style={styles.welcomeIcon} />
          <Text style={styles.welcomeTitle}>Track your gut health</Text>
          <Text style={styles.welcomeText}>
            Log your poops, meals, and symptoms to understand your digestive patterns better!
          </Text>
        </Animated.View>

        {/* Auth Buttons */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.authButtons}
        >
          {appleAvailable && Platform.OS === 'ios' && (
            <AuthButton
              onPress={handleAppleSignIn}
              disabled={loading !== null}
              loading={loading === 'apple'}
              icon="logo-apple"
              text="Continue with Apple"
              variant="dark"
            />
          )}

          <AuthButton
            onPress={handleGoogleSignIn}
            disabled={loading !== null}
            loading={loading === 'google'}
            icon="logo-google"
            text="Continue with Google"
            variant="light"
          />
        </Animated.View>
        
        {/* Footer */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
          <View style={styles.footerIcons}>
            <Ionicons name="heart" size={20} color={colors.pink} />
            <Ionicons name="happy" size={20} color={colors.yellow} />
            <Ionicons name="leaf" size={20} color={colors.blue} />
          </View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

// Reusable auth button component
interface AuthButtonProps {
  onPress: () => void;
  disabled: boolean;
  loading: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  text: string;
  variant: 'dark' | 'light';
}

const AuthButton: React.FC<AuthButtonProps> = ({
  onPress,
  disabled,
  loading,
  icon,
  text,
  variant,
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1);
  };
  
  const isDark = variant === 'dark';
  
  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
    >
      <Animated.View
        style={[
          styles.button,
          isDark ? styles.darkButton : styles.lightButton,
          animatedStyle,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={isDark ? colors.white : colors.black} />
        ) : (
          <>
            <Ionicons 
                name={icon} 
                size={20} 
                color={isDark ? colors.white : colors.black} 
                style={styles.buttonIcon} 
            />
            <Text style={[
              styles.buttonText,
              isDark ? styles.darkButtonText : styles.lightButtonText,
            ]}>
              {text}
            </Text>
          </>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: fontSizes['4xl'],
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
    marginTop: spacing.xl,
  },
  subtitle: {
    fontSize: fontSizes.lg,
    color: colors.pink, // Candy Pink
    marginTop: spacing.xs,
    fontFamily: fonts.bodyBold,
  },
  welcomeCard: {
    backgroundColor: colors.white,
    borderRadius: radii['2xl'],
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing['2xl'],
    ...shadows.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  welcomeIcon: {
    marginBottom: spacing.md,
  },
  welcomeTitle: {
    fontSize: fontSizes.xl,
    fontFamily: fonts.heading,
    color: colors.black,
    marginBottom: spacing.sm,
  },
  welcomeText: {
    fontSize: fontSizes.md,
    color: colors.black + '99',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: fonts.body,
  },
  authButtons: {
    gap: spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: radii.xl,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  darkButton: {
    backgroundColor: colors.black,
  },
  lightButton: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  buttonIcon: {
    marginRight: spacing.sm,
  },
  buttonText: {
    fontSize: fontSizes.md,
    fontFamily: fonts.bodyBold,
  },
  darkButtonText: {
    color: colors.white,
  },
  lightButtonText: {
    color: colors.black,
  },
  footer: {
    marginTop: spacing['3xl'],
    alignItems: 'center',
  },
  footerText: {
    fontSize: fontSizes.xs,
    color: colors.black + '66',
    textAlign: 'center',
    fontFamily: fonts.body,
    marginBottom: spacing.md,
  },
  footerIcons: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
});