import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Gigi } from '../../components';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface ReviewsStepProps {
  onComplete: () => void;
}

export const ReviewsStep: React.FC<ReviewsStepProps> = ({ onComplete }) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Gigi emotion="happy-clap" size="md" />
        <Text variant="title2" style={styles.title}>Loved by thousands</Text>
        <Text variant="body" style={styles.subtitle}>
          Join the community healing their gut naturally.
        </Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <ReviewCard 
          name="Sarah M." 
          stars={5} 
          text="I finally understand what foods trigger my bloating. Gigi is a lifesaver!" 
          time="2 weeks ago"
        />
        <ReviewCard 
          name="James P." 
          stars={5} 
          text="Down 5lbs and sleeping better than ever. The custom plan really works." 
          time="1 month ago"
        />
        <ReviewCard 
          name="Emily R." 
          stars={5} 
          text="Simple, easy to use, and actually effective. Highly recommend!" 
          time="3 days ago"
        />
      </ScrollView>

      <View style={styles.footer}>
        <Button 
          title="See How It Works" 
          onPress={onComplete} 
          variant="primary" 
          size="large" 
          fullWidth 
        />
      </View>
    </View>
  );
};

const ReviewCard = ({ name, stars, text, time }: any) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.userInfo}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>{name[0]}</Text>
        </View>
        <View>
          <Text variant="headline" style={styles.userName}>{name}</Text>
          <View style={styles.stars}>
            {[...Array(stars)].map((_, i) => (
              <Ionicons key={i} name="star" size={14} color="#FFD700" />
            ))}
          </View>
        </View>
      </View>
      <Text variant="caption1" style={styles.time}>{time}</Text>
    </View>
    <Text variant="body" style={styles.reviewText}>"{text}"</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingBottom: 0,
    overflow: 'visible',
  },
  title: {
    marginTop: theme.spacing.lg,
    color: theme.colors.text.white,
  },
  subtitle: {
    marginTop: theme.spacing.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  scrollView: {
    marginTop: theme.spacing.xl,
    flexGrow: 0,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  card: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    color: theme.colors.text.white,
    fontSize: 14,
  },
  stars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  time: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  reviewText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    justifyContent: 'flex-end',
    flex: 1,
  },
});
