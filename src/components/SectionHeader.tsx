import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle, StyleProp } from 'react-native';
import { Typography } from './Typography';
import { IconContainer } from './IconContainer/IconContainer';
import { colors, spacing, fonts } from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';

interface SectionHeaderProps {
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  onActionPress?: () => void;
  actionLabel?: string;
  rightElement?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  count?: number;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  icon,
  iconColor = colors.pink,
  onActionPress,
  actionLabel = 'View All',
  rightElement,
  style,
  count
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.left}>
        {icon && (
          <IconContainer
            name={icon}
            size={32}
            iconSize={18}
            color={iconColor}
            borderColor={iconColor}
            shape="circle"
            style={{ marginRight: spacing.sm }}
          />
        )}
        <Typography variant="h4">{title}</Typography>
        {count !== undefined && (
          <View style={styles.badge}>
            <Typography variant="bodyXS" color={colors.black + '99'}>
              {count}
            </Typography>
          </View>
        )}
      </View>
      
      {rightElement || (onActionPress && (
        <Pressable onPress={onActionPress}>
          <Typography variant="bodySmall" color={colors.pink} style={styles.actionText}>
            {actionLabel}
          </Typography>
        </Pressable>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  badge: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginLeft: spacing.sm,
  },
  actionText: {
    fontFamily: fonts.bodyBold,
  },
});
