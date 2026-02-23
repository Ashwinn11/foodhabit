import React from 'react';
import { Text as RNText, TextStyle, TextProps as RNTextProps } from 'react-native';
import { theme } from '../theme/theme';

export type TextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';

interface TextProps extends RNTextProps {
  variant?: TextVariant;
  color?: string;
  align?: TextStyle['textAlign'];
  children?: React.ReactNode;
}

const variantStyles: Record<TextVariant, TextStyle> = {
  display: {
    fontFamily: theme.fonts.display,
    fontSize: 32,
    lineHeight: 40,
    color: theme.colors.text,
  },
  h1: {
    fontFamily: theme.fonts.bold,
    fontSize: 28,
    lineHeight: 36,
    color: theme.colors.text,
  },
  h2: {
    fontFamily: theme.fonts.semibold,
    fontSize: 22,
    lineHeight: 30,
    color: theme.colors.text,
  },
  h3: {
    fontFamily: theme.fonts.semibold,
    fontSize: 18,
    lineHeight: 26,
    color: theme.colors.text,
  },
  body: {
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    color: theme.colors.text,
  },
  bodySmall: {
    fontFamily: theme.fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
  },
  caption: {
    fontFamily: theme.fonts.regular,
    fontSize: 12,
    lineHeight: 18,
    color: theme.colors.text,
  },
  label: {
    fontFamily: theme.fonts.semibold,
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: theme.colors.text,
  },
};

export const Text: React.FC<TextProps> = ({
  variant = 'body',
  color,
  align,
  style,
  children,
  ...props
}) => {
  return (
    <RNText
      style={[
        variantStyles[variant],
        color ? { color } : undefined,
        align ? { textAlign: align } : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
};
