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
import { Icon } from '../../components/Icon';
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
      {title && <Text variant="h1">{title}</Text>}
      {subtitle && (
        <Text variant="body" color={theme.colors.textSecondary} style={styles.subtitleText}>
          {subtitle}
        </Text>
      )}
      {icon && <Icon3D name={icon} size={56} animated animationType="float" style={styles.icon} />}
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
  subtitleText: {
    lineHeight: 24,
  },
  icon: {
    alignSelf: 'center',
    marginVertical: theme.spacing.sm,
  },
  staticBody: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  scrollBody: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
    gap: theme.spacing.sm,
  },
});
