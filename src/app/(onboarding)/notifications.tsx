import React, { useState } from 'react';
import { View, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, Clock } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import { Text } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ProgressDots } from '@/components/ui/ProgressDots';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';

interface ReminderTime {
    label: string;
    hour: number;
    minute: number;
    enabled: boolean;
}

export default function NotificationsScreen(): React.JSX.Element {
    const router = useRouter();
    const navigation = useNavigation();
    const { updateProfile } = useAuthStore();
    const [reminders, setReminders] = useState<ReminderTime[]>([
        { label: 'Breakfast reminder', hour: 8, minute: 0, enabled: true },
        { label: 'Lunch reminder', hour: 12, minute: 30, enabled: true },
        { label: 'Dinner reminder', hour: 19, minute: 0, enabled: true },
    ]);
    const [eveningCheckin, setEveningCheckin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [permissionGranted, setPermissionGranted] = useState(false);

    const formatTime = (hour: number, minute: number): string => {
        const h = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const m = minute.toString().padStart(2, '0');
        const ampm = hour >= 12 ? 'PM' : 'AM';
        return `${h}:${m} ${ampm}`;
    };

    // Phase 1: Request OS permission
    const handleRequestPermission = async (): Promise<void> => {
        setLoading(true);
        try {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === 'granted') {
                // Stay on screen — enable all toggles so user can customize
                setPermissionGranted(true);
                setReminders(prev => prev.map(r => ({ ...r, enabled: true })));
                setEveningCheckin(true);
            } else {
                // Denied — mark disabled and move on
                await updateProfile({ notifications_enabled: false });
                router.push('/(onboarding)/plan');
            }
        } catch (error) {
            console.error('Permission request error:', error);
            router.push('/(onboarding)/plan');
        } finally {
            setLoading(false);
        }
    };

    // Phase 2: Schedule selected reminders and navigate
    const handleSave = async (): Promise<void> => {
        setLoading(true);
        try {
            await updateProfile({ notifications_enabled: true });
            await Notifications.cancelAllScheduledNotificationsAsync();

            for (const reminder of reminders) {
                if (reminder.enabled) {
                    await Notifications.scheduleNotificationAsync({
                        content: {
                            title: 'Time to log your meal',
                            body: `Every entry helps find your triggers.`,
                        },
                        trigger: {
                            type: Notifications.SchedulableTriggerInputTypes.DAILY,
                            hour: reminder.hour,
                            minute: reminder.minute,
                        },
                    });
                }
            }

            if (eveningCheckin) {
                await Notifications.scheduleNotificationAsync({
                    content: {
                        title: "How's your gut today?",
                        body: 'Log your symptoms before bed.',
                    },
                    trigger: {
                        type: Notifications.SchedulableTriggerInputTypes.DAILY,
                        hour: 21,
                        minute: 0,
                    },
                });
            }

            router.push('/(onboarding)/plan');
        } catch (error) {
            console.error('Save reminders error:', error);
            router.push('/(onboarding)/plan');
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
                        <ProgressDots total={7} current={5} />
                    </View>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 28, paddingBottom: 32, flexGrow: 1 }}>
                    <View style={{ alignItems: 'center', marginTop: 24 }}>
                        <View style={{
                            width: 56, height: 56, borderRadius: 14,
                            backgroundColor: colors.primary.light,
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Bell size={28} color={colors.primary.DEFAULT} />
                        </View>
                    </View>

                    <Text variant="heading" color={colors.text1} style={{ marginTop: 20, textAlign: 'center' }}>
                        Stay on track with reminders
                    </Text>
                    <Text variant="label" color={colors.text2} style={{ marginTop: 8, textAlign: 'center', lineHeight: 18 }}>
                        Consistent logging helps detect your triggers. Enable reminders to make it easier — you can adjust these anytime.
                    </Text>

                    <View style={{ marginTop: 28, gap: 12 }}>
                        {reminders.map((reminder, index) => (
                            <Card key={reminder.label} animated={true} delay={index * 80}>
                                <Pressable
                                    onPress={() => {
                                        const updated = [...reminders];
                                        updated[index] = { ...updated[index], enabled: !updated[index].enabled };
                                        setReminders(updated);
                                    }}
                                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                                >
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <Clock size={18} color={colors.text2} />
                                        <View>
                                            <Text variant="bodyBold" color={colors.text1}>{reminder.label}</Text>
                                            <Text variant="caption" color={colors.text2}>
                                                {formatTime(reminder.hour, reminder.minute)}
                                            </Text>
                                        </View>
                                    </View>
                                    <View
                                        style={{
                                            width: 44, height: 26, borderRadius: 13,
                                            backgroundColor: reminder.enabled ? colors.primary.DEFAULT : colors.stone,
                                            justifyContent: 'center',
                                            paddingHorizontal: 2,
                                        }}
                                    >
                                        <View
                                            style={{
                                                width: 22, height: 22, borderRadius: 11,
                                                backgroundColor: '#FFFFFF',
                                                alignSelf: reminder.enabled ? 'flex-end' : 'flex-start',
                                            }}
                                        />
                                    </View>
                                </Pressable>
                            </Card>
                        ))}

                        <Card animated={true} delay={240}>
                            <Pressable
                                onPress={() => setEveningCheckin(!eveningCheckin)}
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                            >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                    <Clock size={18} color={colors.text2} />
                                    <View>
                                        <Text variant="bodyBold" color={colors.text1}>Evening symptom check-in</Text>
                                        <Text variant="caption" color={colors.text2}>9:00 PM</Text>
                                    </View>
                                </View>
                                <View
                                    style={{
                                        width: 44, height: 26, borderRadius: 13,
                                        backgroundColor: eveningCheckin ? colors.primary.DEFAULT : colors.stone,
                                        justifyContent: 'center',
                                        paddingHorizontal: 2,
                                    }}
                                >
                                    <View
                                        style={{
                                            width: 22, height: 22, borderRadius: 11,
                                            backgroundColor: '#FFFFFF',
                                            alignSelf: eveningCheckin ? 'flex-end' : 'flex-start',
                                        }}
                                    />
                                </View>
                            </Pressable>
                        </Card>
                    </View>

                    <View style={{ flex: 1 }} />

                    <View style={{ gap: 12, marginTop: 32 }}>
                        {!permissionGranted ? (
                            <>
                                <Button title="Enable Notifications" onPress={handleRequestPermission} loading={loading} fullWidth />
                                <Button
                                    title="Not Now"
                                    variant="ghost"
                                    onPress={() => router.push('/(onboarding)/plan')}
                                    fullWidth
                                />
                            </>
                        ) : (
                            <Button title="Save Reminders" onPress={handleSave} loading={loading} fullWidth />
                        )}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
