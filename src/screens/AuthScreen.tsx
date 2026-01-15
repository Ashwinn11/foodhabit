import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../theme';
import { useUIStore } from '../store/useUIStore';
import { GutAvatar, ScreenWrapper, IconContainer, Typography, Card, Button } from '../components';

export default function AuthScreen() {
  const { signInWithApple, signInWithGoogle, isAppleAuthAvailable } = useAuth();
  const { showAlert } = useUIStore();
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
      showAlert('Oops!', error.message || 'Failed to sign in with Apple', 'error');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading('google');
    try {
      await signInWithGoogle();
    } catch (error: any) {
      showAlert('Oops!', error.message || 'Failed to sign in with Google', 'error');
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
            <GutAvatar mood="easy" size={120} showBadge badgeIcon="hand-right" />
          </Animated.View>
          
          <Typography variant="h1" style={{ marginTop: spacing.xl }}>Gut Buddy</Typography>
          <Typography variant="bodyBold" color={colors.pink} style={{ marginTop: spacing.xs }}>
            Your friendly poop tracker!
          </Typography>
        </Animated.View>
        
        {/* Welcome text */}
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Card 
            variant="white"
            style={styles.welcomeCard}
            padding="xl"
          >
            <IconContainer
              name="sparkles"
              size={48}
              iconSize={32}
              color={colors.black}
              backgroundColor={colors.yellow}
              borderWidth={0}
              shadow={false}
              style={styles.welcomeIcon}
            />
            <Typography variant="h3">Track your gut health</Typography>
            <Typography variant="body" align="center" color={colors.black + '99'}>
              Log your poops, meals, and symptoms to understand your digestive patterns better!
            </Typography>
          </Card>
        </Animated.View>

        {/* Auth Buttons */}
        <Animated.View 
          entering={FadeInDown.delay(300).springify()}
          style={styles.authButtons}
        >
          {appleAvailable && Platform.OS === 'ios' && (
            <Button
              title="Continue with Apple"
              onPress={handleAppleSignIn}
              disabled={loading !== null}
              loading={loading === 'apple'}
              icon="logo-apple"
              variant="primary"
              color={colors.black}
              size="lg"
            />
          )}

          <Button
            title="Continue with Google"
            onPress={handleGoogleSignIn}
            disabled={loading !== null}
            loading={loading === 'google'}
            icon="logo-google"
            variant="white"
            size="lg"
          />
        </Animated.View>
        
        {/* Footer */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
          style={styles.footer}
        >
          <Typography variant="bodyXS" color={colors.black + '66'} align="center">
            By continuing, you agree to our Terms & Privacy Policy
          </Typography>
          <View style={styles.footerIcons}>
            <IconContainer name="heart" size={28} iconSize={20} color={colors.pink} backgroundColor="transparent" borderWidth={0} shadow={false} />
            <IconContainer name="happy" size={28} iconSize={20} color={colors.black} backgroundColor={colors.yellow} borderWidth={0} shadow={false} />
            <IconContainer name="leaf" size={28} iconSize={20} color={colors.blue} backgroundColor="transparent" borderWidth={0} shadow={false} />
          </View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

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
  welcomeCard: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  welcomeIcon: {
    marginBottom: spacing.md,
  },
  authButtons: {
    gap: spacing.md,
  },
  footer: {
    marginTop: spacing['3xl'],
    alignItems: 'center',
  },
  footerIcons: {
    flexDirection: 'row',
    marginTop: spacing.md,
    gap: spacing.md,
  },
});