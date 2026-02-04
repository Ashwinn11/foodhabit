import React from 'react';
import { 
  Text, 
  Pressable, 
  StyleSheet, 
  ViewStyle, 
  ActivityIndicator,
  StyleProp
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring 
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows, fonts, fontSizes } from '../theme/theme';
import { IconContainer } from './IconContainer/IconContainer';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: ButtonVariant;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  size?: 'sm' | 'md' | 'lg';
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Button: React.FC<ButtonProps> = ({ 
  onPress, 
  title, 
  variant = 'primary', 
  color = colors.pink,
  icon,
  loading = false,
  disabled = false,
  style,
  size = 'md'
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return {
          container: { backgroundColor: color + '20', borderWidth: 0 },
          text: { color: color }
        };
      case 'outline':
        return {
          container: { backgroundColor: 'transparent', borderColor: color, borderWidth: 2 },
          text: { color: color }
        };
      case 'ghost':
        return {
          container: { backgroundColor: 'transparent', borderWidth: 0, shadowOpacity: 0 },
          text: { color: color }
        };
      case 'primary':
      default:
        return {
          container: { backgroundColor: color, borderWidth: 0 },
          text: { color: color === colors.yellow ? colors.black : colors.white }
        };
    }
  };

  const vStyles = getVariantStyles();
  const opacityStyle = (disabled || loading) ? { opacity: 0.6 } : {};

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.base,
        vStyles.container,
        size === 'sm' && styles.sizeSm,
        size === 'lg' && styles.sizeLg,
        variant !== 'ghost' && shadows.sm,
        animatedStyle,
        opacityStyle,
        style
      ]}
    >
      {loading ? (
        <ActivityIndicator color={vStyles.text.color} />
      ) : (
        <>
          {icon && (
            <IconContainer 
              name={icon} 
              size={size === 'sm' ? 24 : 32} 
              iconSize={size === 'sm' ? 16 : 20} 
              color={vStyles.text.color}
              backgroundColor="transparent"
              borderWidth={0}
              shadow={false}
              style={{ marginRight: spacing.sm }}
            />
          )}
          <Text style={[
            styles.text, 
            vStyles.text,
            size === 'sm' && styles.textSm,
            size === 'lg' && styles.textLg,
          ]}>
            {title}
          </Text>
        </>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.xl,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  sizeLg: {
    borderRadius: radii['2xl'],
    paddingHorizontal: spacing['2xl'],
    paddingVertical: spacing.lg,
  },
  sizeSm: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.md,
  },
  textLg: {
    fontSize: fontSizes.lg,
  },
  textSm: {
    fontSize: fontSizes.sm,
  },
});
