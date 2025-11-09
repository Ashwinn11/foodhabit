import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Animated floating orb for background
 */
const AnimatedOrb: React.FC<{
  delay?: number;
  size?: number;
  initialX?: number;
  initialY?: number;
  duration?: number;
}> = ({
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
    // Fade in animation
    Animated.timing(opacity, {
      toValue: 0.4,
      duration: 1500,
      delay,
      useNativeDriver: true,
    }).start();

    // Floating animation
    const animate = () => {
      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(translateX, {
              toValue: Math.random() * 40 - 20,
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
              toValue: Math.random() * 40 - 20,
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
      pointerEvents="none"
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

/**
 * Decorative pattern with gradient overlays
 * Matches AuthScreen design
 */
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

interface GradientBackgroundProps {
  children?: React.ReactNode;
  animateBlobs?: boolean;
}

/**
 * Gradient Background Component
 * Provides consistent gradient background with blobs and overlays for onboarding screens
 * Reuses AuthScreen design pattern
 */
export const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  animateBlobs = true,
}) => {
  return (
    <View style={styles.container}>
      {/* Main gradient background */}
      <LinearGradient
        colors={[
          `${theme.colors.brand.primary}B3`, // 70% opacity
          `${theme.colors.brand.primary}D9`, // 85% opacity
          theme.colors.brand.primary, // 100% opacity
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative pattern with overlays */}
      <DecorativePattern />

      {/* Animated orbs */}
      {animateBlobs && (
        <>
          <AnimatedOrb delay={0} size={250} initialX={-50} initialY={-100} duration={15000} />
          <AnimatedOrb
            delay={800}
            size={200}
            initialX={SCREEN_WIDTH - 150}
            initialY={SCREEN_HEIGHT / 2}
            duration={18000}
          />
          <AnimatedOrb
            delay={1500}
            size={180}
            initialX={SCREEN_WIDTH / 2}
            initialY={SCREEN_HEIGHT - 200}
            duration={16000}
          />
        </>
      )}

      {/* Content */}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.primary,
  },
  orb: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
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
