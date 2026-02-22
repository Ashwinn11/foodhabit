import React from 'react';
import { StyleSheet, ActivityIndicator } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  interpolateColor
} from 'react-native-reanimated';
import { theme } from '../theme/theme';
import { Text } from './Text';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
}

const AnimatedTouchable = Animated.createAnimatedComponent(
  React.forwardRef<any, any>((props, ref) => (
    <Animated.View ref={ref} {...props} />
  ))
);

export const Button: React.FC<ButtonProps> = ({ 
  label, 
  onPress, 
  variant = 'primary',
  disabled = false,
  loading = false,
}) => {
  const isPressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isPressed.value ? 0.96 : 1, { damping: 15, stiffness: 200 }) }
      ],
      opacity: disabled ? 0.5 : 1,
    };
  });

  const getBackgroundColor = () => {
    if (variant === 'primary') return theme.colors.coral;
    return 'transparent';
  };

  const getTextColor = () => {
    if (variant === 'primary') return theme.colors.bg; // High contrast text on coral
    return theme.colors.textPrimary;
  };

  const getBorderColor = () => {
    if (variant === 'ghost') return theme.colors.border;
    return 'transparent';
  };

  return (
    <Animated.View
      style={[
        styles.button,
        animatedStyle,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'ghost' ? 1 : 0
        }
      ]}
      onTouchStart={() => {
        if (!disabled && !loading) isPressed.value = 1;
      }}
      onTouchEnd={() => {
        if (!disabled && !loading) {
          isPressed.value = 0;
          onPress();
        }
      }}
      onTouchCancel={() => {
        isPressed.value = 0;
      }}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text 
          variant="label" 
          style={{ color: getTextColor(), textAlign: 'center', fontSize: 16 }}
        >
          {label}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xxxl,
    borderRadius: theme.radii.full,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  }
});
