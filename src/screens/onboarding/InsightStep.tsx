import React from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, Button, Gigi } from '../../components';
import { theme } from '../../theme';
import { Ionicons } from '@expo/vector-icons';

interface InsightStepProps {
  onComplete: () => void;
  type: 'symptoms' | 'solution' | 'features';
}

export const InsightStep: React.FC<InsightStepProps> = ({ onComplete, type }) => {
  
  const renderContent = () => {
    switch (type) {
      case 'symptoms':
        return (
          <>
            <Gigi emotion="sad-frustrate" size="md" />
            <Text variant="title2" style={styles.title}>
              We noticed you're struggling with bloating.
            </Text>
            <Text variant="body" style={styles.text}>
              Bloating is often a sign of reduced gut microbiome diversity. But don't worry, we can fix this together!
            </Text>
            <View style={styles.statCard}>
              <Text variant="headline" style={styles.statNumber}>87%</Text>
              <Text variant="caption1" style={styles.statLabel}>of users feel better in 2 weeks</Text>
            </View>
          </>
        );
      case 'solution':
        return (
          <>
            <Gigi emotion="happy-clap" size="md" />
            <Text variant="title2" style={styles.title}>
              Meet Your New Gut Coach
            </Text>
            <Text variant="body" style={styles.text}>
              I'm Gigi! I'll analyze every meal and give you instant feedback to heal your gut.
            </Text>
            {/* Mock Chat Bubble */}
            <View style={styles.chatBubble}>
              <Text variant="body" style={{ color: theme.colors.brand.black }}>
                "That smoothie looks great, but let's add some flax seeds for fiber!"
              </Text>
            </View>

            {/* Social Proof Section */}
            <View style={styles.socialProofSection}>
              <View style={styles.divider} />
              <Text variant="headline" style={styles.socialTitle}>Loved by thousands</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false} 
                contentContainerStyle={styles.reviewsList}
                style={styles.reviewsScroll}
              >
                {REVIEWS.map((review, i) => (
                  <ReviewCard key={i} {...review} />
                ))}
              </ScrollView>
            </View>
          </>
        );
      case 'features':
        return (
          <>
            <View style={styles.heroIconContainer}>
              <View style={styles.heroIconBg}>
                <Ionicons name="layers" size={48} color={theme.colors.brand.coral} />
              </View>
            </View>
            <Text variant="title1" style={styles.title}>
              All-in-one Gut Health
            </Text>
            <Text variant="body" style={styles.subtitle}>
              Everything you need to track, understand, and improve your digestion.
            </Text>
            <View style={styles.featureList}>
              <FeatureRow icon="camera" text="Instant Food Scanner" />
              <FeatureRow icon="restaurant" text="Personalized Plans" />
              <FeatureRow icon="chatbubble-ellipses" text="24/7 AI Gut Coach" />
            </View>
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.mainContent}>
          {renderContent()}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" onPress={onComplete} variant="primary" size="large" fullWidth />
      </View>
    </View>
  );
};

const REVIEWS = [
  { name: "Sarah M.", stars: 5, text: "I finally understand what foods trigger my bloating. Gigi is a lifesaver!", time: "2 weeks ago" },
  { name: "James P.", stars: 5, text: "Down 5lbs and sleeping better than ever. The custom plan really works.", time: "1 month ago" },
  { name: "Emily R.", stars: 5, text: "Simple, easy to use, and actually effective. Highly recommend!", time: "3 days ago" }
];

const FeatureRow = ({ icon, text }: { icon: any, text: string }) => (
  <View style={styles.featureRow}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color={theme.colors.brand.coral} />
    </View>
    <Text variant="headline" style={styles.featureText}>{text}</Text>
  </View>
);

const ReviewCard = ({ name, stars, text, time }: any) => (
  <View style={styles.reviewCard}>
    <View style={styles.reviewHeader}>
      <View style={styles.reviewUserInfo}>
        <View style={styles.reviewAvatar}>
          <Text style={styles.reviewAvatarText}>{name[0]}</Text>
        </View>
        <View>
          <Text variant="headline" style={styles.reviewName}>{name}</Text>
          <View style={styles.reviewStars}>
            {[...Array(stars)].map((_, i) => (
              <Ionicons key={i} name="star" size={14} color="#FFD700" />
            ))}
          </View>
        </View>
      </View>
      <Text variant="caption1" style={styles.reviewTime}>{time}</Text>
    </View>
    <Text variant="body" style={styles.reviewBody}>"{text}"</Text>
  </View>
);

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.xs,
    flexGrow: 1,
    overflow: 'visible',
  },
  mainContent: {
    alignItems: 'center',
    overflow: 'visible',
  },
  title: {
    textAlign: 'center',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    color: theme.colors.text.white,
  },
  text: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // Glassy
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statNumber: {
    color: theme.colors.brand.teal,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 'bold',
  },
  statLabel: {
    color: theme.colors.text.white,
    marginTop: 4,
  },
  chatBubble: {
    backgroundColor: theme.colors.brand.cream,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: 0,
    marginTop: theme.spacing.lg,
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  featureList: {
    width: '100%',
    gap: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  featureText: {
    color: theme.colors.text.white,
  },
  heroIconContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.md,
  },
  heroIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 100, 0.2)',
    boxShadow: '0 0 30px rgba(255, 118, 100, 0.2)',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
    color: 'rgba(255, 255, 255, 0.7)',
    paddingHorizontal: theme.spacing.md,
  },
  footer: {
    padding: theme.spacing.xl,
    paddingBottom: 40,
  },
  socialProofSection: {
    marginTop: theme.spacing['2xl'],
    marginLeft: -theme.spacing.xl,
    width: screenWidth,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: theme.spacing.lg,
  },
  socialTitle: {
    color: theme.colors.text.white,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
  reviewsScroll: {
    flexGrow: 0,
  },
  reviewsList: {
    paddingLeft: theme.spacing.xl,
    paddingRight: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  reviewCard: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginRight: theme.spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  reviewUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.brand.coral,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  reviewAvatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  reviewName: {
    color: theme.colors.text.white,
    fontSize: 14,
  },
  reviewStars: {
    flexDirection: 'row',
    marginTop: 2,
  },
  reviewTime: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  reviewBody: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
