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

const TOTAL_STEPS = 10;

interface OnboardingLayoutProps {
  step: number;
  children: React.ReactNode;
  showBack?: boolean;
  scroll?: boolean;
  style?: ViewStyle;
}

export const OnboardingLayout: React.FC<OnboardingLayoutProps> = ({
  step,
  children,
  showBack = true,
  scroll = false,
  style,
}) => {
  const navigation = useNavigation();

  const header = (
    <View style={styles.header}>
      {/* Back button slot — always reserve the space so progress bar is stable */}
      <View style={styles.backSlot}>
        {showBack && navigation.canGoBack() && (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            hitSlop={12}
          >
            <Icon name="ChevronLeft" size={24} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress bar fills remaining space */}
      <View style={styles.progressContainer}>
        <ProgressBar step={step} total={TOTAL_STEPS} />
      </View>

      {/* Right spacer mirrors back button for visual centering */}
      <View style={styles.backSlot} />
    </View>
  );

  const content = (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {header}

        {scroll ? (
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
          >
            {content}
          </ScrollView>
        ) : (
          content
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
  header: {
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
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
  },
});
