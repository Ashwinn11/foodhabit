import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

const conditionOptions = [
    'IBS-D', 'IBS-C', 'IBS-M', 'Chronic Bloating', 'SIBO',
    'Lactose Intolerance', 'Gluten Sensitivity', "Crohn's",
    'Colitis', 'Not Diagnosed', 'Other',
];

export default function ConditionsScreen(): React.JSX.Element {
    const router = useRouter();
    const { updateProfile } = useAuthStore();
    const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
    const [triggerText, setTriggerText] = useState('');
    const [loading, setLoading] = useState(false);

    const toggleCondition = (condition: string): void => {
        setSelectedConditions(prev =>
            prev.includes(condition)
                ? prev.filter(c => c !== condition)
                : [...prev, condition]
        );
    };

    const handleContinue = async (): Promise<void> => {
        setLoading(true);
        try {
            const triggers = triggerText
                .split(',')
                .map(t => t.trim().toLowerCase())
                .filter(Boolean);

            await updateProfile({
                diagnosed_conditions: selectedConditions,
                known_triggers: triggers,
            });
            router.push('/(onboarding)/notifications');
        } catch (error) {
            console.error('Conditions update error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
                    <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
                        <ChevronLeft size={24} color={colors.text1} />
                    </Pressable>
                    <View style={{ flex: 1 }}>
                        <ProgressDots total={5} current={2} />
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 32, flexGrow: 1 }}>
                    <Text variant="heading" color={colors.text1} style={{ marginTop: 24 }}>
                        What are you dealing with?
                    </Text>
                    <Text variant="label" color={colors.text2} style={{ marginTop: 8, lineHeight: 18 }}>
                        Select all that apply. This immediately personalises your food badges — even before you log anything.
                    </Text>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 24 }}>
                        {conditionOptions.map(condition => (
                            <Chip
                                key={condition}
                                label={condition}
                                selected={selectedConditions.includes(condition)}
                                onPress={() => toggleCondition(condition)}
                            />
                        ))}
                    </View>

                    <View style={{ marginTop: 24 }}>
                        <Input
                            label="Known triggers"
                            placeholder="e.g. garlic, dairy, wheat"
                            value={triggerText}
                            onChangeText={setTriggerText}
                            multiline
                        />
                        <Text variant="caption" color={colors.text3} style={{ marginTop: 4 }}>
                            Separate with commas. These seed your Day 1 personalisation.
                        </Text>
                    </View>

                    <View style={{ flex: 1 }} />

                    <View style={{ gap: 12, marginTop: 32 }}>
                        <Button title="Continue" onPress={handleContinue} loading={loading} fullWidth />
                        <Button
                            title="Skip for now"
                            variant="ghost"
                            onPress={() => router.push('/(onboarding)/notifications')}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
