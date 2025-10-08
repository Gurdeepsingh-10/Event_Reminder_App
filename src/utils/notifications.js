import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { getNextOccurrenceDate } from './dateCalculations';

// Suppress remote notification warnings in Expo Go
// We only use LOCAL notifications, which work fine
console.warn = (function (originalWarn) {
    return function (...args) {
        const message = args[0];
        if (
            typeof message === 'string' &&
            message.includes('expo-notifications') &&
            message.includes('remote notifications')
        ) {
            // Suppress this specific warning
            return;
        }
        originalWarn.apply(console, args);
    };
})(console.warn);

// Configure notification behavior (LOCAL notifications only)
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Request notification permissions
 * Note: We only use LOCAL notifications (scheduled on device)
 * Remote/Push notifications are not used in this app
 */
export const requestNotificationPermissions = async () => {
    if (!Device.isDevice) {
        Alert.alert(
            'Emulator Detected',
            'Notifications only work on physical devices, not emulators/simulators.'
        );
        return false;
    }

    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            Alert.alert(
                'Permission Denied',
                'You need to enable notifications in your device settings to receive event reminders.'
            );
            return false;
        }

        // Configure notification channel for Android
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('birthday-reminders', {
                name: 'Birthday Reminders',
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#9d4edd',
                sound: 'default',
            });
        }

        console.log('✅ Local notification permissions granted');
        return true;
    } catch (error) {
        console.error('Error requesting permissions:', error);
        return false;
    }
};

/**
 * Schedule a LOCAL notification for an event
 * This works perfectly in Expo Go - no development build needed
 */
/**
 * Schedule TWO notifications for an event:
 * 1. X days before (based on user's reminder setting)
 * 2. On the day of the event at 9 AM
 */
export const scheduleEventNotification = async (event) => {
    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) {
            console.log('⚠️ No notification permission, skipping schedule');
            return null;
        }

        // Calculate event date (next occurrence)
        const eventDate = getNextOccurrenceDate(event.day, event.month, event.year);
        console.log('📅 Event date (next occurrence):', eventDate.toISOString());

        const now = new Date();
        const notificationIds = [];

        // NOTIFICATION 1: X days before (if reminderDays > 0)
        if (event.reminderDays > 0) {
            const reminderDate = new Date(eventDate);
            reminderDate.setDate(reminderDate.getDate() - event.reminderDays);
            reminderDate.setHours(9, 0, 0, 0); // 9 AM on reminder day

            console.log('⏰ Reminder date:', reminderDate.toISOString());

            if (reminderDate > now) {
                const eventTypeEmoji = event.type === 'birthday' ? '🎂' : event.type === 'anniversary' ? '💝' : '🎉';

                let reminderTitle = '';
                let reminderBody = '';

                if (event.reminderDays === 1) {
                    reminderTitle = `${eventTypeEmoji} Tomorrow: ${event.name}`;
                    reminderBody = `Reminder: ${event.name}'s ${event.type} is tomorrow!`;
                } else {
                    reminderTitle = `${eventTypeEmoji} Upcoming: ${event.name}`;
                    reminderBody = `${event.name}'s ${event.type} is in ${event.reminderDays} days`;
                }

                const reminderId = await Notifications.scheduleNotificationAsync({
                    content: {
                        title: reminderTitle,
                        body: reminderBody,
                        sound: 'default',
                        data: {
                            eventId: event.id,
                            eventName: event.name,
                            eventType: event.type,
                            notificationType: 'reminder',
                        },
                    },
                    trigger: {
                        date: reminderDate,
                        channelId: Platform.OS === 'android' ? 'birthday-reminders' : undefined,
                    },
                });

                notificationIds.push(reminderId);
                console.log(`✅ Reminder notification scheduled: ${reminderId} for ${reminderDate.toLocaleString()}`);
            } else {
                console.log('⚠️ Reminder date is in the past, skipping reminder notification');
            }
        }

        // NOTIFICATION 2: On the day at 9 AM
        const onDayDate = new Date(eventDate);
        onDayDate.setHours(9, 0, 0, 0); // 9 AM on event day

        console.log('🎉 On-day date:', onDayDate.toISOString());

        if (onDayDate > now) {
            const eventTypeEmoji = event.type === 'birthday' ? '🎂' : event.type === 'anniversary' ? '💝' : '🎉';

            const onDayTitle = `${eventTypeEmoji} Today: ${event.name}`;
            const onDayBody = `Don't forget! It's ${event.name}'s ${event.type} today!`;

            const onDayId = await Notifications.scheduleNotificationAsync({
                content: {
                    title: onDayTitle,
                    body: onDayBody,
                    sound: 'default',
                    data: {
                        eventId: event.id,
                        eventName: event.name,
                        eventType: event.type,
                        notificationType: 'onDay',
                    },
                },
                trigger: {
                    date: onDayDate,
                    channelId: Platform.OS === 'android' ? 'birthday-reminders' : undefined,
                },
            });

            notificationIds.push(onDayId);
            console.log(`✅ On-day notification scheduled: ${onDayId} for ${onDayDate.toLocaleString()}`);
        } else {
            console.log('⚠️ Event day is today or in the past, skipping on-day notification');
        }

        // Store all notification IDs (comma-separated)
        const combinedIds = notificationIds.join(',');
        console.log(`📋 Total notifications scheduled: ${notificationIds.length}, IDs: ${combinedIds}`);

        return combinedIds;

    } catch (error) {
        console.error('❌ Error scheduling notifications:', error);
        return null;
    }
};
/**
 * Cancel a specific notification
 */
