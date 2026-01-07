import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Container, Text } from '../components';
import { theme } from '../theme';
import { LinearGradient } from 'expo-linear-gradient';

interface Reference {
  title: string;
  authors: string;
  journal: string;
  year: string;
  url: string;
}

interface ReferenceSection {
  title: string;
  icon: string;
  references: Reference[];
}

const REFERENCES: ReferenceSection[] = [
  {
    title: 'Gut Microbiome & Health',
    icon: 'heart',
    references: [
      {
        title: 'Gut microbiota and its possible role in obesity, diabetes, and metabolic syndrome',
        authors: 'Musso G, Gambino R, Cassader M',
        journal: 'Acta Diabetologica',
        year: '2010',
        url: 'https://pubmed.ncbi.nlm.nih.gov/20808540/'
      },
      {
        title: 'The gut microbiome and its role in health and disease',
        authors: 'Lynch SV, Pedersen O',
        journal: 'New England Journal of Medicine',
        year: '2016',
        url: 'https://www.nejm.org/doi/full/10.1056/NEJMra1600266'
      },
      {
        title: 'Human gut microbiome viewed across age and geography',
        authors: 'Yatsunenko T, et al.',
        journal: 'Nature',
        year: '2012',
        url: 'https://www.nature.com/articles/nature11468'
      }
    ]
  },
  {
    title: 'Fiber & Digestive Health',
    icon: 'leaf',
    references: [
      {
        title: 'Dietary fiber and weight regulation',
        authors: 'Slavin JL',
        journal: 'Nutrition',
        year: '2005',
        url: 'https://pubmed.ncbi.nlm.nih.gov/16011478/'
      },
      {
        title: 'Impact of diet on gut microbiota composition and function',
        authors: 'Singh RK, et al.',
        journal: 'Frontiers in Microbiology',
        year: '2017',
        url: 'https://www.frontiersin.org/articles/10.3389/fmicb.2017.01893/full'
      },
      {
        title: 'Health benefits of dietary fiber',
        authors: 'Anderson JW, et al.',
        journal: 'Nutrition Reviews',
        year: '2009',
        url: 'https://academic.oup.com/nutritionreviews/article/67/4/188/4555491'
      }
    ]
  },
  {
    title: 'Probiotics & Prebiotics',
    icon: 'flower',
    references: [
      {
        title: 'Probiotics and prebiotics: Can they improve gut health?',
        authors: 'Sanders ME',
        journal: 'Nutrition Today',
        year: '2019',
        url: 'https://journals.lww.com/nutritiontodayonline/Fulltext/2019/110000/Probiotics_and_Prebiotics__Can_They_Improve_Gut.9.aspx'
      },
      {
        title: 'The International Scientific Association for Probiotics and Prebiotics (ISAPP) consensus statement on the definition and scope of prebiotics',
        authors: 'Gibson GR, et al.',
        journal: 'Nature Reviews Gastroenterology & Hepatology',
        year: '2017',
        url: 'https://www.nature.com/articles/nrgastro.2017.75'
      }
    ]
  },
  {
    title: 'Nutritional Data Sources',
    icon: 'nutrition',
    references: [
      {
        title: 'USDA FoodData Central',
        authors: 'U.S. Department of Agriculture',
        journal: 'Agricultural Research Service',
        year: '2024',
        url: 'https://fooddatacentral.usda.gov/'
      },
      {
        title: 'Dietary Guidelines for Americans',
        authors: 'U.S. Department of Health and Human Services',
        journal: '2020-2025 Edition',
        year: '2020',
        url: 'https://www.dietaryguidelines.gov/'
      }
    ]
  }
];

export default function ReferencesScreen({ navigation }: any) {
  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      console.error('Failed to open URL:', err);
    });
  };

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
              Scientific References
            </Text>
            <Text variant="body" style={styles.headerSubtitle}>
              Research behind our gut health scoring
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Introduction */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(165, 225, 166, 0.1)', 'rgba(165, 225, 166, 0.02)']}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color={theme.colors.brand.teal} />
              <Text variant="title3" weight="semiBold" style={styles.cardTitle}>
                About Our Methodology
              </Text>
            </View>
            <Text variant="body" style={styles.cardText}>
              Our gut health scoring system is based on peer-reviewed scientific research and established nutritional science. We analyze foods using:
            </Text>
            <View style={styles.bulletPoints}>
              <Text variant="body" style={styles.bulletPoint}>
                • USDA FoodData Central for nutritional data
              </Text>
              <Text variant="body" style={styles.bulletPoint}>
                • Peer-reviewed gut microbiome research
              </Text>
              <Text variant="body" style={styles.bulletPoint}>
                • Evidence-based nutrition guidelines
              </Text>
              <Text variant="body" style={styles.bulletPoint}>
                • Scientific consensus on digestive health
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Reference Sections */}
        {REFERENCES.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: 'rgba(165, 225, 166, 0.15)' }]}>
                <Ionicons name={section.icon as any} size={20} color={theme.colors.brand.teal} />
              </View>
              <Text variant="title3" weight="semiBold" style={styles.sectionTitle}>
                {section.title}
              </Text>
            </View>

            {section.references.map((ref, refIndex) => (
              <TouchableOpacity
                key={refIndex}
                style={styles.referenceCard}
                onPress={() => openLink(ref.url)}
              >
                <Ionicons name="link" size={16} color={theme.colors.brand.teal} style={styles.linkIcon} />
                <View style={styles.referenceContent}>
                  <Text variant="body" weight="semiBold" style={styles.referenceTitle}>
                    {ref.title}
                  </Text>
                  <Text variant="caption1" style={styles.referenceAuthors}>
                    {ref.authors}
                  </Text>
                  <Text variant="caption2" style={styles.referenceJournal}>
                    {ref.journal}, {ref.year}
                  </Text>
                </View>
                <Ionicons name="open-outline" size={18} color={theme.colors.brand.teal} />
              </TouchableOpacity>
            ))}
          </View>
        ))}

        {/* Disclaimer */}
        <View style={styles.section}>
          <LinearGradient
            colors={['rgba(255, 118, 100, 0.1)', 'rgba(255, 118, 100, 0.02)']}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="medical" size={24} color={theme.colors.brand.coral} />
              <Text variant="title3" weight="semiBold" style={styles.cardTitle}>
                Important Note
              </Text>
            </View>
            <Text variant="body" style={styles.cardText}>
              These references are for educational purposes only. GutScan is not a medical device and does not provide medical advice. Always consult with qualified healthcare professionals for medical decisions.
            </Text>
          </LinearGradient>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text variant="caption2" style={styles.footerText}>
            Last updated: January 2026
          </Text>
        </View>
      </ScrollView>
    </Container>
  );
}

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
    marginBottom: theme.spacing.md,
  },
  bulletPoints: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  bulletPoint: {
    color: theme.colors.text.white,
    opacity: 0.8,
    paddingLeft: theme.spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    color: theme.colors.text.white,
    flex: 1,
  },
  referenceCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  linkIcon: {
    marginTop: 2,
    marginRight: theme.spacing.sm,
  },
  referenceContent: {
    flex: 1,
  },
  referenceTitle: {
    color: theme.colors.text.white,
    marginBottom: 2,
  },
  referenceAuthors: {
    color: theme.colors.text.white,
    opacity: 0.7,
    marginBottom: 2,
  },
  referenceJournal: {
    color: theme.colors.text.white,
    opacity: 0.5,
  },
  footer: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing['2xl'],
    alignItems: 'center',
  },
  footerText: {
    color: theme.colors.text.white,
    opacity: 0.4,
  },
});
