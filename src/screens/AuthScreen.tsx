import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation<any>();
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
            <GutAvatar score={100} size={120} showBadge badgeIcon="hand-right" />
          </Animated.View>
          
          <Typography variant="h1" style={{ marginTop: spacing.xl }}>Gut Buddy</Typography>
          <Typography variant="body" align="center" color={colors.black + '99'}>
            Your friendly gut health companion
          </Typography>
        </Animated.View>
        
        {/* Welcome Card */}
        <Animated.View 
          entering={FadeInDown.delay(400).springify()}
        >
          <Card
            variant="white"
            style={styles.welcomeCard}
            padding="xl"
          >
            <GutAvatar 
              score={100} 
              size={48}
              showBadge={false}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <Typography variant="h3">Let's track your poops!</Typography>
              <IconContainer name="water" size={24} iconSize={16} color={colors.pink} backgroundColor="transparent" borderWidth={0} shadow={false} />
            </View>
            <Typography variant="body" align="center" color={colors.black + '99'}>
              Keep tabs on your gut health and feel amazing
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
          <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Typography variant="bodyXS" color={colors.black + '66'} align="center">
              By continuing, you agree to our <Typography variant="bodyXS" color={colors.pink}>Privacy Policy</Typography>
            </Typography>
          </Pressable>
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