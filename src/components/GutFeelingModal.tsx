import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { Text } from './Text';
import { theme } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import Gigi from './Gigi';

export type GutFeeling = 'great' | 'okay' | 'bloated' | 'pain' | 'nauseous';

interface GutFeelingModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (feeling: GutFeeling) => void;
  currentFeeling?: GutFeeling;
}

const FEELINGS: Array<{
  id: GutFeeling;
  icon: string;
  label: string;
  description: string;
  color: string;
}> = [
  {
    id: 'great',
    icon: 'happy',
    label: 'Feeling Great!',
    description: 'My gut feels amazing',
    color: '#FFD93D', // Bright yellow - happy emoji
  },
  {
    id: 'okay',
    icon: 'happy',
    label: 'Doing Okay',
    description: 'Nothing special',
    color: '#FFC857', // Muted yellow - neutral
  },
  {
    id: 'bloated',
    icon: 'sad',
    label: 'Bloated',
    description: 'Feeling full and uncomfortable',
    color: '#FFB84D', // Orange-yellow - uncomfortable
  },
  {
    id: 'pain',
    icon: 'sad',
    label: 'In Pain',
    description: 'My stomach hurts',
    color: '#FF6B6B', // Red - pain
  },
  {
    id: 'nauseous',
    icon: 'sad',
    label: 'Nauseous',
    description: 'Feeling sick',
    color: '#A8E6A3', // Green - nauseous/sick
  },
];

export const GutFeelingModal: React.FC<GutFeelingModalProps> = ({
  visible,
  onClose,
  onSelect,
  currentFeeling,
}) => {
  const [previewFeeling, setPreviewFeeling] = React.useState<GutFeeling | undefined>(currentFeeling);

  // Update preview when modal opens
  React.useEffect(() => {
    if (visible) {
      setPreviewFeeling(currentFeeling);
    }
  }, [visible, currentFeeling]);

  const handleSelect = (feeling: GutFeeling) => {
    onSelect(feeling);
    onClose();
  };

  // Map feeling to Gigi emotion
  const getGigiEmotion = (feeling?: GutFeeling) => {
    if (!feeling) return 'happy-clap';
    switch (feeling) {
      case 'great': return 'happy-cute';
      case 'okay': return 'happy-clap';
      case 'bloated': return 'sad-frustrate';
      case 'pain': return 'sad-cry';
      case 'nauseous': return 'sad-sick';
      default: return 'happy-clap';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <Text variant="title3" weight="bold" style={styles.title}>
              How does your gut feel?
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.text.white} />
            </TouchableOpacity>
          </View>

          {/* Gigi Preview */}
          <View style={styles.gigiPreview}>
            <Gigi 
              emotion={getGigiEmotion(previewFeeling) as any}
              size="lg"
              animated={true}
            />
            <Text variant="title2" weight="bold" style={styles.feelingLabel}>
              {previewFeeling ? FEELINGS.find(f => f.id === previewFeeling)?.label : 'How do you feel?'}
            </Text>
            <Text variant="caption1" style={styles.feelingDescription}>
              {previewFeeling ? FEELINGS.find(f => f.id === previewFeeling)?.description : 'Slide to select'}
            </Text>
          </View>

          {/* Slider */}
          <View style={styles.sliderContainer}>
            {FEELINGS.map((feeling) => (
              <TouchableOpacity
                key={feeling.id}
                style={[
                  styles.sliderOption,
                  previewFeeling === feeling.id && styles.sliderOptionActive,
                ]}
                onPress={() => setPreviewFeeling(feeling.id)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.sliderIcon,
                  previewFeeling === feeling.id && { 
                    borderWidth: 3,
                    borderColor: feeling.color,
                    transform: [{ scale: 1.15 }],
                  }
                ]}>
                  <Ionicons 
                    name={feeling.icon as any} 
                    size={previewFeeling === feeling.id ? 36 : 28} 
                    color={feeling.color} 
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Confirm Button */}
          <TouchableOpacity 
            style={[
              styles.confirmButton,
              !previewFeeling && styles.confirmButtonDisabled
            ]}
            onPress={() => previewFeeling && handleSelect(previewFeeling)}
            disabled={!previewFeeling}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-circle" size={24} color={theme.colors.brand.white} />
            <Text variant="body" weight="bold" style={styles.confirmButtonText}>
              Confirm
            </Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  modalContent: {
    backgroundColor: theme.colors.brand.background,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.text.white,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  gigiPreview: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
  },
  feelingLabel: {
    color: theme.colors.text.white,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  feelingDescription: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.sm,
  },
  sliderOption: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  sliderOptionActive: {
    // Active state handled by icon scale
  },
  sliderIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButton: {
    backgroundColor: theme.colors.brand.coral,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    opacity: 0.5,
  },
  confirmButtonText: {
    color: theme.colors.brand.white,
  },
});
