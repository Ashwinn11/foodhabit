import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { OnboardingScreen } from '../../components/Onboarding';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useNavigation } from '@react-navigation/native';
import { Typography, IconContainer } from '../../components';
import { colors, spacing } from '../../theme';
import Animated, { FadeIn } from 'react-native-reanimated';

const INACTIVE_COLOR = colors.black + '40';

// --- DATA DEFINITIONS ---

const SYMPTOMS = [
    { id: 'gas', label: 'Gas / Smells', icon: 'thunderstorm', color: colors.yellow },
    { id: 'bloating', label: 'Bloating', icon: 'cloud', color: colors.blue },
    { id: 'fatigue', label: 'Brain Fog / Fatigue', icon: 'battery-dead', color: colors.blue },
    { id: 'acne', label: 'Acne / Skin issues', icon: 'alert-circle', color: colors.pink },
    { id: 'weight', label: 'Stubborn Weight', icon: 'speedometer', color: colors.pink },
    { id: 'constipation', label: 'Constipation', icon: 'cube', color: colors.yellow },
    { id: 'diarrhea', label: 'Diarrhea', icon: 'rainy', color: colors.blue },
];

const FREQUENCY_OPTIONS = [
    { id: 0, label: 'Rarely', icon: 'happy', color: colors.green },
    { id: 1, label: 'Weekly', icon: 'calendar', color: colors.yellow },
    { id: 2, label: 'Daily', icon: 'warning', color: colors.pink },
];

const STOOL_OPTIONS = [
    { id: 0, label: 'Hard / Difficult', icon: 'stop', color: colors.pink },
    { id: 1, label: 'Slightly Hard', icon: 'cube', color: colors.yellow },
    { id: 2, label: 'Smooth (Ideal)', icon: 'checkmark-circle', color: colors.green },
    { id: 3, label: 'Loose / Mushy', icon: 'water', color: colors.yellow },
    { id: 4, label: 'Watery', icon: 'rainy', color: colors.pink },
];

const REGULARITY_OPTIONS = [
    { id: 0, label: '1-3x Daily', icon: 'time', color: colors.green },
    { id: 1, label: '1x Daily/Every other', icon: 'hourglass', color: colors.yellow },
    { id: 2, label: 'Unpredictable', icon: 'shuffle', color: colors.pink },
];

const MEDICAL_OPTIONS = [
    { id: false, label: 'No', icon: 'shield-checkmark', color: colors.green },
    { id: true, label: 'Yes', icon: 'medkit', color: colors.pink },
];

