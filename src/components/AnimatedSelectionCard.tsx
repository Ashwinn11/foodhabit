import React from 'react';
import {
  StyleSheet,
  Animated,
  ViewStyle,
  StyleProp,
} from 'react-native';
import { theme } from '../theme';
import { Card } from './Card';

interface AnimatedSelectionCardProps {
  children: React.ReactNode;
  selected: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export const AnimatedSelectionCard: React.FC<AnimatedSelectionCardProps> = ({
  children,
  selected,
  onPress,
  style,
  containerStyle,
  disabled = false,
}) => {
  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <Card
        pressable={!disabled}
        onPress={onPress}
        selected={selected}
        padding="none"
        borderRadius="xl"
        elevation={selected ? 'lg' : 'flat'}
        style={[styles.card, style]}
      >
        {children}
      </Card>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Rely on parent for sizing (width/height/aspectRatio)
    flex: 1,
    width: '100%',
    marginBottom: theme.spacing.sm,
  },
  card: {
    flex: 1, // Fill available space in container
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
