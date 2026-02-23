import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TextInputProps, 
  ViewStyle,
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import { theme } from '../theme/theme';
import { Text } from './Text';

export interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  onFocus,
  onBlur,
  value,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnim = useSharedValue(0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnim.value = withSpring(1);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnim.value = withSpring(0);
    if (onBlur) onBlur(e);
  };

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      borderColor: interpolateColor(
        focusAnim.value,
        [0, 1],
        [
          error ? theme.colors.error : theme.colors.border,
          error ? theme.colors.error : theme.colors.primary
        ]
      ),
      backgroundColor: withTiming(isFocused ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'),
      transform: [{ scale: withSpring(isFocused ? 1.01 : 1) }]
    };
  });

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <Text 
        variant="label" 
        style={[
          styles.label, 
          { color: error ? theme.colors.error : isFocused ? theme.colors.primary : theme.colors.text.secondary }
        ]}
      >
        {label}
      </Text>
      
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        
        <TextInput
          style={[styles.input, { color: theme.colors.text.primary }]}
          placeholderTextColor={theme.colors.text.tertiary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          value={value}
          {...props}
        />
        
        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </Animated.View>
      
      {error && (
        <Text variant="caption" style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    fontSize: 12,
    textTransform: 'uppercase',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: theme.radii.lg,
    borderWidth: 1.5,
    paddingHorizontal: theme.spacing.md,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: theme.typography.fonts.body,
    fontSize: 16,
    paddingVertical: 0,
  },
  iconLeft: {
    marginRight: theme.spacing.sm,
  },
  iconRight: {
    marginLeft: theme.spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
    marginLeft: theme.spacing.xs,
    textTransform: 'none',
    letterSpacing: 0,
  },
});
