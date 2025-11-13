import React, { useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, Text, Input, Card } from '../index';
import { theme, r, haptics } from '../../theme';

interface AddMealModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSave: (meal: {
    name: string;
    size: 'small' | 'normal' | 'large';
    time: string;
    symptom: 'fine' | 'mild_discomfort' | 'bloating';
  }) => Promise<void>;
}

export function AddMealModal({ isVisible, onClose, onSave }: AddMealModalProps) {
  const [mealName, setMealName] = useState('');
  const [mealSize, setMealSize] = useState<'small' | 'normal' | 'large'>('normal');
  const [mealTime, setMealTime] = useState(new Date().toISOString().split('T')[1].slice(0, 5));
  const [symptom, setSymptom] = useState<'fine' | 'mild_discomfort' | 'bloating'>('fine');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!mealName.trim()) {
      Alert.alert('Please enter a meal name');
      return;
    }

    try {
      setLoading(true);
      haptics.patterns.buttonPress();

      await onSave({
        name: mealName,
        size: mealSize,
        time: mealTime,
        symptom,
      });

      haptics.patterns.success();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error saving meal:', error);
      Alert.alert('Error', 'Failed to log meal. Please try again.');
      haptics.patterns.error();
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setMealName('');
    setMealSize('normal');
    setMealTime(new Date().toISOString().split('T')[1].slice(0, 5));
    setSymptom('fine');
  };

  const handleClose = () => {
    haptics.patterns.buttonPress();
    resetForm();
    onClose();
  };

  const MealSizeOption = ({ size, label }: { size: 'small' | 'normal' | 'large'; label: string }) => (
    <TouchableOpacity
      style={[
        styles.sizeButton,
        mealSize === size && styles.sizeButtonActive,
      ]}
      onPress={() => {
        setMealSize(size);
        haptics.patterns.cardTap();
      }}
    >
      <Text
        variant="button"
        style={{
          color: mealSize === size ? theme.colors.background.primary : theme.colors.text.primary,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SymptomOption = ({
    value,
    label,
  }: {
    value: 'fine' | 'mild_discomfort' | 'bloating';
    label: string;
  }) => (
    <TouchableOpacity
      style={[
        styles.symptomButton,
        symptom === value && styles.symptomButtonActive,
      ]}
      onPress={() => {
        setSymptom(value);
        haptics.patterns.cardTap();
      }}
    >
      <Text
        variant="button"
        style={{
          color: symptom === value ? theme.colors.background.primary : theme.colors.text.primary,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="formSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardAvoidingView}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose}>
              <Text variant="button" style={styles.cancelButton}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text variant="h4">Log Meal</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Meal Name */}
            <View style={styles.section}>
              <Text variant="label" style={styles.sectionLabel}>
                What did you eat?
              </Text>
              <Input
                placeholder="e.g., Grilled Salmon with Broccoli"
                value={mealName}
                onChangeText={setMealName}
                editable={!loading}
                autoFocus
              />
            </View>

            {/* Meal Size */}
            <View style={styles.section}>
              <Text variant="label" style={styles.sectionLabel}>
                Portion Size
              </Text>
              <View style={styles.sizeButtonGroup}>
                <MealSizeOption size="small" label="Small" />
                <MealSizeOption size="normal" label="Normal" />
                <MealSizeOption size="large" label="Large" />
              </View>
            </View>

            {/* Meal Time */}
            <View style={styles.section}>
              <Text variant="label" style={styles.sectionLabel}>
                Time
              </Text>
              <Input
                placeholder="HH:MM"
                value={mealTime}
                onChangeText={setMealTime}
                editable={!loading}
              />
              <Text variant="caption" color="tertiary" style={styles.helper}>
                Leave as is for current time
              </Text>
            </View>

            {/* Post-Meal Symptom */}
            <View style={styles.section}>
              <Text variant="label" style={styles.sectionLabel}>
                How do you feel after?
              </Text>
              <View style={styles.symptomButtonGroup}>
                <SymptomOption value="fine" label="Fine" />
                <SymptomOption value="mild_discomfort" label="Mild" />
                <SymptomOption value="bloating" label="Bloating" />
              </View>
            </View>

            {/* Summary Card */}
            <Card variant="filled" padding="large" style={styles.summaryCard}>
              <Text variant="h5" style={styles.summaryTitle}>
                Summary
              </Text>
              <View style={styles.summaryRow}>
                <Text variant="body" color="secondary">
                  Meal:
                </Text>
                <Text variant="body" style={styles.summaryValue}>
                  {mealName || '(not set)'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="body" color="secondary">
                  Size:
                </Text>
                <Text variant="body" style={styles.summaryValue}>
                  {mealSize.charAt(0).toUpperCase() + mealSize.slice(1)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text variant="body" color="secondary">
                  Symptom:
                </Text>
                <Text variant="body" style={styles.summaryValue}>
                  {symptom === 'mild_discomfort' ? 'Mild Discomfort' : symptom.charAt(0).toUpperCase() + symptom.slice(1)}
                </Text>
              </View>
            </Card>
          </ScrollView>

          {/* Save Button */}
          <View style={styles.footer}>
            <Button
              title={loading ? 'Logging...' : 'Log Meal'}
              onPress={handleSave}
              disabled={loading || !mealName.trim()}
              fullWidth
              size="large"
              style={styles.saveButton}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.main,
  },
  cancelButton: {
    color: theme.colors.secondary[500],
    fontSize: 16,
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  section: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  sectionLabel: {
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sizeButtonGroup: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  sizeButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.main,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  sizeButtonActive: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
  symptomButtonGroup: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  symptomButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border.main,
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
  },
  symptomButtonActive: {
    backgroundColor: theme.colors.brand.primary,
    borderColor: theme.colors.brand.primary,
  },
  helper: {
    marginTop: theme.spacing.sm,
  },
  summaryCard: {
    marginBottom: r.adaptiveSpacing['2xl'],
  },
  summaryTitle: {
    marginBottom: theme.spacing.md,
    color: theme.colors.brand.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border.main,
  },
  summaryValue: {
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  footer: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.border.main,
    backgroundColor: theme.colors.background.secondary,
  },
  saveButton: {
    marginBottom: theme.spacing.sm,
  },
});
