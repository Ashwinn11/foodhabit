import React from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, ShieldCheck, Zap, HeartPulse, Sparkles, Activity as ActivityIcon } from 'lucide-react-native';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { colors } from '@/theme';

const reviews = [
    { name: 'Sarah J.', text: 'Finally found what was causing my bloating! The personalized plan is a lifesaver.', rating: 5 },
    { name: 'Mark T.', text: 'Simple to log and the insights are actually useful. Highly recommend.', rating: 5 },
];

const features = [
    { icon: Sparkles, title: 'AI Recipe Generation', desc: 'Custom meal planning that avoids your specific gut triggers.' },
    { icon: Zap, title: 'Deep Pattern Insights', desc: 'Our AI finds hidden links between your symptoms and foods.' },
    { icon: ActivityIcon, title: 'Smart Menu Picks', desc: 'Instantly find the healthiest, safest option on any menu.' },
    { icon: ShieldCheck, title: 'Dish Analysis', desc: 'Detailed safety breakdown for any ingredient or recipe.' },
];

export default function BenefitsScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();

    return (
        <LinearGradient
            colors={[colors.gradient.start, colors.gradient.mid, colors.gradient.end]}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 56, flexDirection: 'row', alignItems: 'center' }}>
                    <Pressable
                        onPress={() => navigation.canGoBack() && router.back()}
                        style={{ padding: 16, position: 'absolute', left: 0, zIndex: 10 }}
                    >
                        <ChevronLeft size={24} color={colors.text1} />
                    </Pressable>
                    <View style={{ flex: 1, paddingHorizontal: 70 }}>
                        <ProgressDots total={7} current={4} />
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}>
                    <Text variant="heading" color={colors.text1} style={{ textAlign: 'center', marginTop: 24 }}>
                        How Gut Buddy Helps ✨
                    </Text>

                    <View style={{ marginTop: 32, gap: 16 }}>
                        {features.map((f, i) => (
                            <View key={i} style={{ flexDirection: 'row', gap: 16, alignItems: 'center' }}>
                                <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: colors.primary.light, alignItems: 'center', justifyContent: 'center' }}>
                                    <f.icon size={22} color={colors.primary.DEFAULT} fill={colors.primary.DEFAULT} fillOpacity={0.2} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text variant="bodyBold" color={colors.text1}>{f.title}</Text>
                                    <Text variant="caption" color={colors.text2}>{f.desc}</Text>
                                </View>
                            </View>
                        ))}
                    </View>

                    <View style={{ marginTop: 40 }}>
                        <Text variant="labelBold" color={colors.text2} style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                            Success Stories
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, marginTop: 12 }}>
                            {reviews.map((r, i) => (
                                <Card key={i} style={{ width: 260, padding: 16 }}>
                                    <View style={{ flexDirection: 'row', gap: 2, marginBottom: 8 }}>
                                        {[...Array(r.rating)].map((_, j) => (
                                            <Star key={j} size={14} color={colors.amber.DEFAULT} fill={colors.amber.DEFAULT} />
                                        ))}
                                    </View>
                                    <Text variant="body" color={colors.text1} style={{ fontStyle: 'italic' }}>"{r.text}"</Text>
                                    <Text variant="caption" color={colors.text3} style={{ marginTop: 8 }}>— {r.name}</Text>
                                </Card>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={{ flex: 1 }} />

                    <View style={{ marginTop: 40 }}>
                        <Button
                            title="Get my custom plan"
                            onPress={() => router.push('/(onboarding)/notifications')}
                            fullWidth
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
