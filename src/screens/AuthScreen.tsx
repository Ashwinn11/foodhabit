import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Platform,
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
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const FeatureItem = ({ icon, text, color, delay }: { icon: string, text: string, color: string, delay: number }) => (
  <Animated.View 
    entering={FadeInDown.delay(delay).springify()}
    style={styles.featureItem}
  >
    <IconContainer 
      name={icon as any} 
      size={56} 
      iconSize={24} 
      color={color} 
      variant="solid"
      shape="rounded"
    />
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
  const avatarRotation = useSharedValue(0);
  
  React.useEffect(() => {
    checkAppleAuth();
    
    avatarScale.value = withRepeat(
      withSequence(withTiming(1.05, { duration: 2000 }), withTiming(1, { duration: 2000 })),
      -1,
      true
    );

    avatarRotation.value = withRepeat(
      withSequence(withTiming(3, { duration: 1500 }), withTiming(-3, { duration: 1500 })),
      -1,
      true
    );
  }, [avatarScale, avatarRotation]);

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
    transform: [
      { scale: avatarScale.value },
      { rotate: `${avatarRotation.value}deg` }
    ],
  }));

  return (
    <ScreenWrapper style={styles.container} useGradient={true}>
      <View style={StyleSheet.absoluteFill}>
        <FloatingShape color={colors.blue} size={150} top={-30} left={-50} delay={0} />
        <FloatingShape color={colors.pink} size={120} top={height * 0.15} left={width - 60} delay={800} />
        <FloatingShape color={colors.yellow} size={90} top={height * 0.55} left={-30} delay={1500} />
        <FloatingShape color={colors.blue} size={100} top={height * 0.8} left={width * 0.7} delay={2200} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Animated.View entering={FadeIn.duration(1000)} style={styles.header}>
            <Animated.View style={[avatarStyle, styles.avatarContainer]}>
              <GutAvatar 
                score={100} 
                size={width * 0.45} 
                showBadge 
                badgeIcon="heart" 
                badgeText="Feel light again" 
                ringColor={colors.blue + '30'} 
              />
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(300).springify()}>
              <Typography variant="h1" align="center" style={styles.title}>GutBuddy</Typography>
              <Typography variant="body" align="center" color={colors.black + '99'} style={styles.subtitle}>
                Transform your gut. Transform your life. Join <Typography variant="bodyBold" color={colors.pink}>50,000+</Typography> others.
              </Typography>
            </Animated.View>
          </Animated.View>

          <View style={styles.featuresRow}>
            <FeatureItem icon="flash" text="Beat Bloat" color={colors.pink} delay={500} />
            <FeatureItem icon="analytics" text="Find Triggers" color={colors.blue} delay={600} />
            <FeatureItem icon="sunny" text="Glow Daily" color={colors.green} delay={700} />
          </View>
        </View>

        <Animated.View 
          entering={FadeInDown.delay(800).springify()}
          style={styles.authSection}
        >
          <View style={styles.trustBadge}>
             <View style={styles.stars}>
                {[1,2,3,4,5].map(i => <Ionicons key={i} name="star" size={14} color={colors.yellow} />)}
             </View>
             <Typography variant="bodyXS" color={colors.mediumGray} style={{ marginLeft: 8 }}>
                The #1 Personalized Gut Protocol
             </Typography>
          </View>

          <View style={styles.authCard}>
            <Typography variant="bodyXS" color={colors.black + '66'} align="center" style={{ marginBottom: spacing.lg }}>
              Your 90-day reset starts with a secure account
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
          </View>

          <Animated.View entering={FadeIn.delay(1200)} style={styles.footer}>
            <Typography variant="bodyXS" color={colors.black + '40'} align="center">
              By joining, you agree to our{' '}
              <Typography 
                variant="bodyXS" 
                color={colors.black + '80'} 
                style={{ fontWeight: '600', textDecorationLine: 'underline' }}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                Terms
              </Typography>
              {' & '}
              <Typography 
                variant="bodyXS" 
                color={colors.black + '80'} 
                style={{ fontWeight: '600', textDecorationLine: 'underline' }}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                Privacy Policy
              </Typography>
            </Typography>
          </Animated.View>
        </Animated.View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  authButton: {
    borderRadius: 18,
    height: 60,
  },
  authCard: {
    backgroundColor: colors.white,
    borderColor: colors.border + '20',
    borderRadius: 32,
    borderWidth: 1,
    elevation: 8,
    padding: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    width: '100%',
  },
  authSection: {
    alignItems: 'center',
    width: '100%',
  },
  avatarContainer: {
    marginBottom: spacing.lg,
    shadowColor: colors.pink,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    zIndex: 10,
  },
  buttonWrapper: {
    gap: spacing.md,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: spacing['2xl'],
    paddingHorizontal: spacing.xl,
    paddingTop: height * 0.04,
  },
  featureItem: {
    alignItems: 'center',
    gap: 6,
  },
  featuresRow: {
    backgroundColor: colors.white + '40',
    borderColor: colors.white + '60',
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: spacing.lg,
    padding: spacing.md,
    width: '100%',
  },
  floatingShape: {
    position: 'absolute',
    zIndex: 0,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.lg,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  headerSection: {
    alignItems: 'center',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
    maxWidth: 300,
  },
  title: {
    color: colors.black,
    fontSize: 52,
    lineHeight: 56,
    marginBottom: spacing.xs,
  },
  trustBadge: {
    alignItems: 'center',
    backgroundColor: colors.white + '80',
    borderColor: colors.border + '40',
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: 'row',
    marginBottom: spacing.lg,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
});