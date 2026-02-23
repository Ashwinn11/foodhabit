import React from 'react';
import { View, StyleSheet, ViewProps, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';

export interface CardProps extends ViewProps {
  elevated?: boolean;
  glow?: boolean;
  variant?: 'default' | 'glass' | 'outline' | 'surface';
  padding?: keyof typeof theme.spacing;
}

export const Card: React.FC<CardProps> = ({
  elevated = false,
  glow = false,
  variant = 'default',
  padding = 'lg',
  style,
  children,
  ...props
}) => {
  const getVariantStyles = (): ViewStyle => {
    switch (variant) {
      case 'glass':
        return {
          backgroundColor: theme.colors.glass,
          borderColor: theme.colors.glassBorder,
          borderWidth: 1,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: theme.colors.border,
          borderWidth: 1,
        };
      case 'surface':
        return {
          backgroundColor: theme.colors.surfaceElevated,
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.borderLight,
          borderWidth: 1,
        };
    }
  };

  return (
    <View
      style={[
        styles.card,
        { padding: theme.spacing[padding] },
        getVariantStyles(),
        elevated && theme.shadows.medium,
        glow && theme.shadows.glowSmall,
        style,
      ]}
      {...props}
    >
      {variant === 'glass' && (
        <LinearGradient
          colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.01)']}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radii.xl,
    overflow: 'hidden',
  },
});
