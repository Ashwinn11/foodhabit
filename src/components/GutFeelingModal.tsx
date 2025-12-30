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
              size="md"
              animated={true}
            />
            <Text variant="caption1" style={styles.previewText}>
              {previewFeeling ? `Feeling ${previewFeeling}` : 'Select how you feel'}
            </Text>
          </View>

          {/* Feelings List */}
          <View style={styles.feelingsList}>
            {FEELINGS.map((feeling) => {
              const isSelected = currentFeeling === feeling.id;
              const isPreview = previewFeeling === feeling.id;
              return (
                <TouchableOpacity
                  key={feeling.id}
                  style={[
                    styles.feelingItem,
                    isSelected && { borderColor: feeling.color, borderWidth: 2 },
                    isPreview && !isSelected && { borderColor: feeling.color, borderWidth: 1, opacity: 0.8 },
                  ]}
                  onPress={() => handleSelect(feeling.id)}
                  onPressIn={() => setPreviewFeeling(feeling.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.feelingLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: feeling.color + '20' }]}>
                      <Ionicons name={feeling.icon as any} size={28} color={feeling.color} />
                    </View>
                    <View style={styles.feelingText}>
                      <Text variant="headline" weight="bold" style={styles.feelingLabel}>
                        {feeling.label}
                      </Text>
                      <Text variant="caption1" style={styles.feelingDesc}>
                        {feeling.description}
                      </Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={feeling.color} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <Text variant="caption1" style={styles.hint}>
            Tap Gigi anytime to update how you feel
          </Text>
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
  previewText: {
    color: theme.colors.text.white,
    opacity: 0.7,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  feelingsList: {
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  feelingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  feelingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  feelingText: {
    flex: 1,
  },
  feelingLabel: {
    color: theme.colors.text.white,
    marginBottom: 2,
  },
  feelingDesc: {
    color: 'rgba(255, 255, 255, 0.6)',
  },
  hint: {
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.5)',
    fontStyle: 'italic',
  },
});
