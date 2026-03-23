import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
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
import { analytics } from '@/lib/posthog';

const conditionOptions = [
    'IBS-D', 'IBS-C', 'IBS-M', 'Chronic Bloating', 'SIBO',
    'Lactose Intolerance', 'Gluten Sensitivity', "Crohn's",
    'Colitis', 'Not Diagnosed', 'Other',
];

export default function ConditionsScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();
    const { profile, updateProfile } = useAuthStore();
    const [selectedConditions, setSelectedConditions] = useState<string[]>(profile?.diagnosed_conditions || []);
    const [triggerText, setTriggerText] = useState(profile?.known_triggers?.join(', ') || '');
    const [loading, setLoading] = useState(false);

    // Sync from profile when it loads (e.g. on fresh app start)
    React.useEffect(() => {
        if (profile) {
            if (profile.diagnosed_conditions?.length && !selectedConditions.length) {
                setSelectedConditions(profile.diagnosed_conditions);
            }
            if (profile.known_triggers?.length && !triggerText) {
                setTriggerText(profile.known_triggers.join(', '));
            }
        }
    }, [profile]);

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
                .map((t: string) => t.trim().toLowerCase())
                .filter(Boolean);

            await updateProfile({
                diagnosed_conditions: selectedConditions,
                known_triggers: triggers,
            });
            analytics.onboardingStepCompleted('conditions', {
                conditions: selectedConditions,
                trigger_count: triggers.length,
            });
            router.push('/(onboarding)/analyzing');
        } catch (error) {
            console.error('Conditions update error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 56, flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable
                        onPress={() => navigation.canGoBack() && router.back()}
                        style={{ padding: 16, position: 'absolute', left: 0, zIndex: 10 }}
                    >
                        <ChevronLeft size={24} color={colors.text1} />
                    </Pressable>
                    <View style={{ flex: 1, paddingHorizontal: 70 }}>
                        <ProgressDots total={7} current={2} />
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 32, flexGrow: 1 }}>
                    <Text variant="heading" color={colors.text1} style={{ marginTop: 24 }}>
                        What are you dealing with?
                    </Text>
                    <Text variant="label" color={colors.text2} style={{ marginTop: 8, lineHeight: 18 }}>
                        Pick what applies. This changes your food ratings from day one, before you've logged anything.
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

                    <View style={{ marginTop: 32 }}>
                        <Button
                            title="Analyze My Gut"
                            onPress={handleContinue}
                            loading={loading}
                            disabled={selectedConditions.length === 0 && !triggerText.trim()}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
