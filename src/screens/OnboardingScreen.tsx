import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text, Gigi } from '../components';
import { theme } from '../theme';
import { registerForPushNotificationsAsync } from '../services/notificationService';



interface OnboardingSlide {
  id: number;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  gigiEmotion: 'happy' | 'excited' | 'neutral' | 'thinking' | 'worried';
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    title: 'Welcome to GutScan!',
    description: 'Meet Gigi, your friendly gut health companion who will help you build better eating habits.',
    icon: 'heart',
    gigiEmotion: 'excited',
  },
  {
    id: 2,
    title: 'Scan Your Meals',
    description: 'Simply take a photo of your food and get an instant gut health score based on fiber, plant diversity, and more.',
    icon: 'camera',
    gigiEmotion: 'thinking',
  },
  {
    id: 3,
    title: 'Track Your Progress',
    description: 'Build streaks, level up Gigi, and watch your gut health improve over time.',
    icon: 'trending-up',
    gigiEmotion: 'happy',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const handleNext = async () => {
    console.log('handleNext called, currentSlide:', currentSlide);
    
    if (currentSlide < slides.length - 1) {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start(() => {
        setCurrentSlide(currentSlide + 1);
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start();
      });
    } else {
      // Last slide - request notifications and complete
      console.log('Last slide - completing onboarding');
      try {
        await registerForPushNotificationsAsync();
      } catch (error) {
        console.log('Notification permission error (non-blocking):', error);
      }
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const slide = slides[currentSlide];
  const isLastSlide = currentSlide === slides.length - 1;

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Skip Button */}
      {!isLastSlide && (
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text variant="body" style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        {/* Gigi */}
        <View style={styles.gigiContainer}>
          <Gigi emotion={slide.gigiEmotion} size="md" />
        </View>

        {/* Text */}
        <Text variant="title1" weight="bold" style={styles.title}>
          {slide.title}
        </Text>
        <Text variant="body" style={styles.description}>
          {slide.description}
        </Text>
      </Animated.View>

      {/* Bottom Section */}
      <View style={styles.bottomSection}>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide && styles.dotActive,
              ]}
            />
          ))}
        </View>

        {/* Next Button */}
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text variant="headline" weight="bold" style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name={isLastSlide ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color={theme.colors.brand.black} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.brand.background,
    paddingHorizontal: theme.spacing.xl,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: theme.spacing.md,
  },
  skipText: {
    color: theme.colors.text.white,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  gigiContainer: {
    marginBottom: theme.spacing['3xl'],
  },
  title: {
    color: theme.colors.text.white,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  description: {
    color: theme.colors.text.white,
    textAlign: 'center',
    opacity: 0.8,
    lineHeight: 24,
  },
  bottomSection: {
    paddingVertical: theme.spacing.xl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
    gap: theme.spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  dotActive: {
    backgroundColor: theme.colors.brand.coral,
    width: 24,
  },
  nextButton: {
    backgroundColor: theme.colors.brand.cream,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    gap: theme.spacing.sm,
  },
  nextButtonText: {
    color: theme.colors.brand.black,
  },
});
