import React, { useEffect } from 'react';
import { View, ScrollView, Pressable, Dimensions } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Star, ShieldCheck, Zap, ScanLine, ChefHat, Sparkles, Activity as ActivityIcon } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressDots } from '@/components/ui/ProgressDots';
import AnimatedMascot from '@/components/AnimatedMascot';
import { colors, shadows } from '@/theme';

const { width } = Dimensions.get('window');
const columnWidth = (width - 48 - 12) / 2;

const reviews = [
    { name: 'Sarah J.', text: 'Found my trigger in week 1. Incredible.', rating: 5 },
    { name: 'Mark T.', text: 'The menu scanner is a game changer.', rating: 5 },
    { name: 'Chloe R.', text: 'Finally eating without fear.', rating: 5 },
];

const features = [
    { icon: Zap, title: 'Find Triggers', desc: 'Identify patterns your doctor can\'t.', color: '#EA580C', bg: '#FFF7ED' },
    { icon: ScanLine, title: 'Menu Scanner', desc: 'Find safe dishes in any restaurant.', color: '#2D7A52', bg: '#E8F5EE' },
    { icon: ChefHat, title: 'Safe Recipes', desc: 'Meals tailored to your gut score.', color: '#7C3AED', bg: '#F5F3FF' },
    { icon: ShieldCheck, title: 'Dual Verdicts', desc: 'Science vs Personal safety ratings.', color: '#0369A1', bg: '#EFF6FF' },
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
                        <ProgressDots total={7} current={1} />
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 }}>
                    <Animated.View entering={FadeInUp.delay(100)} style={{ alignItems: 'center', marginTop: 12 }}>
                        <AnimatedMascot size={100} expression="happy" />
                        <Text variant="heading" color={colors.text1} style={{ textAlign: 'center', marginTop: 16 }}>
                            Here's what happens
                        </Text>
                        <Text variant="body" color={colors.text2} style={{ textAlign: 'center', marginTop: 4 }}>
                            How we help you get back to eating freely
                        </Text>
                    </Animated.View>

                    <View style={{ marginTop: 24, flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                        {features.map((f, i) => (
                            <Animated.View
                                key={i}
                                entering={FadeInUp.delay(200 + i * 100)}
                                style={{
                                    width: columnWidth,
                                    backgroundColor: colors.surface,
                                    padding: 16,
                                    borderRadius: 24,
                                    ...shadows.card,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            >
                                <View style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: f.bg, alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                                    <f.icon size={22} color={f.color} strokeWidth={2.5} />
                                </View>
                                <Text variant="bodyBold" color={colors.text1} style={{ fontSize: 15 }}>{f.title}</Text>
                                <Text variant="caption" color={colors.text2} style={{ marginTop: 4, lineHeight: 14 }}>{f.desc}</Text>
                            </Animated.View>
                        ))}
                    </View>

                    <View style={{ marginTop: 32 }}>
                        <Text variant="labelBold" color={colors.text3} style={{ textTransform: 'uppercase', letterSpacing: 1.5, fontSize: 10 }}>
                            Real Success Stories
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, marginTop: 12 }}>
                            {reviews.map((r, i) => (
                                <Animated.View key={i} entering={FadeInRight.delay(600 + i * 100)}>
                                    <View style={{
                                        width: 220,
                                        padding: 16,
                                        backgroundColor: 'rgba(255,255,255,0.6)',
                                        borderRadius: 20,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}>
                                        <View style={{ flexDirection: 'row', gap: 2, marginBottom: 8 }}>
                                            {[...Array(r.rating)].map((_, j) => (
                                                <Star key={j} size={10} color={colors.amber.DEFAULT} fill={colors.amber.DEFAULT} />
                                            ))}
                                        </View>
                                        <Text variant="caption" color={colors.text1} style={{ fontStyle: 'italic', lineHeight: 16 }}>"{r.text}"</Text>
                                        <Text variant="caption" color={colors.text3} style={{ marginTop: 6, fontSize: 10 }}>— {r.name}</Text>
                                    </View>
                                </Animated.View>
                            ))}
                        </ScrollView>
                    </View>

                    <Animated.View entering={FadeInUp.delay(1000)} style={{ marginTop: 40 }}>
                        <Button
                            title="Continue to profile"
                            onPress={() => router.push('/(onboarding)/profile')}
                            fullWidth
                        />
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
