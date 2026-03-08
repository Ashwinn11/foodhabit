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
import type { BiologicalSex, DietType } from '@/lib/database.types';

const sexOptions: { label: string; value: BiologicalSex }[] = [
    { label: 'Male', value: 'male' },
    { label: 'Female', value: 'female' },
    { label: 'Other', value: 'other' },
    { label: 'Prefer not to say', value: 'prefer_not_to_say' },
];

const dietOptions: { label: string; value: DietType }[] = [
    { label: 'Omnivore', value: 'omnivore' },
    { label: 'Vegetarian', value: 'vegetarian' },
    { label: 'Vegan', value: 'vegan' },
    { label: 'Gluten-free', value: 'gluten-free' },
    { label: 'Dairy-free', value: 'dairy-free' },
    { label: 'Low FODMAP', value: 'low-fodmap' },
];

export default function ProfileScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();
    const { profile, updateProfile } = useAuthStore();
    const [age, setAge] = useState(profile?.age?.toString() || '');
    const [sex, setSex] = useState<BiologicalSex | null>(profile?.biological_sex as BiologicalSex || null);
    const [diet, setDiet] = useState<DietType | null>(profile?.diet_type as DietType || null);
    const [loading, setLoading] = useState(false);

    // Sync from profile when it loads (e.g. on fresh app start)
    React.useEffect(() => {
        if (profile) {
            if (profile.age && !age) setAge(profile.age.toString());
            if (profile.biological_sex && !sex) setSex(profile.biological_sex as BiologicalSex);
            if (profile.diet_type && !diet) setDiet(profile.diet_type as DietType);
        }
    }, [profile]);

    const handleContinue = async (): Promise<void> => {
        setLoading(true);
        try {
            await updateProfile({
                age: age ? parseInt(age, 10) : null,
                biological_sex: sex,
                diet_type: diet,
            });
            router.push('/(onboarding)/conditions');
        } catch (error) {
            console.error('Profile update error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid]} style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16 }}>
                    {navigation.canGoBack() ? (
                        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
                            <ChevronLeft size={24} color={colors.text1} />
                        </Pressable>
                    ) : (
                        <View style={{ width: 40 }} />
                    )}
                    <View style={{ flex: 1 }}>
                        <ProgressDots total={5} current={1} />
                    </View>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 32, flexGrow: 1 }}>
                    <Text variant="heading" color={colors.text1} style={{ marginTop: 24 }}>
                        Tell us about yourself
                    </Text>
                    <Text variant="label" color={colors.text2} style={{ marginTop: 8, lineHeight: 18 }}>
                        Helps us personalise your food risk analysis from day one.
                    </Text>

                    {/* Age */}
                    <View style={{ marginTop: 28 }}>
                        <Input
                            label="Age"
                            placeholder="Your age"
                            keyboardType="number-pad"
                            value={age}
                            onChangeText={setAge}
                            maxLength={3}
                        />
                    </View>

                    {/* Biological Sex */}
                    <View style={{ marginTop: 24 }}>
                        <Text variant="label" color={colors.text2} style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                            Biological Sex
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {sexOptions.map(opt => (
                                <Chip
                                    key={opt.value}
                                    label={opt.label}
                                    selected={sex === opt.value}
                                    onPress={() => setSex(opt.value)}
                                />
                            ))}
                        </View>
                    </View>

                    {/* Diet Type */}
                    <View style={{ marginTop: 24 }}>
                        <Text variant="label" color={colors.text2} style={{ textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                            Diet Type
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                            {dietOptions.map(opt => (
                                <Chip
                                    key={opt.value}
                                    label={opt.label}
                                    selected={diet === opt.value}
                                    onPress={() => setDiet(opt.value)}
                                />
                            ))}
                        </View>
                    </View>

                    <View style={{ flex: 1 }} />

                    <View style={{ gap: 12, marginTop: 32 }}>
                        <Button
                            title="Continue"
                            onPress={handleContinue}
                            loading={loading}
                            disabled={!age && !sex && !diet}
                            fullWidth
                        />
                        <Button
                            title="Skip for now"
                            variant="ghost"
                            onPress={() => router.push('/(onboarding)/conditions')}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
