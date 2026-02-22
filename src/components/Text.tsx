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
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 44,
    letterSpacing: -0.5,
    lineHeight: 52,
  },
  title: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    letterSpacing: -0.3,
    lineHeight: 34,
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
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: theme.colors.textSecondary,
  }
});
