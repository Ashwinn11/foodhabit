import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

type TextVariant = 'hero' | 'title' | 'body' | 'label' | 'caption';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const Text: React.FC<TextProps> = ({ 
  variant = 'body', 
  color = theme.colors.textPrimary,
  align = 'left',
  style, 
  children, 
  ...props 
}) => {
  return (
    <RNText 
      style={[
        styles.base,
        styles[variant],
        { color, textAlign: align },
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
    fontFamily: 'Inter_400Regular',
  },
  hero: {
    fontFamily: 'Inter_700Bold',
    fontSize: 32,
    letterSpacing: -0.5,
  },
  title: {
    fontFamily: 'Inter_700Bold',
    fontSize: 24,
    letterSpacing: -0.3,
  },
  body: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  label: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
  },
  caption: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: theme.colors.textSecondary,
  }
});
