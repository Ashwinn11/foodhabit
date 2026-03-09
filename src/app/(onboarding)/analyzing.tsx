import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check } from 'lucide-react-native';
import Animated, { FadeInUp, FadeIn } from 'react-native-reanimated';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme';

const steps = [
    "Analyzing your gut profile...",
    "Correlating symptoms and hidden patterns...",
    "Learning your sensitivity to 32 common triggers...",
    "Crafting your custom AI recipe engine...",
    "Finalizing your 6-week gut health roadmap..."
];

export default function AnalyzingScreen(): React.JSX.Element {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentStep(prev => {
                if (prev < steps.length - 1) return prev + 1;
                return prev;
            });
        }, 1200);

        const timeout = setTimeout(() => {
            router.replace('/(onboarding)/results');
        }, 5500);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    return (
        <LinearGradient
            colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }}>
                <ActivityIndicator size="large" color={colors.primary.DEFAULT} style={{ marginBottom: 40 }} />

                <Text variant="heading" color={colors.text1} style={{ textAlign: 'center', marginBottom: 32 }}>
                    Personalizing Your Results
                </Text>

                <View style={{ width: '100%', gap: 16 }}>
                    {steps.map((step, index) => (
                        <View key={index} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                            <View style={{
                                width: 24,
                                height: 24,
                                borderRadius: 12,
                                backgroundColor: index <= currentStep ? colors.primary.DEFAULT : colors.stone,
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                {index <= currentStep && (
                                    <Animated.View entering={FadeIn}>
                                        <Check size={14} color="#FFF" strokeWidth={3} />
                                    </Animated.View>
                                )}
                            </View>
                            <Text
                                variant="body"
                                color={index <= currentStep ? colors.text1 : colors.text3}
                                style={{ flex: 1, opacity: index === currentStep ? 1 : index < currentStep ? 0.7 : 0.4 }}
                            >
                                {step}
                            </Text>
                        </View>
                    ))}
                </View>

                <Animated.View entering={FadeIn.delay(4000)} style={{ marginTop: 40 }}>
                    <Text variant="caption" color={colors.text3} style={{ fontStyle: 'italic' }}>
                        Almost ready...
                    </Text>
                </Animated.View>
            </SafeAreaView>
        </LinearGradient>
    );
}
