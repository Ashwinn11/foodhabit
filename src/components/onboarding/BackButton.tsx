import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme';

interface BackButtonProps {
  onPress: () => void;
}

/**
 * Back Button Component
 * Navigates to previous screen in onboarding flow
 * Positioned top-left, matches progress dots styling
 */
export const BackButton: React.FC<BackButtonProps> = ({ onPress }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.button}
      activeOpacity={0.6}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Ionicons
        name="chevron-back"
        size={28}
        color={theme.colors.brand.white}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: theme.spacing.md,
    left: theme.spacing.lg,
    zIndex: 20,
  },
});