export const OnboardingQuizScreen = () => {
  const navigation = useNavigation<any>();
  const { totalSteps, setCurrentStep, setGutCheckAnswer, calculateScore } = useOnboardingStore();
  const [currentQuizPage, setCurrentQuizPage] = useState(0); // 0 or 1
  
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [selectedFreq, setSelectedFreq] = useState<number | null>(null);

  const [selectedStool, setSelectedStool] = useState<number | null>(null);
  const [selectedReg, setSelectedReg] = useState<number | null>(null);
  const [selectedMedical, setSelectedMedical] = useState<boolean | null>(null);

  const handleNext = () => {
      if (currentQuizPage === 0) {
          if (selectedSymptoms.length === 0 || selectedFreq === null) return;
          // Note: We could save symptoms to store if needed, but frequency is the key metric
          setGutCheckAnswer('symptomFrequency', selectedFreq);
          setCurrentQuizPage(1);
      } else {
          if (selectedStool === null || selectedReg === null || selectedMedical === null) return;
          
          setGutCheckAnswer('stoolConsistency', selectedStool);
          setGutCheckAnswer('bowelRegularity', selectedReg);
          setGutCheckAnswer('medicalFlags', selectedMedical);
          
          calculateScore();
          setCurrentStep(1);
          navigation.navigate('OnboardingResults');
      }
  };

  const handleBack = () => {
      if (currentQuizPage === 1) {
          setCurrentQuizPage(0);
      } else {
          if (navigation.canGoBack()) {
              navigation.goBack();
          }
          // If we can't go back, we just stay on step 0 of the quiz
          setCurrentStep(0);
      }
  };

  const toggleSymptom = (id: string) => {
      if (selectedSymptoms.includes(id)) {
          setSelectedSymptoms(prev => prev.filter(s => s !== id));
      } else {
          setSelectedSymptoms(prev => [...prev, id]);
      }
  };

  const isPage1Valid = selectedSymptoms.length > 0 && selectedFreq !== null;
  const isPage2Valid = selectedStool !== null && selectedReg !== null && selectedMedical !== null;

  return (
    <OnboardingScreen
      currentStep={1}
      totalSteps={totalSteps}
      title={currentQuizPage === 0 ? "What's bothering you?" : "The Biological Check"}
      subtitle={currentQuizPage === 0 ? "Select all that apply & frequency" : "Let's look at your gut signs"}
      onNext={handleNext}
      onBack={handleBack}
      showBackButton={currentQuizPage === 1}
      nextLabel={currentQuizPage === 0 ? "Next: Gut Check" : "Analyze My Gut"}
      nextDisabled={currentQuizPage === 0 ? !isPage1Valid : !isPage2Valid}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.xl }}>
        
        {currentQuizPage === 0 && (
            <Animated.View entering={FadeIn}>
                <Typography variant="bodyBold" style={styles.sectionTitle}>I'm struggling with:</Typography>
                <View style={styles.grid}>

                    {SYMPTOMS.map((s) => {
                        const isSelected = selectedSymptoms.includes(s.id);
                        return (
                            <TouchableOpacity 
                                key={s.id} 
                                style={[styles.gridItem, isSelected && { borderColor: s.color }]}
                                onPress={() => toggleSymptom(s.id)}
                            >
                                <IconContainer 
                                    name={s.icon as any} 
                                    size={44} 
                                    iconSize={24} 
                                    color={isSelected ? s.color : INACTIVE_COLOR} 
                                    variant={isSelected ? 'solid' : 'transparent'}
                                    shadow={false}
                                />
                                <Typography variant="caption" style={{marginTop: 8, textAlign: 'center', fontSize: 11, lineHeight: 14 }}>{s.label}</Typography>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Typography variant="bodyBold" style={[styles.sectionTitle, { marginTop: spacing.lg }]}>How often do you feel this?</Typography>
                <View style={styles.row}>
                    {FREQUENCY_OPTIONS.map((opt) => (
                        <SelectableCard 
                            key={opt.id} 
                            item={opt} 
                            isSelected={selectedFreq === opt.id} 
                            onSelect={() => setSelectedFreq(opt.id)} 
                        />
                    ))}
                </View>
            </Animated.View>
        )}

        {currentQuizPage === 1 && (
             <Animated.View entering={FadeIn}>
                <QuestionBlock title="1. Stool Consistency" options={STOOL_OPTIONS} selected={selectedStool} onSelect={setSelectedStool} />
                <QuestionBlock title="2. Regularity" options={REGULARITY_OPTIONS} selected={selectedReg} onSelect={setSelectedReg} />
                <QuestionBlock title="3. Blood or Mucus?" options={MEDICAL_OPTIONS} selected={selectedMedical} onSelect={setSelectedMedical} />
             </Animated.View>
        )}

      </ScrollView>
    </OnboardingScreen>
  );
};

// --- SUB COMPONENTS ---

const SelectableCard = ({ item, isSelected, onSelect }: any) => (
    <TouchableOpacity 
        style={[styles.smallCard, isSelected && { borderColor: item.color }]}
        onPress={onSelect}
    >
        <IconContainer 
            name={item.icon} 
            size={40} 
            iconSize={20} 
            color={isSelected ? item.color : INACTIVE_COLOR} 
            variant={isSelected ? 'solid' : 'transparent'}
            shadow={false}
        />
        <Typography variant="caption" style={{ marginTop: 4 }}>{item.label}</Typography>
    </TouchableOpacity>
);

const QuestionBlock = ({ title, options, selected, onSelect }: any) => (
    <View style={{ marginBottom: spacing.lg }}>
        <Typography variant="bodyBold" style={{ marginBottom: spacing.md }}>{title}</Typography>
        {options.map((opt: any) => {
             const isSelected = selected === opt.id;
             return (
                <TouchableOpacity 
                    key={JSON.stringify(opt.id)}
                    style={[styles.listOption, isSelected && { borderColor: opt.color }]}
                    onPress={() => onSelect(opt.id)}
                >
                     <IconContainer 
                        name={opt.icon} 
                        size={48} 
                        iconSize={24} 
                        color={isSelected ? opt.color : INACTIVE_COLOR} 
                        variant={isSelected ? 'solid' : 'transparent'}
                        shadow={false}
                        shape="circle"
                     />
                     <Typography variant="body" style={{ flex: 1, marginLeft: spacing.md }}>{opt.label}</Typography>
                     {isSelected && <IconContainer name="checkmark-circle" size={24} color={opt.color} variant="transparent" />}
                </TouchableOpacity>
             );
        })}
    </View>
);

const styles = StyleSheet.create({
  sectionTitle: { marginBottom: spacing.md, fontSize: 18, marginLeft: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  gridItem: { 
      width: '30%', 
      height: 110, // Fixed height to accommodate text
      justifyContent: 'center', 
      alignItems: 'center', 
      borderRadius: 24, 
      backgroundColor: colors.white,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: 'transparent',
      paddingHorizontal: 4,
  },
  row: { flexDirection: 'row', gap: 12 },
  smallCard: {
      flex: 1,
      padding: spacing.md,
      alignItems: 'center',
      borderRadius: 24,
      backgroundColor: colors.white,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: 'transparent',
  },
  listOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      borderRadius: 24,
      marginBottom: spacing.md, // More space
      backgroundColor: colors.white,
      shadowColor: colors.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
      borderWidth: 1,
      borderColor: 'transparent',
  },
  iconBox: {
      width: 48, // Bigger touch targets
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
  }
});
