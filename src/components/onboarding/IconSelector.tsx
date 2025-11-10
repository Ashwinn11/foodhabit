import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme, haptics } from '../../theme';
import { Text } from '../Text';

interface IconOption {
  id: string;
  label: string;
  icon: string; // Ionicons name
}

interface IconSelectorProps {
  options: IconOption[];
  selected: string | null;
  onSelect: (id: string) => void;
  layout?: 'row' | 'column'; // Default: row for 3-4 items, column for 2 items
  containerStyle?: ViewStyle;
}

/**
 * Icon Selector Component
 * Reusable component for selecting options with icons and labels
 * Used for: gender, activity level, diet type, focus area, etc.
 *
 * Styling:
 * - Active: #ff7664 container with white icon/text
 * - Inactive: #dedfe2 container with black icon/text
 */
export const IconSelector: React.FC<IconSelectorProps> = ({
  options,
  selected,
  onSelect,
  layout = 'row',
  containerStyle,
}) => {
  // Determine layout based on number of options
  const isColumn = layout === 'column' || options.length === 2;
  const isRow = layout === 'row' || (options.length === 3 || options.length === 4);

  // Dynamic flex basis based on item count for optimal wrapping
  const getFlexBasis = () => {
    if (isColumn) return '100%';
    if (options.length === 4) return '22%'; // 4 items in 1 row
    if (options.length === 5) return '30%'; // 5 items in 2 rows (3+2)
    if (options.length >= 6) return '30%'; // 6+ items in multiple rows (3 per row)
    return '30%'; // Default for 2-3 items
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    haptics.light();
  };

  return (
    <View
      style={[
        styles.container,
        isColumn && styles.columnLayout,
        isRow && styles.rowLayout,
        containerStyle,
      ]}
    >
      {options.map((option) => (
        <IconOptionButton
          key={option.id}
          option={option}
          isSelected={selected === option.id}
          onPress={() => handleSelect(option.id)}
          isColumn={isColumn}
          flexBasis={getFlexBasis()}
        />
      ))}
    </View>
  );
};

interface IconOptionButtonProps {
  option: IconOption;
  isSelected: boolean;
  onPress: () => void;
  isColumn: boolean;
  flexBasis: string;
}

/**
 * Individual icon option button
 */
const IconOptionButton: React.FC<IconOptionButtonProps> = ({
  option,
  isSelected,
  onPress,
  isColumn,
  flexBasis,
}) => {
  const scaleAnim = useRef(new Animated.Value(isSelected ? 1.05 : 0.95)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isSelected ? 1.05 : 0.95,
      tension: 20,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isSelected, scaleAnim]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.optionButton,
        isColumn ? styles.columnOption : { flexBasis, flexGrow: 0, flexShrink: 0 },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Animated.View
          style={[
            styles.optionContainer,
            {
              backgroundColor: isSelected
                ? theme.colors.brand.white
                : 'rgba(255, 255, 255, 0.25)',
            },
          ]}
        >
          {/* Ionicon */}
          <Ionicons
            name={option.icon as any}
            size={32}
            color={isSelected ? theme.colors.brand.primary : theme.colors.brand.white}
          />
        </Animated.View>

        {/* Label */}
        <Text
          variant="label"
          style={{
            ...styles.label,
            color: theme.colors.brand.white,
          }}
          numberOfLines={2}
          align="center"
        >
          {option.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.md,
  },
  rowLayout: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: theme.spacing.md,
  },
  columnLayout: {
    flexDirection: 'column',
  },
  optionButton: {
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  rowOption: {
    flexBasis: '30%', // ~3 items per row with gap
    flexGrow: 0,
    flexShrink: 0,
  },
  columnOption: {
    width: '100%',
  },
  optionContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  icon: {
    fontSize: 36,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    maxWidth: 100,
  },
});
