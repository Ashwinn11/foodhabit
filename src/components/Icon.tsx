import React from 'react';
import * as LucideIcons from 'lucide-react-native';
import { theme } from '../theme/theme';

// Export commonly needed icon types
export type { LucideIcon } from 'lucide-react-native';

export type LucideIconName = keyof typeof LucideIcons;

interface IconProps {
  name: LucideIconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = theme.colors.text,
  strokeWidth = 1.5,
}) => {
  const LucideIcon = LucideIcons[name] as React.ComponentType<{
    size?: number;
    color?: string;
    strokeWidth?: number;
  }>;

  if (!LucideIcon) {
    return null;
  }

  return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
};