export const cancelNotification = async (notificationId) => {
    if (!notificationId) return;

    try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
        console.log('✅ Notification cancelled:', notificationId);
    } catch (error) {
        console.error('❌ Error cancelling notification:', error);
    }
};

/**
 * Cancel all notifications for an event (handles multiple IDs)
 */
export const cancelEventNotifications = async (event) => {
    if (!event.notificationId) return;

    try {
        const ids = event.notificationId.split(',');
        for (const id of ids) {
            if (id.trim()) {
                await Notifications.cancelScheduledNotificationAsync(id.trim());
                console.log('✅ Notification cancelled:', id);
            }
        }
    } catch (error) {
        console.error('❌ Error cancelling notifications:', error);
    }
};

/**
 * Get all scheduled LOCAL notifications
 */
export const getAllScheduledNotifications = async () => {
    try {
        const notifications = await Notifications.getAllScheduledNotificationsAsync();
        console.log(`📋 Total scheduled LOCAL notifications: ${notifications.length}`);
        notifications.forEach((notif) => {
            console.log('  📅 Scheduled:', {
                id: notif.identifier,
                title: notif.content.title,
                trigger: notif.trigger,
            });
        });
        return notifications;
    } catch (error) {
        console.error('❌ Error getting scheduled notifications:', error);
        return [];
    }
};

/**
 * Cancel all notifications
 */
export const cancelAllNotifications = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('✅ All LOCAL notifications cancelled');
    } catch (error) {
        console.error('❌ Error cancelling all notifications:', error);
    }
};

/**
 * Schedule a test LOCAL notification (fires in 10 seconds)
 * This demonstrates that LOCAL notifications work perfectly in Expo Go
 */
export const scheduleTestNotification = async () => {
    try {
        const hasPermission = await requestNotificationPermissions();
        if (!hasPermission) return null;

        const notificationId = await Notifications.scheduleNotificationAsync({
            content: {
                title: '🎉 Test LOCAL Notification',
                body: 'Local notifications work perfectly in Expo Go! No development build needed.',
                sound: 'default',
                data: {
                    test: true,
                    isLocal: true,
                },
            },
            trigger: {
                seconds: 10,
                channelId: Platform.OS === 'android' ? 'birthday-reminders' : undefined,
            },
        });

        Alert.alert(
            'Test Scheduled ✅',
            'A LOCAL notification will appear in 10 seconds. Keep the app in background to see it.\n\nNote: We only use LOCAL notifications, which work in Expo Go. Remote/Push notifications are NOT used.',
            [{ text: 'OK' }]
        );

        console.log('✅ Test LOCAL notification scheduled:', notificationId);
        return notificationId;
    } catch (error) {
        console.error('❌ Error scheduling test notification:', error);
        Alert.alert('Error', 'Failed to schedule test notification: ' + error.message);
        return null;
    }
};

/**
 * Reschedule notification for an event (e.g., after editing)
 */
/**
 * Reschedule notification for an event (e.g., after editing)
 */
export const rescheduleEventNotification = async (event) => {
    // Cancel existing notifications
    await cancelEventNotifications(event);

    // Schedule new notifications
    const newNotificationIds = await scheduleEventNotification(event);
    return newNotificationIds;
};