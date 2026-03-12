import React, { useState, useEffect } from 'react';
import { View, ScrollView, Pressable, Alert, Switch, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    User, Bell, ChevronRight, Shield, Trash2, LogOut,
    Star, Heart, HelpCircle, Activity, Salad, CreditCard,
    RefreshCcw, AlertCircle, CheckCircle,
} from 'lucide-react-native';
import * as Notifications from 'expo-notifications';
import Purchases from 'react-native-purchases';
import RevenueCatUI from 'react-native-purchases-ui';

import { Text } from '@/components/ui/Text';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useToast } from '@/components/ui/Toast';
import { useAuthStore } from '@/store/authStore';
import { colors, radii } from '@/theme';
import { haptics } from '@/theme/haptics';

interface ProfileRowProps {
    icon: React.ReactNode;
    label: string;
    value?: string;
    onPress?: () => void;
    danger?: boolean;
}

function ProfileRow({ icon, label, value, onPress, danger }: ProfileRowProps): React.JSX.Element {
    return (
        <Pressable
            onPress={onPress}
            style={{
                flexDirection: 'row', alignItems: 'center', gap: 12,
                paddingVertical: 14, paddingHorizontal: 4,
                borderBottomWidth: 1, borderBottomColor: colors.stone,
            }}
        >
            <View style={{
                width: 32, height: 32, borderRadius: 8,
                backgroundColor: danger ? colors.red.light : colors.stone,
                alignItems: 'center', justifyContent: 'center'
            }}>
                {React.cloneElement(icon as React.ReactElement<any>, {
                    size: 16,
                    color: danger ? colors.red.DEFAULT : colors.text2,
                    fill: danger ? colors.red.DEFAULT : colors.text2,
                    fillOpacity: 0.2
                })}
            </View>
            <Text
                variant="body"
                color={danger ? colors.red.DEFAULT : colors.text1}
                style={{ flex: 1 }}
            >
                {label}
            </Text>
            {value && <Text variant="label" color={colors.text3}>{value}</Text>}
            <ChevronRight size={16} color={colors.text3} />
        </Pressable>
    );
}

