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
        {icon && (
          <View style={styles.iconWrapper}>
            <View style={styles.iconGlow} />
            <Icon3D name={icon} size={140} animated={false} style={styles.icon} />
          </View>
        )}
        <View style={styles.textBlock}>
          {titleIcon && (
            <View style={[styles.titleBadge, { backgroundColor: `${titleIconColor ?? theme.colors.primary}15` }]}>
              <Icon name={titleIcon} color={titleIconColor ?? theme.colors.primary} size={22} />
            </View>
          )}
          {title && (
            <Text variant="h1" style={styles.titleText}>
              {title}
            </Text>
          )}
          {subtitle && (
            <Text variant="body" color={theme.colors.textSecondary} style={styles.subtitleText}>
              {subtitle}
            </Text>
          )}
        </View>
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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  scrollBody: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xxxl,
    gap: theme.spacing.xl,
  },
  headerBlock: {
    alignItems: 'center',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xs,
    minHeight: 140, // Match the Icon3D size to keep layout stable
  },
  iconGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    opacity: 0.15,
    transform: [{ scale: 1.5 }],
  },
  icon: {
    zIndex: 2,
  },
  textBlock: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  titleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.xs,
  },
  titleText: {
    textAlign: 'center',
  },
  subtitleText: {
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.md,
  },
});
