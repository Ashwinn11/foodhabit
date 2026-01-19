import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
  Pressable,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useAuth } from '../hooks/useAuth';
import { colors, spacing } from '../theme/theme';
import { useUIStore } from '../store/useUIStore';
import { GutAvatar, ScreenWrapper, IconContainer, Typography, Button } from '../components';

const { width, height } = Dimensions.get('window');

const FeatureItem = ({ icon, text, color, delay }: { icon: string, text: string, color: string, delay: number }) => (
  <Animated.View 
    entering={FadeInDown.delay(delay).springify()}
    style={styles.featureItem}
  >
    <View style={[styles.featureIcon, { backgroundColor: color + '20' }]}>
      <IconContainer 
        name={icon as any} 
        size={32} 
        iconSize={18} 
        color={color} 
        backgroundColor="transparent" 
        borderWidth={0} 
        shadow={false} 
      />
    </View>
    <Typography variant="body" style={{ fontSize: 13, fontWeight: '500' }}>{text}</Typography>
  </Animated.View>
);

const FloatingShape = ({ color, size, top, left, delay }: { color: string, size: number, top: number, left: number, delay: number }) => {
  const offset = useSharedValue(0);
  
  React.useEffect(() => {
    offset.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 2500 + delay % 1000 }),
        withTiming(0, { duration: 2500 + delay % 1000 })
      ),
      -1,
      true
    );
  }, [offset, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return (
    <Animated.View 
      style={[
        styles.floatingShape, 
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color + '15', top, left },
        animatedStyle
      ]}
    />
  );
};

export default function AuthScreen() {
  const navigation = useNavigation<any>();
  const { signInWithApple, signInWithGoogle, isAppleAuthAvailable } = useAuth();
  const { showAlert } = useUIStore();
  const [loading, setLoading] = useState<'apple' | 'google' | null>(null);
  const [appleAvailable, setAppleAvailable] = useState(false);
  
  const avatarScale = useSharedValue(1);
  
  React.useEffect(() => {
    checkAppleAuth();
    // Subtle breathing animation
    avatarScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
      ),
      -1,
      true
    );
  }, [avatarScale]);

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
    transform: [{ scale: avatarScale.value }],
  }));

  return (
    <ScreenWrapper style={styles.container} useGradient={true}>
      {/* Background Decorations */}
      <View style={StyleSheet.absoluteFill}>
        <FloatingShape color={colors.blue} size={120} top={-20} left={-40} delay={0} />
        <FloatingShape color={colors.pink} size={80} top={height * 0.2} left={width - 40} delay={1000} />
        <FloatingShape color={colors.yellow} size={60} top={height * 0.6} left={-20} delay={2000} />
      </View>
      
      <View style={styles.content}>
        {/* Header Section */}
        <Animated.View 
          entering={FadeIn.duration(1000)}
          style={styles.header}
        >
          <Animated.View style={[avatarStyle, styles.avatarContainer]}>
            <GutAvatar score={100} size={160} showBadge badgeIcon="thumbs-up" badgeText="Very Happy!" ringColor={colors.blue + '40'} />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(300).springify()}>
            <Typography variant="h1" align="center" style={styles.title}>Gut Buddy</Typography>
            <Typography variant="body" align="center" color={colors.black + '99'} style={styles.subtitle}>
              Your journey to a happier gut starts here.
            </Typography>
          </Animated.View>
        </Animated.View>
        
        {/* Features Section */}
        <View style={styles.featuresRow}>
          <FeatureItem icon="restaurant" text="Track Meals" color={colors.blue} delay={500} />
          <FeatureItem icon="stats-chart" text="Deep Insights" color={colors.pink} delay={600} />
          <FeatureItem icon="leaf" text="Eat Better" color={colors.yellow} delay={700} />
        </View>

        {/* Auth Buttons */}
        <Animated.View 
          entering={FadeInDown.delay(800).springify()}
          style={styles.authContainer}
        >
          <Typography variant="bodyXS" color={colors.black + '66'} align="center" style={{ marginBottom: spacing.md }}>
            Secure sign in with your favorite account
          </Typography>
          
          <View style={styles.buttonWrapper}>
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
                style={styles.authButton}
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
              style={styles.authButton}
            />
          </View>
        </Animated.View>
        
        {/* Footer */}
        <Animated.View 
          entering={FadeIn.delay(1200)}
          style={styles.footer}
        >
          <Pressable onPress={() => navigation.navigate('PrivacyPolicy')}>
            <Typography variant="bodyXS" color={colors.black + '66'} align="center">
              By joining, you agree to our <Typography variant="bodyXS" color={colors.pink} style={{ fontWeight: 'bold' }}>Terms & Privacy Policy</Typography>
            </Typography>
          </Pressable>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: height * 0.08,
    paddingBottom: spacing['4xl'],
  },
  header: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: spacing.xl,
    zIndex: 10,
  },
  title: {
    fontSize: 48,
    lineHeight: 52,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    maxWidth: 280,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: spacing['2xl'],
    paddingHorizontal: spacing.sm,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authContainer: {
    width: '100%',
  },
  buttonWrapper: {
    gap: spacing.md,
  },
  authButton: {
    height: 56,
    borderRadius: 16,
  },
  footer: {
    alignItems: 'center',
  },
  floatingShape: {
    position: 'absolute',
    zIndex: 0,
  },
});