export default function ProfileScreen(): React.JSX.Element {
    const router = useRouter();
    const { profile, user, signOut, deleteAccount, updateProfile } = useAuthStore();
    const [editingTriggers, setEditingTriggers] = useState(false);
    const [editingConditions, setEditingConditions] = useState(false);
    const [editingDiet, setEditingDiet] = useState(false);

    const [triggerInput, setTriggerInput] = useState(profile?.known_triggers?.join(', ') || '');
    const [conditionInput, setConditionInput] = useState(profile?.diagnosed_conditions?.join(', ') || '');
    const [dietInput, setDietInput] = useState(profile?.diet_type || '');
    const [saving, setSaving] = useState(false);
    const { showToast } = useToast();

    // Confirmation Modals State
    const [signOutVisible, setSignOutVisible] = useState(false);
    const [deleteVisible, setDeleteVisible] = useState(false);
    const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    // Track the ACTUAL OS permission status, not just the DB flag
    const [notificationsGranted, setNotificationsGranted] = useState(false);

    // On mount, check the real OS permission status
    useEffect(() => {
        Notifications.getPermissionsAsync().then(({ status }) => {
            const granted = status === 'granted';
            setNotificationsGranted(granted);
            // Keep DB in sync with real OS state
            if (!granted && profile?.notifications_enabled) {
                updateProfile({ notifications_enabled: false }).catch(console.error);
            }
        });
    }, []);

    const handleSignOut = async (): Promise<void> => {
        setActionLoading(true);
        try {
            await signOut();
        } catch (error) {
            console.error('Sign out error:', error);
            showToast({ title: 'Error', message: 'Sign out failed.', type: 'error' });
        } finally {
            setActionLoading(false);
            setSignOutVisible(false);
        }
    };

    const handleDeleteAccount = async (): Promise<void> => {
        setActionLoading(true);
        try {
            await deleteAccount();
        } catch (error) {
            console.error('Delete account error:', error);
            showToast({
                title: 'Error',
                message: 'Failed to delete account. Please try again.',
                type: 'error'
            });
        } finally {
            setActionLoading(false);
            setConfirmDeleteVisible(false);
        }
    };

    const handleUpdateTriggers = async (): Promise<void> => {
        setSaving(true);
        try {
            const triggers = triggerInput.split(',').map(t => t.trim()).filter(Boolean);
            await updateProfile({ known_triggers: triggers });
            setEditingTriggers(false);
            haptics.buttonTap();
        } catch (error) {
            console.error('Update triggers error:', error);
        } finally {
            setSaving(false);
        }
    };

    const toggleCondition = (condition: string): void => {
        const current = profile?.diagnosed_conditions || [];
        const next = current.includes(condition)
            ? current.filter(c => c !== condition)
            : [...current, condition];

        updateProfile({ diagnosed_conditions: next }).then(() => {
            haptics.sliderTick();
        }).catch(console.error);
    };

    const setDietType = (diet: string): void => {
        updateProfile({ diet_type: diet }).then(() => {
            haptics.sliderTick();
            setEditingDiet(false);
        }).catch(console.error);
    };

    const handleToggleNotifications = async (val: boolean): Promise<void> => {
        try {
            if (val) {
                // User wants to enable — request OS permission first
                const { status } = await Notifications.requestPermissionsAsync();
                if (status === 'granted') {
                    setNotificationsGranted(true);
                    await updateProfile({ notifications_enabled: true });
                    haptics.sliderTick();
                } else {
                    // Permission was denied — OS won't ask again, open Settings
                    setNotificationsGranted(false);
                    Alert.alert(
                        'Notifications Disabled',
                        'You have previously denied notification permission. Please enable it in Settings to receive reminders.',
                        [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Open Settings', onPress: () => Linking.openSettings() },
                        ]
                    );
                }
            } else {
                // User is turning notifications OFF — no permission needed
                setNotificationsGranted(false);
                await Notifications.cancelAllScheduledNotificationsAsync();
                await updateProfile({ notifications_enabled: false });
                haptics.sliderTick();
            }
        } catch (error) {
            console.error('Toggle notifications error:', error);
        }
    };

    const CONDITIONS = ['IBS-D', 'IBS-C', 'IBS-M', 'Chronic Bloating', 'SIBO', 'Lactose Intolerance', 'Gluten Sensitivity', 'Crohn\'s', 'Colitis', 'Not Diagnosed', 'Other'];
    const DIET_TYPES = ['Omnivore', 'Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Low FODMAP'];

    const handleOpenPaywall = async (): Promise<void> => {
        try {
            await RevenueCatUI.presentPaywall();
        } catch (error) {
            console.error('Paywall error:', error);
        }
    };

    const handleRestorePurchases = async (): Promise<void> => {
        try {
            await Purchases.restorePurchases();
            showToast({
                title: 'Restored',
                message: 'Your purchases have been successfully restored!',
                type: 'success'
            });
        } catch (error) {
            console.error('Restore error:', error);
            showToast({
                title: 'Error',
                message: 'Failed to restore. Please try again.',
                type: 'error'
            });
        }
    };

    return (
        <LinearGradient colors={[colors.gradient.start, colors.gradient.mid]} style={{ flex: 1 }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                    {/* Profile Header */}
                    <View style={{ alignItems: 'center', marginTop: 20 }}>
                        <Avatar name={profile?.full_name} url={profile?.avatar_url} size={84} />
                        <Text variant="heading" color={colors.text1} style={{ marginTop: 16 }}>
                            {profile?.full_name || 'Gut Buddy User'}
                        </Text>
                        <Text variant="caption" color={colors.text2} style={{ marginTop: 4 }}>
                            {profile?.email}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
                            <View style={{ backgroundColor: colors.primary.light, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                                <Text variant="caption" color={colors.primary.DEFAULT}>{profile?.biological_sex || 'Not set'}</Text>
                            </View>
                            <View style={{ backgroundColor: colors.primary.light, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8 }}>
                                <Text variant="caption" color={colors.primary.DEFAULT}>{profile?.age ? `${profile?.age} years` : 'Age not set'}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Known Triggers Section */}
                    <Card animated delay={0} style={{ marginTop: 24 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <Text variant="title" color={colors.text1}>Known Triggers</Text>
                            <Pressable onPress={() => setEditingTriggers(!editingTriggers)}>
                                <Text variant="labelBold" color={colors.primary.DEFAULT}>
                                    {editingTriggers ? 'Cancel' : 'Edit'}
                                </Text>
                            </Pressable>
                        </View>
                        {editingTriggers ? (
                            <View style={{ gap: 10 }}>
                                <Input
                                    placeholder="garlic, dairy, wheat..."
                                    value={triggerInput}
                                    onChangeText={setTriggerInput}
                                    multiline
                                />
                                <Button title="Save" onPress={handleUpdateTriggers} loading={saving} />
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {(profile?.known_triggers || []).length > 0 ? (
                                    (profile?.known_triggers || []).map(trigger => (
                                        <View key={trigger} style={{ backgroundColor: colors.red.light, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                                            <Text variant="caption" color={colors.red.DEFAULT}>{trigger}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text variant="label" color={colors.text3}>No triggers added yet</Text>
                                )}
                            </View>
                        )}
                    </Card>

                    {/* Conditions */}
                    <Card animated delay={80} style={{ marginTop: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Activity size={18} color={colors.text2} />
                                <Text variant="title" color={colors.text1}>Conditions</Text>
                            </View>
                            <Pressable onPress={() => setEditingConditions(!editingConditions)}>
                                <Text variant="labelBold" color={colors.primary.DEFAULT}>
                                    {editingConditions ? 'Cancel' : 'Edit'}
                                </Text>
                            </Pressable>
                        </View>
                        {editingConditions ? (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {CONDITIONS.map(condition => {
                                    const isSelected = (profile?.diagnosed_conditions || []).includes(condition);
                                    return (
                                        <Chip
                                            key={condition}
                                            label={condition}
                                            selected={isSelected}
                                            onPress={() => toggleCondition(condition)}
                                        />
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                                {(profile?.diagnosed_conditions || []).length > 0 ? (
                                    (profile?.diagnosed_conditions || []).map(condition => (
                                        <View key={condition} style={{ backgroundColor: colors.amber.light, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
                                            <Text variant="caption" color={colors.amber.DEFAULT}>{condition}</Text>
                                        </View>
                                    ))
                                ) : (
                                    <Text variant="label" color={colors.text3}>None specified</Text>
                                )}
                            </View>
                        )}
                    </Card>

                    {/* Diet Type */}
                    <Card animated delay={120} style={{ marginTop: 12 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <Salad size={18} color={colors.text2} />
                                <Text variant="title" color={colors.text1}>Diet Type</Text>
                            </View>
                            <Pressable onPress={() => setEditingDiet(!editingDiet)}>
                                <Text variant="labelBold" color={colors.primary.DEFAULT}>
                                    {editingDiet ? 'Cancel' : 'Edit'}
                                </Text>
                            </Pressable>
                        </View>
                        {editingDiet ? (
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                                {DIET_TYPES.map(diet => {
                                    const isSelected = profile?.diet_type === diet;
                                    return (
                                        <Chip
                                            key={diet}
                                            label={diet}
                                            selected={isSelected}
                                            onPress={() => setDietType(diet)}
                                        />
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={{ backgroundColor: colors.primary.light, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start' }}>
                                <Text variant="labelBold" color={colors.primary.DEFAULT}>
                                    {profile?.diet_type || 'General'}
                                </Text>
                            </View>
                        )}
                    </Card>

                    {/* Settings */}
                    <Card animated delay={160} style={{ marginTop: 16 }}>
                        <Text variant="title" color={colors.text1} style={{ marginBottom: 4 }}>Settings</Text>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.stone }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: colors.stone, alignItems: 'center', justifyContent: 'center' }}>
                                    <Bell size={16} color={colors.text2} fill={colors.text2} fillOpacity={0.2} />
                                </View>
                                <Text variant="body" color={colors.text1}>Notifications</Text>
                            </View>
                            <Switch
                                value={notificationsGranted}
                                onValueChange={handleToggleNotifications}
                                trackColor={{ false: colors.stone, true: colors.primary.DEFAULT }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        <ProfileRow
                            icon={<CreditCard size={18} color={colors.amber.DEFAULT} />}
                            label="Plan & Subscription"
                            value="GutScan Pro"
                            onPress={handleOpenPaywall}
                        />
                        <ProfileRow
                            icon={<RefreshCcw size={18} color={colors.text2} />}
                            label="Restore Purchases"
                            onPress={handleRestorePurchases}
                        />
                        <ProfileRow
                            icon={<Shield size={18} color={colors.text2} />}
                            label="Privacy Policy"
                            onPress={() => router.push('/legal/privacy')}
                        />
                        <ProfileRow
                            icon={<HelpCircle size={18} color={colors.text2} />}
                            label="Terms of Service"
                            onPress={() => router.push('/legal/terms')}
                        />
                    </Card>

                    {/* Account Actions */}
                    <Card animated delay={240} style={{ marginTop: 16 }}>
                        <Text variant="title" color={colors.text1} style={{ marginBottom: 4 }}>Account</Text>

                        <ProfileRow
                            icon={<LogOut size={18} color={colors.text2} />}
                            label="Sign Out"
                            onPress={() => setSignOutVisible(true)}
                        />
                        <ProfileRow
                            icon={<Trash2 size={18} color={colors.red.DEFAULT} />}
                            label="Delete Account"
                            onPress={() => setDeleteVisible(true)}
                            danger
                        />
                    </Card>

                    <Dialog
                        visible={signOutVisible}
                        title="Sign Out"
                        description="Are you sure you want to sign out?"
                        confirmLabel="Sign Out"
                        cancelLabel="Cancel"
                        onConfirm={handleSignOut}
                        onCancel={() => setSignOutVisible(false)}
                        loading={actionLoading}
                    />

                    <Dialog
                        visible={deleteVisible}
                        title="Delete Account"
                        description="This will permanently delete your account and all your data. This cannot be undone."
                        confirmLabel="Continue"
                        cancelLabel="Cancel"
                        onConfirm={() => {
                            setDeleteVisible(false);
                            setConfirmDeleteVisible(true);
                        }}
                        onCancel={() => setDeleteVisible(false)}
                        type="danger"
                    />

                    <Dialog
                        visible={confirmDeleteVisible}
                        title="Final Warning"
                        description="Are you absolutely sure? All your meal logs, symptoms, insights, and recipes will be wiped forever."
                        confirmLabel="Delete Everything"
                        cancelLabel="Cancel"
                        onConfirm={handleDeleteAccount}
                        onCancel={() => setConfirmDeleteVisible(false)}
                        type="danger"
                        loading={actionLoading}
                    />

                    {/* App version */}
                    <View style={{ alignItems: 'center', marginTop: 24 }}>
                        <Text variant="caption" color={colors.text3}>Gut Buddy v3.0.0</Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}
