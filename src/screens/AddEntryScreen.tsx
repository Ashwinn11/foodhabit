import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
} from 'react-native';
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radii, shadows, fontSizes, fonts } from '../theme';
import { useGutStore, MoodType, BristolType } from '../store';
import {
  PhotoPlaceholder,
  MoodPicker,
  BristolPicker,
  SymptomToggle,
  ScreenWrapper,
  BoxButton,
} from '../components';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type AddEntryScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export const AddEntryScreen: React.FC<AddEntryScreenProps> = ({ navigation }) => {
  const { addGutMoment } = useGutStore();
  
  const [mood, setMood] = useState<MoodType | undefined>(undefined);
  const [bristolType, setBristolType] = useState<BristolType | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [symptoms, setSymptoms] = useState({
    bloating: false,
    gas: false,
    cramping: false,
    nausea: false,
  });
  
  const buttonScale = useSharedValue(1);
  
  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));
  
  const handleSubmit = () => {
    if (!mood) return;
    
    addGutMoment({
      timestamp: new Date(),
      mood,
      bristolType,
      notes: notes || undefined,
      symptoms,
    });
    
    navigation.goBack();
  };
  
  const handlePressIn = () => {
    buttonScale.value = withSpring(0.95);
  };
  
  const handlePressOut = () => {
    buttonScale.value = withSpring(1);
  };
  
  const toggleSymptom = (symptom: keyof typeof symptoms) => {
    setSymptoms(prev => ({ ...prev, [symptom]: !prev[symptom] }));
  };
  
  const isValid = mood !== undefined;
  
  return (
    <ScreenWrapper style={styles.container} edges={['top']}>
      {/* Header */}
      <Animated.View 
        entering={FadeIn.delay(100)}
        style={styles.header}
      >
        <BoxButton 
          icon="arrow-back" 
          onPress={() => navigation.goBack()}
          size={44}
        />
        
        <View style={styles.titleContainer}>
          <Text style={styles.titleNew}>New</Text>
          <Text style={styles.titleMoment}>Gut Moment</Text>
        </View>
        
        <BoxButton 
          icon="sparkles" 
          onPress={() => {}}
          size={44}
          color={colors.blue}
          style={{ backgroundColor: colors.white }} 
        />
      </Animated.View>
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo Placeholder */}
        <Animated.View 
          entering={FadeInDown.delay(200).springify()}
          style={styles.photoSection}
        >
          <PhotoPlaceholder
            size={140}
            onPress={() => {
              // Would open camera/gallery
              console.log('Open camera');
            }}
          />
        </Animated.View>
        
        {/* Mood Picker */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <MoodPicker selected={mood} onSelect={setMood} />
        </Animated.View>
        
        {/* Bristol Type Picker */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <BristolPicker selected={bristolType} onSelect={setBristolType} />
        </Animated.View>
        
        {/* Symptoms */}
        <Animated.View 
          entering={FadeInDown.delay(500).springify()}
          style={styles.symptomsSection}
        >
          <Text style={styles.sectionTitle}>Any symptoms?</Text>
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
              iconName="cloud-outline" // Closest to gas/wind
              active={symptoms.gas}
              onToggle={() => toggleSymptom('gas')}
              color={colors.blue}
            />
            <SymptomToggle
              label="Cramping"
              iconName="flash-outline" // Pain zap
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
        </Animated.View>
        
        {/* Notes */}
        <Animated.View 
          entering={FadeInDown.delay(600).springify()}
          style={styles.notesSection}
        >
          <Text style={styles.inputTitle}>Any notes?</Text>
          <View style={styles.inputCard}>
            <TextInput
              style={styles.notesInput}
              placeholder="How are you feeling?"
              placeholderTextColor={colors.black + '40'}
              value={notes}
              onChangeText={setNotes}
              multiline
            />
            <View style={[styles.inputIconCircle, { backgroundColor: colors.pink + '15' }]}>
                <Ionicons name="pencil" size={18} color={colors.pink} />
            </View>
          </View>
        </Animated.View>
        
        {/* Bottom padding for button */}
        <View style={styles.bottomPadding} />
      </ScrollView>
      
      {/* Submit Button */}
      <Animated.View 
        entering={FadeInDown.delay(700).springify()}
        style={styles.submitContainer}
      >
        <Pressable
          onPress={handleSubmit}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={!isValid}
        >
          <Animated.View
            style={[
              styles.submitButton,
              !isValid && styles.submitButtonDisabled,
              buttonAnimatedStyle,
            ]}
          >
            <Text style={styles.submitButtonText}>Add My Moment</Text>
            <Ionicons name="paw" size={20} color={colors.white} style={{marginLeft: 8}} />
          </Animated.View>
        </Pressable>
      </Animated.View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  titleContainer: {
    alignItems: 'center',
  },
  titleNew: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.bodyBold,
    color: colors.black + '99',
  },
  titleMoment: {
    fontSize: fontSizes['2xl'],
    fontFamily: fonts.heading, // Chewy
    color: colors.pink,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  symptomsSection: {
    marginVertical: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.heading, // Chewy
    color: colors.black,
    marginBottom: spacing.md,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  notesSection: {
    marginVertical: spacing.lg,
  },
  inputTitle: {
    fontSize: fontSizes.sm,
    fontFamily: fonts.bodyBold,
    color: colors.black,
    marginBottom: spacing.sm,
    marginLeft: 4,
  },
  inputCard: {
    backgroundColor: colors.white,
    borderRadius: radii.xl,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  inputIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: colors.pink,
  },
  notesInput: {
    flex: 1,
    fontSize: fontSizes.md,
    fontFamily: fonts.body,
    color: colors.black,
    minHeight: 40,
  },
  bottomPadding: {
    height: 120,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
    backgroundColor: 'transparent', // Let gradient show through
  },
  submitButton: {
    backgroundColor: colors.black, // Use theme black for consistency
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radii['2xl'],
    ...shadows.md,
  },
  submitButtonDisabled: {
    backgroundColor: colors.black + '40',
  },
  submitButtonText: {
    fontSize: fontSizes.lg,
    fontFamily: fonts.bodyBold,
    color: colors.white,
  },
});
