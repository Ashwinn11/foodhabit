import React from 'react';
import { 
  View, 
  Modal, 
  StyleSheet, 
  TouchableWithoutFeedback, 
  ScrollView
} from 'react-native';
import { colors, spacing } from '../../theme/theme';
import { Typography } from '../Typography';
import { Button } from '../Button';
import { Card } from '../Card';
import { IconContainer } from '../IconContainer/IconContainer';

export type ModalType = 'info' | 'success' | 'error' | 'confirm';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: ModalType;
  primaryButtonText?: string;
  onPrimaryPress?: () => void;
  secondaryButtonText?: string;
  onSecondaryPress?: () => void;
  cancelable?: boolean;
}

export const CustomModal: React.FC<CustomModalProps> = ({
  visible,
  onClose,
  title,
  message,
  type = 'info',
  primaryButtonText = 'OK',
  onPrimaryPress,
  secondaryButtonText,
  onSecondaryPress,
  cancelable = true,
}) => {
  if (!visible) return null;

  const getIconConfig = () => {
    switch (type) {
      case 'success':
        return { name: 'checkmark-circle-outline' as any, color: colors.blue };
      case 'error':
        return { name: 'close-circle-outline' as any, color: colors.pink };
      case 'confirm':
        return { name: 'help-circle-outline' as any, color: colors.yellow };
      case 'info':
      default:
        return { name: 'information-circle-outline' as any, color: colors.blue };
    }
  };

  const iconConfig = getIconConfig();

  const handlePrimaryPress = () => {
    if (onPrimaryPress) {
      onPrimaryPress();
    } else {
      onClose();
    }
  };

  const handleSecondaryPress = () => {
    if (onSecondaryPress) {
      onSecondaryPress();
    } else {
      onClose();
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={cancelable ? onClose : undefined}
    >
      <View style={styles.overlay}>
        <View 
          style={StyleSheet.absoluteFillObject}
        >
          <TouchableWithoutFeedback onPress={cancelable ? onClose : undefined}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>
        </View>

        <View
          style={styles.modalContainer}
        >
          <Card style={styles.card} shadow="md">
            <View style={styles.iconWrapper}>
              <IconContainer
                name={iconConfig.name}
                size={64}
                iconSize={32}
                color={iconConfig.color === colors.yellow ? colors.black : iconConfig.color}
                backgroundColor={iconConfig.color === colors.yellow ? colors.yellow : iconConfig.color + '15'}
                borderWidth={2}
                borderColor={iconConfig.color}
              />
            </View>

            <Typography variant="h3" align="center" style={styles.title}>
              {title}
            </Typography>

            <View style={styles.messageContainer}>
              <ScrollView 
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                <Typography variant="body" align="center" style={styles.message}>
                  {message}
                </Typography>
              </ScrollView>
            </View>

            <View style={styles.buttonContainer}>
              {secondaryButtonText && (
                <Button
                  title={secondaryButtonText}
                  onPress={handleSecondaryPress}
                  variant="ghost"
                  style={styles.button}
                />
              )}
              <Button
                title={primaryButtonText}
                onPress={handlePrimaryPress}
                variant="primary"
                color={iconConfig.color}
                style={[styles.button, secondaryButtonText ? { flex: 1.5 } : { flex: 1 }]}
              />
            </View>
          </Card>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    zIndex: 1,
  },
  card: {
    padding: spacing.xl,
    alignItems: 'center',
    maxHeight: '100%',
  },
  iconWrapper: {
    marginBottom: spacing.lg,
    alignSelf: 'center',
  },
  title: {
    marginBottom: spacing.sm,
  },
  messageContainer: {
    maxHeight: 300,
    width: '100%',
    marginBottom: spacing['2xl'],
  },
  scrollContent: {
    paddingHorizontal: spacing.xs,
  },
  message: {
    color: colors.black + '99',
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
});
