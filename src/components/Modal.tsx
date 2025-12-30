import React from 'react';
import {
  Modal as RNModal,
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { theme } from '../theme';
import Text from './Text';
import Button from './Button';

export interface ModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onClose?: () => void;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  children?: React.ReactNode;
  variant?: 'info' | 'error' | 'success' | 'confirmation';
  loading?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  title,
  message,
  onClose,
  primaryButtonText = 'OK',
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
  children,
  variant = 'info',
  loading,
}) => {
  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    } else if (onClose) {
      onClose();
    }
  };

  const backdropOpacity = variant === 'error' ? 1.0 : 0.5;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: `rgba(0, 0, 0, ${backdropOpacity})` }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <View style={styles.container}>
                {title && (
                  <Text
                    variant="title2"
                    color="primary"
                    style={styles.title}
                  >
                    {title}
                  </Text>
                )}

                {message && (
                  <Text variant="body" color="secondary" style={styles.message}>
                    {message}
                  </Text>
                )}

                {children}

                <View style={styles.footer}>
                    {secondaryButtonText && (
                      <View style={styles.buttonWrapper}>
                        <Button
                          title={secondaryButtonText}
                          onPress={onSecondaryPress || onClose || (() => {})}
                          variant="secondary"
                          size="medium"
                          fullWidth
                        />
                      </View>
                    )}
                    
                  <View style={[styles.buttonWrapper, secondaryButtonText ? { marginLeft: theme.spacing.sm } : undefined]}>
                    <Button
                      title={primaryButtonText}
                      onPress={handlePrimaryPress}
                      variant={variant === 'error' ? 'destructive' : 'primary'}
                      size="medium"
                      loading={loading}
                      fullWidth
                    />
                  </View>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </RNModal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  keyboardView: {
    width: '100%',
    alignItems: 'center',
  },
  container: {
    backgroundColor: theme.colors.brand.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    ...theme.shadows.lg,
  },
  title: {
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  message: {
    color: theme.colors.text.white,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonWrapper: {
    flex: 1,
  },
});

export default Modal;
