import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../theme/theme';
import { Text } from './Text';
import { Icon } from './Icon';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secure?: boolean;
  multiline?: boolean;
  maxLength?: number;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  autoFocus?: boolean;
  editable?: boolean;
  returnKeyType?: TextInput['props']['returnKeyType'];
  onSubmitEditing?: () => void;
  autoCapitalize?: TextInput['props']['autoCapitalize'];
  keyboardType?: TextInput['props']['keyboardType'];
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  leftIcon,
  rightIcon,
  secure = false,
  multiline = false,
  maxLength,
  style,
  inputStyle,
  autoFocus = false,
  editable = true,
  returnKeyType,
  onSubmitEditing,
  autoCapitalize = 'sentences',
  keyboardType,
}) => {
  const [focused, setFocused] = useState(false);
  const [secureVisible, setSecureVisible] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
    ? theme.colors.primary
    : theme.colors.border;

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text variant="label" color={theme.colors.textSecondary} style={styles.label}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.inputContainer,
          { borderColor },
          error ? styles.errorContainer : {},
        ]}
      >
        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
        <TextInput
          style={[
            styles.input,
            leftIcon ? styles.inputWithLeftIcon : {},
            rightIcon || secure ? styles.inputWithRightIcon : {},
            multiline ? styles.multiline : {},
            inputStyle,
          ]}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secure && !secureVisible}
          multiline={multiline}
          maxLength={maxLength}
          autoFocus={autoFocus}
          editable={editable}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={theme.colors.primary}
          cursorColor={theme.colors.primary}
        />
        {secure && (
          <TouchableOpacity
            style={styles.iconRight}
            onPress={() => setSecureVisible(!secureVisible)}
          >
            <Icon
              name={secureVisible ? 'EyeOff' : 'Eye'}
              size={18}
              color={theme.colors.textTertiary}
            />
          </TouchableOpacity>
        )}
        {!secure && rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>
      {error && (
        <Text variant="caption" color={theme.colors.danger} style={styles.errorText}>
          {error}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  label: {
    marginBottom: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 50,
  },
  focusedContainer: {
    ...theme.shadows.soft,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.1,
  },
  errorContainer: {
    borderColor: theme.colors.danger,
  },
  input: {
    flex: 1,
    fontFamily: theme.fonts.regular,
    fontSize: 16,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm + 2,
  },
  inputWithLeftIcon: {
    paddingLeft: theme.spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: theme.spacing.sm,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm + 2,
  },
  iconLeft: {
    paddingLeft: theme.spacing.md,
  },
  iconRight: {
    paddingRight: theme.spacing.md,
  },
  errorText: {
    marginTop: 2,
  },
});
