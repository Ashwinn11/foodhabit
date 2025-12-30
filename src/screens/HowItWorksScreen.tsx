import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Text } from '../components';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

export default function HowItWorksScreen({ navigation }: any) {
  return (
    <Container safeArea={true} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text.white} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text variant="title1" weight="bold" style={styles.headerTitle}>
              How It Works
            </Text>
            <Text variant="body" style={styles.headerSubtitle}>
              Understanding your gut health scores
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* AI Analysis Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(165, 225, 166, 0.1)', 'rgba(165, 225, 166, 0.02)']}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="sparkles" size={24} color={theme.colors.brand.teal} />
              <Text variant="title3" weight="semiBold" style={styles.cardTitle}>
                AI-Powered Food Recognition
              </Text>
            </View>
            <Text variant="body" style={styles.cardText}>
              We use Google Gemini AI to analyze your meal photos and identify the foods you're eating. The AI recognizes ingredients, portion sizes, and preparation methods to provide accurate nutritional insights.
            </Text>
          </LinearGradient>
        </View>

        {/* Scoring Methodology Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(165, 225, 166, 0.1)', 'rgba(165, 225, 166, 0.02)']}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="calculator" size={24} color={theme.colors.brand.teal} />
              <Text variant="title3" weight="semiBold" style={styles.cardTitle}>
                Gut Health Scoring
              </Text>
            </View>
            <Text variant="body" style={styles.cardText}>
              Your gut health score (0-100) is calculated based on multiple factors:
            </Text>
            
            <View style={styles.factorsList}>
              <FactorItem 
                icon="leaf" 
                color="#4ade80"
                title="Fiber Content" 
                description="High-fiber foods support healthy digestion and gut microbiome diversity"
              />
              <FactorItem 
                icon="flower" 
                color="#a5e1a6"
                title="Prebiotics & Probiotics" 
                description="Foods that feed beneficial gut bacteria and promote digestive wellness"
              />
              <FactorItem 
                icon="warning" 
                color="#fbbf24"
                title="Potential Triggers" 
                description="Common gut irritants like high sugar, processed foods, and inflammatory ingredients"
              />
              <FactorItem 
                icon="person" 
                color="#ff7664"
                title="Personal Triggers" 
                description="Foods you've marked as triggers based on your individual sensitivities"
              />
            </View>
          </LinearGradient>
        </View>

        {/* Scientific Basis Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(165, 225, 166, 0.1)', 'rgba(165, 225, 166, 0.02)']}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="school" size={24} color={theme.colors.brand.teal} />
              <Text variant="title3" weight="semiBold" style={styles.cardTitle}>
                Research-Based Approach
              </Text>
            </View>
            <Text variant="body" style={styles.cardText}>
              Our scoring methodology is based on peer-reviewed nutritional science and gut microbiome research. We analyze foods using established nutritional databases and current scientific understanding of digestive health.
            </Text>
            <Text variant="caption1" style={styles.noteText}>
              Note: Nutritional values and gut health impacts are estimates based on typical serving sizes and food composition data.
            </Text>
          </LinearGradient>
        </View>

        {/* Limitations Section */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(255, 118, 100, 0.1)', 'rgba(255, 118, 100, 0.02)']}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color={theme.colors.brand.coral} />
              <Text variant="title3" weight="semiBold" style={styles.cardTitle}>
                Important Limitations
              </Text>
            </View>
            <Text variant="body" style={styles.cardText}>
              • Individual results may vary based on your unique microbiome{'\n'}
              • Scores are educational estimates, not medical diagnoses{'\n'}
              • AI recognition accuracy depends on photo quality{'\n'}
              • Not a substitute for professional medical advice{'\n'}
              • Always consult healthcare providers for health concerns
            </Text>
          </LinearGradient>
        </View>

        {/* Medical Disclaimer */}
        <View style={styles.disclaimerSection}>
          <View style={styles.disclaimerCard}>
            <View style={styles.disclaimerHeader}>
              <Ionicons name="medical" size={18} color={theme.colors.brand.coral} />
              <Text variant="caption1" weight="semiBold" style={styles.disclaimerTitle}>
                Medical Disclaimer
              </Text>
            </View>
            <Text variant="caption2" style={styles.disclaimerText}>
              GutScan is not a medical device and does not provide medical advice, diagnosis, or treatment. The information provided is for educational and informational purposes only. Always consult with qualified healthcare professionals before making dietary changes or medical decisions.
            </Text>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
}

const FactorItem = ({ icon, color, title, description }: any) => (
  <View style={styles.factorItem}>
    <View style={[styles.factorIcon, { backgroundColor: `${color}20` }]}>
      <Ionicons name={icon} size={20} color={color} />
    </View>
    <View style={styles.factorContent}>
      <Text variant="body" weight="semiBold" style={styles.factorTitle}>
        {title}
      </Text>
      <Text variant="caption1" style={styles.factorDescription}>
        {description}
      </Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
  },
  headerTitle: {
    color: theme.colors.text.white,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: theme.colors.text.white,
    opacity: 0.7,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  card: {
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    color: theme.colors.text.white,
  },
  cardText: {
    color: theme.colors.text.white,
    opacity: 0.8,
    lineHeight: 22,
  },
  noteText: {
    color: theme.colors.text.white,
    opacity: 0.6,
    marginTop: theme.spacing.md,
    fontStyle: 'italic',
  },
  factorsList: {
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  factorItem: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  factorIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorContent: {
    flex: 1,
  },
  factorTitle: {
    color: theme.colors.text.white,
    marginBottom: 2,
  },
  factorDescription: {
    color: theme.colors.text.white,
    opacity: 0.7,
    lineHeight: 18,
  },
  disclaimerSection: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing['2xl'],
  },
  disclaimerCard: {
    backgroundColor: 'rgba(255, 118, 100, 0.1)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 118, 100, 0.3)',
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  disclaimerTitle: {
    color: theme.colors.brand.coral,
  },
  disclaimerText: {
    color: theme.colors.text.white,
    opacity: 0.8,
    lineHeight: 18,
  },
});
