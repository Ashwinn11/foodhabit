import React from 'react';
import { View, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, TrendingDown, UtensilsCrossed } from 'lucide-react-native';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { GutBuddyMascot } from '@/components/mascot/GutBuddy';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { colors } from '@/theme';

const features = [
    { icon: Search, title: 'No generic advice', desc: 'Every verdict is specific to you' },
    { icon: TrendingDown, title: 'Built from your data', desc: 'AI learns your personal triggers' },
    { icon: UtensilsCrossed, title: 'Gets smarter daily', desc: 'More logs = better predictions' },
];

export default function WelcomeScreen(): React.JSX.Element {
    const router = useRouter();

    return (
        <LinearGradient
            colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <ProgressDots total={5} current={0} />
                <ScrollView
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingHorizontal: 28,
                        paddingBottom: 32,
                    }}
                >
                    <GutBuddyMascot expression="happy" size={100} />

                    <Text
                        variant="heading"
                        color={colors.text1}
                        style={{ marginTop: 24, textAlign: 'center', lineHeight: 26 }}
                    >
                        Your gut is personal.{'\n'}Your answers should be too.
                    </Text>

                    <Text
                        variant="label"
                        color={colors.text2}
                        style={{ marginTop: 12, textAlign: 'center', lineHeight: 18 }}
                    >
                        Most gut health advice is generic. Gut Buddy learns your specific triggers from your own data. The more you log, the smarter it gets.
                    </Text>

                    <View style={{ marginTop: 32, gap: 16 }}>
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <View
                                    key={feature.title}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        gap: 14,
                                        backgroundColor: colors.surface,
                                        borderRadius: 14,
                                        padding: 16,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 10,
                                            backgroundColor: colors.primary.light,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Icon size={20} color={colors.primary.DEFAULT} />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text variant="bodyBold" color={colors.text1}>{feature.title}</Text>
                                        <Text variant="caption" color={colors.text2}>{feature.desc}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={{ marginTop: 32 }}>
                        <Button
                            title="Let's figure this out"
                            onPress={() => router.push('/(onboarding)/profile')}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
