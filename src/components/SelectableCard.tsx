import React from 'react';
import { Pressable, View, StyleSheet, PressableProps } from 'react-native';
import { theme } from '../theme';
import { Text } from './Text';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

interface SelectableCardProps extends PressableProps {
  label: string;
  selected?: boolean;
  icon?: React.ReactNode;
  subtitle?: string;
}

export const SelectableCard: React.FC<SelectableCardProps> = ({
  label,
  selected = false,
  icon,
  subtitle,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        selected && styles.selectedContainer,
        style as any
      ]}
      {...props}
    >
      <Animated.View style={[styles.content, animatedStyle]}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <View style={styles.textContainer}>
          <Text 
            variant="body" 
            style={[
              styles.label, 
              selected && styles.selectedLabel
            ]}
          >
            {label}
          </Text>
          {subtitle && (
            <Text 
              variant="caption1" 
              style={[
                styles.subtitle, 
                selected && styles.selectedSubtitle
              ]}
            >
              {subtitle}
            </Text>
          )}
        </View>
        <View style={[styles.checkbox, selected && styles.selectedCheckbox]}>
          {selected && <View style={styles.checkboxInner} />}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)', // Glassy dark mode bg
    borderRadius: 16,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  selectedContainer: {
    borderColor: theme.colors.brand.coral,
    backgroundColor: 'rgba(255, 118, 100, 0.1)', // Subtle coral tint
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconContainer: {
    marginRight: theme.spacing.md,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    color: theme.colors.text.white,
    fontFamily: theme.fontFamily.semiBold,
  },
  selectedLabel: {
    color: theme.colors.brand.coral,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  selectedSubtitle: {
    color: theme.colors.text.white,
    opacity: 0.8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.sm,
  },
  selectedCheckbox: {
    borderColor: theme.colors.brand.coral,
    backgroundColor: theme.colors.brand.coral,
  },
  checkboxInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.text.white,
  },
});
