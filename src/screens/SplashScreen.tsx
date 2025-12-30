import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../components';
import { theme } from '../theme';
import { BackgroundBlobs } from '../components/BackgroundBlobs';

export interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotate, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after animation
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    }, 1500); // Show splash for 1 second

    return () => clearTimeout(timer);
  }, []);

  const rotation = logoRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={[theme.colors.brand.backgroundGradientStart, theme.colors.brand.backgroundGradientEnd]}
      style={styles.container}
    >
      <BackgroundBlobs />
      
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Logo/Icon Circle */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }, { rotate: rotation }],
            },
          ]}
        >
          <Image 
            source={require('../../assets/background.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* App Name */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <Text variant="largeTitle" weight="bold" style={styles.appName}>
            GutScan
          </Text>
          <Text variant="body" style={styles.tagline}>
            Your Gut Health Companion
          </Text>
        </Animated.View>
      </Animated.View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: theme.spacing['xs'],
  },
  logoImage: {
    width: 250,
    height: 250,
  },
  appName: {
    color: theme.colors.brand.cream,
    fontSize: 48,
    lineHeight: 56,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    letterSpacing: 1,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  tagline: {
    color: theme.colors.brand.cream,
    opacity: 0.8,
    textAlign: 'center',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
