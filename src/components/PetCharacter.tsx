import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../theme';
import Text from './Text';

interface PetCharacterProps {
  healthScore: number; // 0-100
  size?: number;
}

type PetState = 'thriving' | 'healthy' | 'okay' | 'struggling';

const getPetState = (score: number): PetState => {
  if (score > 70) return 'thriving';
  if (score > 50) return 'healthy';
  if (score > 30) return 'okay';
  return 'struggling';
};

const PET_COLORS = {
  thriving: theme.colors.brand.secondary, // Pastel green - healthy
  healthy: theme.colors.brand.secondary,
  okay: theme.colors.brand.tertiary, // Purple instead of gray
  struggling: theme.colors.brand.tertiary, // Purple
};

const getStateLabel = (state: PetState): string => {
  switch (state) {
    case 'thriving':
      return 'Thriving!';
    case 'healthy':
      return 'Feeling Good';
    case 'okay':
      return 'Neutral';
    case 'struggling':
      return 'Needs Care';
    default:
      return 'Feeling Good';
  }
};

const getStateIcon = (state: PetState): string => {
  switch (state) {
    case 'thriving':
      return 'star';
    case 'healthy':
      return 'checkmark-circle';
    case 'okay':
      return 'help-circle';
    case 'struggling':
      return 'heart';
    default:
      return 'checkmark-circle';
  }
};

export default function PetCharacter({ healthScore, size = 250 }: PetCharacterProps) {
  const petState = getPetState(healthScore);
  const previousStateRef = useRef<PetState>(petState);

  const player = useVideoPlayer(
    require('../../assets/grok-video-1cea24cf-53b8-45ad-ad08-ca22e4fc4988.mp4'),
    (player) => {
      player.volume = 0;
      player.muted = true;
      player.loop = true; // Loop continuously
    }
  );

  // Play on mount
  useEffect(() => {
    player.play();
  }, [player]);

  // Trigger video replay when state changes
  useEffect(() => {
    if (previousStateRef.current !== petState) {
      // Restart video animation when health state changes
      player.pause();
      player.currentTime = 0;
      player.play();
      previousStateRef.current = petState;
    }
  }, [petState, player]);

  const petColor = PET_COLORS[petState];
  const stateLabel = getStateLabel(petState);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Pet Video/Animation Container */}
      <View
        style={[
          styles.petFrame,
          {
            width: size,
            height: size,
          },
        ]}
      >
        <VideoView player={player} style={styles.video} />
      </View>

      {/* Health Status Label with Icon */}
      <View style={styles.statusContainer}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                petState === 'thriving'
                  ? theme.colors.brand.secondary + '20'
                  : petState === 'healthy'
                    ? theme.colors.brand.secondary + '15'
                    : petState === 'okay'
                      ? theme.colors.brand.tertiary + '10'
                      : theme.colors.brand.tertiary + '20',
            },
          ]}
        >
          <Ionicons
            name={getStateIcon(petState) as any}
            size={14}
            color={petColor}
            style={{ marginRight: 4 }}
          />
          <Text variant="caption" weight="semiBold">
            {stateLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  petFrame: {
    borderRadius: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent', // No background - let video show through
    borderColor: 'transparent', // No border
    borderWidth: 0,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.pill,
    gap: theme.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
