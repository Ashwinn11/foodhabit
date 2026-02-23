import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { theme } from '../theme/theme';
import { LucideIconName } from './Icon';
import { IconContainer } from './IconContainer';
import { Text } from './Text';

interface FunLoaderProps {
  icon: LucideIconName;
  iconSize?: number;
  message: string;
  overlay?: boolean;
  style?: ViewStyle;
}

const AnimatedDot: React.FC<{ delay: number }> = ({ delay }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: delay }),
        withTiming(1, { duration: 300, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 300, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return <Animated.View style={[styles.dot, animStyle]} />;
};

export const FunLoader: React.FC<FunLoaderProps> = ({
  icon,
  iconSize = 64,
  message,
  overlay = false,
  style,
}) => {
  const content = (
    <View style={[styles.content, style]}>
      <IconContainer name={icon} size={iconSize} iconSize={iconSize / 2} variant="solid" />
      <Text
        variant="body"
        color={theme.colors.textSecondary}
        align="center"
        style={styles.message}
      >
        {message}
      </Text>
      <View style={styles.dots}>
        <AnimatedDot delay={0} />
        <AnimatedDot delay={200} />
        <AnimatedDot delay={400} />
      </View>
    </View>
  );

  if (overlay) {
    return (
      <View style={styles.overlay}>
        {content}
      </View>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  message: {
    maxWidth: 240,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.colors.primary,
  },
});
