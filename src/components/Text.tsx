import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

type TextVariant = 
  | 'hero' 
  | 'title' 
  | 'subtitle' 
  | 'body' 
  | 'bodySmall'
  | 'label' 
  | 'caption'
  | 'display';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'regular' | 'medium' | 'bold';
  italic?: boolean;
}

export const Text: React.FC<TextProps> = ({ 
  variant = 'body', 
  color,
  align = 'left',
  weight,
  italic,
  style, 
  children, 
  ...props 
}) => {
  const getFontFamily = () => {
    if (variant === 'hero' || variant === 'display') {
      return italic ? theme.typography.fonts.displayItalic : theme.typography.fonts.display;
    }
    
    if (weight === 'bold') return theme.typography.fonts.bold;
    if (weight === 'medium') return theme.typography.fonts.medium;
    return theme.typography.fonts.body;
  };

  const textColor = color || theme.colors.text.primary;

  return (
    <RNText 
      style={[
        styles.base,
        styles[variant],
        { 
          color: textColor, 
          textAlign: align,
          fontFamily: getFontFamily(),
        },
        style
      ]} 
      {...props}
    >
      {children}
    </RNText>
  );
};

const styles = StyleSheet.create({
  base: {
    fontFamily: theme.typography.fonts.body,
  },
  display: {
    fontSize: 34,
    lineHeight: 42,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  hero: {
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: theme.typography.letterSpacing.tight,
  },
  title: {
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: theme.typography.letterSpacing.tight,
    fontFamily: theme.typography.fonts.bold,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 26,
    fontFamily: theme.typography.fonts.medium,
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: theme.typography.fonts.medium,
  },
  caption: {
    fontSize: 12,
    color: theme.colors.text.secondary,
  }
});
