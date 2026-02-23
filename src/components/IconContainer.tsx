import React from 'react';
import { View, ViewStyle } from 'react-native';
import { theme } from '../theme/theme';
import { Icon, LucideIconName } from './Icon';

interface IconContainerProps {
  name: LucideIconName;
  color?: string;
  size?: number;
  iconSize?: number;
  variant?: 'muted' | 'solid';
  style?: ViewStyle;
}

export const IconContainer: React.FC<IconContainerProps> = ({
  name,
  color = theme.colors.primary,
  size = 48,
  iconSize = 24,
  variant = 'muted',
  style,
}) => {
  const isMuted = variant === 'muted';
  
  const containerStyle: ViewStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: isMuted ? `${color}15` : color,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: isMuted ? 1 : 0,
    borderColor: isMuted ? `${color}30` : 'transparent',
  };

  return (
    <View style={[containerStyle, style]}>
      <Icon 
        name={name} 
        size={iconSize} 
        color={isMuted ? color : theme.colors.primaryForeground} 
        strokeWidth={2.5}
      />
    </View>
  );
};
