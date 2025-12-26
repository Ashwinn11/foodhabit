import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { theme } from '../theme';
import Text from './Text';

interface AvatarProps {
  name?: string;
  size?: number;
}

export default function Avatar({ name = 'user', size = 56 }: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate avatar URL from DiceBear API - use PNG format for React Native compatibility
    const generateAvatar = () => {
      try {
        // Normalize the seed to ensure consistency across different screens
        // Remove extra spaces and convert to lowercase for consistent hashing
        const normalizedSeed = name.trim().toLowerCase();
        const seed = encodeURIComponent(normalizedSeed);
        const url = `https://api.dicebear.com/9.x/adventurer/png?seed=${seed}&scale=90&radius=50`;
        setAvatarUrl(url);
      } catch (error) {
        console.error('Error generating avatar:', error);
      } finally {
        setLoading(false);
      }
    };

    generateAvatar();
  }, [name]);

  if (loading) {
    return (
      <View
        style={[
          styles.avatarContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <ActivityIndicator size="small" color={theme.colors.brand.coral} />
      </View>
    );
  }

  if (!avatarUrl) {
    // Fallback to letter avatar
    const initial = name?.charAt(0).toUpperCase() || 'U';
    return (
      <View
        style={[
          styles.avatarContainer,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Text variant="title1" weight="bold" style={{ color: theme.colors.brand.cream }}>
          {initial}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.avatarContainer,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <Image
        source={{ uri: avatarUrl }}
        style={[
          styles.avatarImage,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
        onError={() => {
          console.error('Failed to load avatar image, falling back to letter avatar');
          setAvatarUrl(null);
        }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  avatarContainer: {
    overflow: 'hidden',
    backgroundColor: theme.colors.brand.cream,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 4,
  },
  avatarImage: {
    // resizeMode removed from style, used as prop instead
  },
  letterFallback: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
