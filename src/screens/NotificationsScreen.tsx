import React from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { colors, spacing } from '../theme/theme';
import { ScreenWrapper, Typography, IconContainer, Card, BoxButton } from '../components';
import { useNotificationStore, Notification } from '../store/useNotificationStore';

export const NotificationsScreen = () => {
    const navigation = useNavigation<any>();
    const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore();
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'achievement': return 'trophy';
            case 'insight': return 'bulb';
            case 'alert': return 'warning';
            case 'reminder': 
            default: return 'notifications';
        }
    };

    const getColor = (type: Notification['type']) => {
        switch (type) {
            case 'achievement': return colors.yellow;
            case 'insight': return colors.blue;
            case 'alert': return colors.pink;
            case 'reminder': 
            default: return colors.blue;
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <ScreenWrapper edges={['top']} style={styles.container}>
            <View style={styles.header}>
                <BoxButton 
                    icon="arrow-back" 
                    onPress={() => navigation.goBack()} 
                    size={44}
                />
                <Typography variant="h2" style={styles.title}>Notifications</Typography>
                <BoxButton 
                    icon="trash-outline" 
                    onPress={clearNotifications} 
                    size={44}
                    color={colors.pink}
                    variant="transparent"
                />
            </View>

            {notifications.length > 0 && (
                <Pressable onPress={markAllAsRead} style={styles.markAll}>
                    <Typography variant="bodySmall" color={colors.blue}>Mark all as read</Typography>
                </Pressable>
            )}

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.pink} />
                }
            >
                {notifications.length === 0 ? (
                    <View style={styles.emptyState}>
                        <IconContainer 
                            name="notifications-off-outline" 
                            size={80} 
                            iconSize={40} 
                            color={colors.black + '20'} 
                            variant="transparent" 
                        />
                        <Typography variant="body" color={colors.black + '40'} style={{ marginTop: spacing.md }}>
                            All caught up!
                        </Typography>
                    </View>
                ) : (
                    notifications.map((noti, index) => (
                        <Animated.View 
                            key={noti.id}
                            entering={FadeInDown.delay(index * 50).springify()}
                            layout={Layout}
                        >
                            <Pressable onPress={() => markAsRead(noti.id)}>
                                <Card 
                                    variant="white" 
                                    style={[
                                        styles.notificationCard,
                                        !noti.read && styles.unreadCard
                                    ]}
                                    padding="md"
                                >
                                    <IconContainer 
                                        name={getIcon(noti.type) as any} 
                                        size={48} 
                                        color={getColor(noti.type)} 
                                        variant="solid"
                                        style={styles.icon}
                                    />
                                    <View style={styles.content}>
                                        <View style={styles.contentHeader}>
                                            <Typography variant="bodyBold" style={styles.notiTitle}>{noti.title}</Typography>
                                            <Typography variant="caption" color={colors.black + '40'}>{formatTime(noti.timestamp)}</Typography>
                                        </View>
                                        <Typography variant="bodySmall" color={colors.black + '80'}>{noti.body}</Typography>
                                    </View>
                                    {!noti.read && <View style={styles.unreadDot} />}
                                </Card>
                            </Pressable>
                        </Animated.View>
                    ))
                )}
            </ScrollView>
        </ScreenWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    title: {
        flex: 1,
        textAlign: 'center',
    },
    markAll: {
        alignSelf: 'center',
        paddingVertical: spacing.xs,
        marginBottom: spacing.sm,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: 100,
    },
    notificationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        borderRadius: 24,
    },
    unreadCard: {
        backgroundColor: colors.blue + '05',
        borderColor: colors.blue + '20',
    },
    icon: {
        marginRight: spacing.md,
    },
    content: {
        flex: 1,
    },
    contentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    notiTitle: {
        fontSize: 15,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.blue,
        marginLeft: spacing.sm,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100,
    }
});
