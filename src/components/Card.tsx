import React from 'react';
import { View, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { colors, radii, spacing, shadows } from '../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'white' | 'colored' | 'outline';
  color?: string;
  padding?: keyof typeof spacing;
  shadow?: keyof typeof shadows;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  style, 
  variant = 'white', 
  color = colors.blue,
  padding = 'lg',
  shadow = 'sm'
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'colored':
        return { 
          backgroundColor: color + '15', 
          borderColor: color,
          borderWidth: 1.5 
        };
      case 'outline':
        return { 
          backgroundColor: 'transparent', 
          borderColor: color,
          borderWidth: 1.5 
        };
      case 'white':
      default:
        return { 
          backgroundColor: colors.white,
          borderColor: colors.border,
          borderWidth: 1.5 
        };
    }
  };

  return (
    <View 
      style={[
        styles.base,
        getVariantStyle(),
        shadow && shadows[shadow],
        { padding: spacing[padding] },
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radii['2xl'],
  },
});
