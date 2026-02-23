import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme/theme';
import { ProgressBar } from '../../components/ProgressBar';
import { Icon, LucideIconName } from '../../components/Icon';
import { IconContainer } from '../../components/IconContainer';
import { Text } from '../../components/Text';
import { Icon3D, Icon3DName } from '../../components/Icon3D';

const TOTAL_STEPS = 10;

interface OnboardingLayoutProps {
  step: number;
  children: React.ReactNode;
  showBack?: boolean;
  scroll?: boolean;
  style?: ViewStyle;
  icon?: Icon3DName;
  title?: string;
  titleIcon?: LucideIconName;
  titleIconColor?: string;
  subtitle?: string;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  step,
  children,
  showBack = true,
  scroll = false,
  style,
  icon,
  title,
  titleIcon,
  titleIconColor,
  subtitle,
}) => {
  const navigation = useNavigation();

  const navHeader = (
    <View style={styles.navHeader}>
      <View style={styles.backSlot}>
        {showBack && navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={12}>
            <Icon name="ChevronLeft" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.progressContainer}>
        <ProgressBar step={step} total={TOTAL_STEPS} />
      </View>
      <View style={styles.backSlot} />
    </View>
  );

  const body = (
    <>
        <View style={styles.headerBlock}>
          {title && (
            <View style={styles.titleRow}>
              <Text variant="h1">{title}</Text>
              {titleIcon && (
                <IconContainer 
                  name={titleIcon} 
                  color={titleIconColor ?? theme.colors.primary} 
                  size={32} 
                  iconSize={18}
                  variant="solid" 
                />
              )}
            </View>
          )}
          {subtitle && (
            <Text variant="body" color={theme.colors.textSecondary} style={styles.subtitleText}>
              {subtitle}
            </Text>
          )}
          {icon && (
            <Icon3D name={icon} size={300} animated={false} style={styles.icon} />
          )}
        </View>
      {children}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {navHeader}

        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={[styles.scrollBody, style]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {body}
          </ScrollView>
        ) : (
          <View style={[styles.staticBody, style]}>
            {body}
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  flex: {
    flex: 1,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  backSlot: {
    width: 40,
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  staticBody: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    gap: theme.spacing.lg,
  },
  scrollBody: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.lg,
  },
  headerBlock: {
    gap: theme.spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  subtitleText: {
    lineHeight: 24,
  },
  icon: {
    alignSelf: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
});
