import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
} from 'react-native-reanimated';
import { colors, spacing, radii, fontSizes, fonts } from '../theme/theme';
import { BristolType } from '../store';
import { useGutActions } from '../presentation/hooks';
import {
  BristolPicker,
  SymptomToggle,
  ScreenWrapper,
  BoxButton,
  IconContainer,
  Typography,
  Button,
  SectionHeader,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AddEntryScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const AddEntryScreen: React.FC<AddEntryScreenProps> = ({ navigation }) => {
  // Use new architecture for actions
  const { logGutMoment } = useGutActions();
  
  // Poop state
  const [bristolType, setBristolType] = useState<BristolType | undefined>(undefined);
  const [symptoms, setSymptoms] = useState({
    bloating: false,
    gas: false,
    cramping: false,
    nausea: false,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [urgency, setUrgency] = useState<'none' | 'mild' | 'severe'>('none');
  const [painScore, setPainScore] = useState(0);
  const [incompleteEvacuation, setIncompleteEvacuation] = useState(false);
  
  const handleSubmit = async () => {
    await logGutMoment({
      bristolType,
      symptoms,
      tags: selectedTags,
      urgency,
      painScore: painScore > 0 ? painScore : undefined,
      incompleteEvacuation: incompleteEvacuation || undefined,
    });
    
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Main');
    }
  };
  
  const toggleSymptom = (symptom: keyof typeof symptoms) => {
    setSymptoms(prev => ({ ...prev, [symptom]: !prev[symptom] }));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };
  
  const isValid = bristolType !== undefined;
  
  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.delay(100)}
        style={styles.header}
      >
        <BoxButton 
          icon="close" 
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Main');
            }
          }}
          size={44}
          style={{ backgroundColor: colors.white }}
        />
        
        <View style={styles.titleContainer}>
          <Typography variant="bodyBold" color={colors.black + '99'}>Log</Typography>
          <Typography variant="h3" color={colors.pink}>
            Gut Moment
          </Typography>
        </View>
        
        <View style={{ width: 44 }} />
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          <>
            {/* Poop Type */}
            <Animated.View entering={FadeInDown.delay(200).springify()}>
              <BristolPicker selected={bristolType} onSelect={setBristolType} />
            </Animated.View>
            
            {/* Symptoms - Expanded Medical Section */}
            <Animated.View 
              entering={FadeInDown.delay(300).springify()}
              style={styles.symptomsSection}
            >
              <SectionHeader title="How did it feel?" icon="medical" iconColor={colors.pink} />
              <View style={styles.symptomsGrid}>
                <SymptomToggle
                  label="Bloating"
                  iconName="balloon-outline"
                  active={symptoms.bloating}
                  onToggle={() => toggleSymptom('bloating')}
                  color={colors.pink}
                />
                <SymptomToggle
                  label="Gas"
                  iconName="cloud-outline"
                  active={symptoms.gas}
                  onToggle={() => toggleSymptom('gas')}
                  color={colors.blue}
                />
                <SymptomToggle
                  label="Cramping"
                  iconName="flash-outline"
                  active={symptoms.cramping}
                  onToggle={() => toggleSymptom('cramping')}
                  color={colors.pink}
                />
                <SymptomToggle
                  label="Nausea"
                  iconName="medkit-outline"
                  active={symptoms.nausea}
                  onToggle={() => toggleSymptom('nausea')}
                  color={colors.yellow}
                />
              </View>

              {/* Medical Tags */}
              <Typography variant="bodyXS" color={colors.black + '66'} style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>
                Additional indicators:
              </Typography>
              <View style={styles.foodTags}>
                {['strain', 'urgency', 'blood', 'mucus'].map((tag) => {
                   const isActive = selectedTags.includes(tag);
                   return (
                     <Pressable
                       key={tag}
                       style={[
                         styles.foodTag, 
                         { 
                           backgroundColor: isActive ? colors.pink : colors.pink + '05', 
                           borderColor: colors.pink + '20', 
                           borderWidth: 1 
                         }
                       ]}
                       onPress={() => toggleTag(tag)}
                     >
                       <Typography variant="bodyXS" color={isActive ? colors.white : colors.pink}>{tag}</Typography>
                     </Pressable>
                   );
                })}
               </View>
            </Animated.View>
            
            {/* Urgency Level */}
            <Animated.View 
              entering={FadeInDown.delay(400).springify()}
              style={styles.notesSection}
            >
              <Typography variant="bodyBold" style={styles.inputTitle}>Urgency level?</Typography>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {(['none', 'mild', 'severe'] as const).map((level) => (
                  <Pressable
                    key={level}
                    style={[
                      styles.urgencyButton,
                      urgency === level && styles.urgencyButtonActive,
                      urgency === level && level === 'severe' && { backgroundColor: colors.pink },
                      urgency === level && level === 'mild' && { backgroundColor: '#FFA500' },
                      urgency === level && level === 'none' && { backgroundColor: colors.blue },
                    ]}
                    onPress={() => setUrgency(level)}
                  >
                    <Typography 
                      variant="bodySmall" 
                      color={urgency === level ? colors.white : colors.black}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </Typography>
                  </Pressable>
                ))}
              </View>
            </Animated.View>
            
            {/* Pain Score */}
            <Animated.View 
              entering={FadeInDown.delay(500).springify()}
              style={styles.notesSection}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                <Typography variant="bodyBold" style={styles.inputTitle}>Pain level?</Typography>
                <Typography variant="h3" color={painScore > 7 ? colors.pink : painScore > 4 ? '#FFA500' : colors.blue}>
                  {painScore}/10
                </Typography>
              </View>
              <View style={styles.painSliderContainer}>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                  <Pressable
                    key={score}
                    style={[
                      styles.painDot,
                      painScore >= score && styles.painDotActive,
                      painScore >= score && score > 7 && { backgroundColor: colors.pink },
                      painScore >= score && score > 4 && score <= 7 && { backgroundColor: '#FFA500' },
                      painScore >= score && score <= 4 && { backgroundColor: colors.blue },
                    ]}
                    onPress={() => setPainScore(score)}
                  />
                ))}
              </View>
            </Animated.View>
            
            {/* Incomplete Evacuation */}
            <Animated.View 
              entering={FadeInDown.delay(550).springify()}
              style={styles.notesSection}
            >
              <Pressable
                style={[
                  styles.checkboxRow,
                  incompleteEvacuation && styles.checkboxRowActive
                ]}
                onPress={() => setIncompleteEvacuation(!incompleteEvacuation)}
              >
                <View style={[
                  styles.checkbox,
                  incompleteEvacuation && styles.checkboxActive
                ]}>
                  {incompleteEvacuation && (
                    <IconContainer
                      name="checkmark"
                      size={20}
                      iconSize={14}
                      color={colors.white}
                      variant="transparent"
                      shadow={false}
                    />
                  )}
                </View>
                <Typography variant="bodySmall" color={colors.black}>
                  Felt incomplete evacuation
                </Typography>
              </Pressable>
            </Animated.View>
          </>
        
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Submit Button */}
      <Animated.View 
        entering={FadeInDown.delay(700).springify()}
        style={styles.submitContainer}
      >
        <Button
          title="Log My Moment"
          onPress={handleSubmit}
          variant="primary"
          color={colors.black}
          icon="happy"
          disabled={!isValid}
          size="lg"
          style={{ width: '100%' }}
        />
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  bottomPadding: {
    height: 100,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.black + '20',
    borderRadius: 6,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checkboxActive: {
    backgroundColor: colors.pink,
    borderColor: colors.pink,
  },
  checkboxRow: {
    alignItems: 'center',
    backgroundColor: colors.white,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  checkboxRowActive: {
    backgroundColor: colors.pink + '05',
    borderColor: colors.pink,
  },
  container: {
    flex: 1,
  },
  foodTag: {
    alignItems: 'center',
    backgroundColor: colors.pink + '15',
    borderRadius: radii.full,
    flexDirection: 'row',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  foodTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  inputTitle: {
    color: colors.black,
    fontFamily: fonts.bodyBold,
    fontSize: fontSizes.sm,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  notesSection: {
    marginVertical: spacing.lg,
  },
  painDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0', // Darker gray for better visibility
    borderWidth: 1,
    borderColor: '#D0D0D0',
  },
  painDotActive: {
    // handled inline
  },
  painSliderContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xs,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  submitContainer: {
    backgroundColor: colors.background,
    bottom: 0,
    left: 0,
    padding: spacing.lg,
    paddingBottom: spacing['4xl'],
    position: 'absolute',
    right: 0, // or transparent with gradient
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  symptomsSection: {
    marginVertical: spacing.lg,
  },
  titleContainer: {
    alignItems: 'center',
  },
  urgencyButton: {
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    borderRadius: radii.xl,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  urgencyButtonActive: {
    // handled inline
  },
});
