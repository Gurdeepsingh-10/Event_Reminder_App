import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { loadSettings, saveSettings, clearAllData, debugStorage, updateSetting } from '../utils/storage';
import {
    scheduleTestNotification,
    getAllScheduledNotifications,
    cancelAllNotifications,
    requestNotificationPermissions
} from '../utils/notifications';
import { useTheme } from '../utils/ThemeContext';
import Dropdown from '../components/Dropdown';

const REMINDER_OPTIONS = [
    { label: 'On the day', value: 0 },
    { label: '1 day before', value: 1 },
    { label: '2 days before', value: 2 },
    { label: '3 days before', value: 3 },
    { label: '1 week before', value: 7 },
    { label: '2 weeks before', value: 14 },
    { label: '1 month before', value: 30 },
];

export default function SettingsScreen({ navigation }) {
    const { theme, colors, toggleTheme } = useTheme();
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reminderModalVisible, setReminderModalVisible] = useState(false);

    useEffect(() => {
        loadSettingsFromStorage();
    }, []);

    const loadSettingsFromStorage = async () => {
        setLoading(true);
        const loadedSettings = await loadSettings();
        setSettings(loadedSettings);
        setLoading(false);
    };

    const handleThemeToggle = async () => {
        await toggleTheme();
        Alert.alert(
            'Theme Changed',
            `Switched to ${theme === 'dark' ? 'light' : 'dark'} mode!`
        );
    };

    const handleDefaultReminderChange = async (value) => {
        const updatedSettings = { ...settings, defaultReminderDays: value };
        setSettings(updatedSettings);
        await saveSettings(updatedSettings);
        setReminderModalVisible(false);
        Alert.alert(
            'Reminder Updated',
            `Default reminder set to ${value === 0 ? 'on the day' : value === 1 ? '1 day before' : `${value} days before`}`
        );
    };

    const handleNotificationSoundToggle = async () => {
        const newValue = !settings.notificationSound;
        const updatedSettings = { ...settings, notificationSound: newValue };
        setSettings(updatedSettings);
        await saveSettings(updatedSettings);
    };

    const handleRequestPermissions = async () => {
        const granted = await requestNotificationPermissions();
        if (granted) {
            Alert.alert('Success', 'Notification permissions granted!');
        }
    };

    const handleTestNotification = async () => {
        await scheduleTestNotification();
    };

    const handleViewScheduled = async () => {
        const notifications = await getAllScheduledNotifications();
        Alert.alert(
            'Scheduled Notifications',
            `You have ${notifications.length} scheduled notification(s). Check console for details.`,
            [{ text: 'OK' }]
        );
    };

    const handleCancelAllNotifications = () => {
        Alert.alert(
            'Cancel All Notifications',
            'Are you sure you want to cancel all scheduled notifications?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Cancel All',
                    style: 'destructive',
                    onPress: async () => {
                        await cancelAllNotifications();
                        Alert.alert('Success', 'All notifications cancelled');
                    },
                },
            ]
        );
    };

    const handleClearAllData = () => {
        Alert.alert(
            'Clear All Data',
            'Are you sure you want to delete all events and settings? This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear All',
                    style: 'destructive',
                    onPress: async () => {
                        const success = await clearAllData();
                        if (success) {
                            Alert.alert('Success', 'All data cleared. Please restart the app.');
                        } else {
                            Alert.alert('Error', 'Failed to clear data.');
                        }
                    },
                },
            ]
        );
    };

    const handleDebugStorage = async () => {
        await debugStorage();
        Alert.alert('Debug', 'Check console logs for storage data');
    };

    if (loading) {
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                    Loading settings...
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>Settings</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                    Customize your experience
                </Text>
            </View>

            {/* Appearance Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    APPEARANCE
                </Text>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={handleThemeToggle}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>🌓</Text>
                        <View>
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>Theme</Text>
                            <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                                Current: {theme === 'dark' ? 'Dark' : 'Light'}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.optionValue, { color: colors.accent }]}>
                        {theme === 'dark' ? 'Dark' : 'Light'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Notifications Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    NOTIFICATIONS
                </Text>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={() => setReminderModalVisible(true)}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>⏰</Text>
                        <View>
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                                Default Reminder
                            </Text>
                            <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                                {settings.defaultReminderDays === 0
                                    ? 'On the day'
                                    : `${settings.defaultReminderDays} day(s) before`}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.arrow, { color: colors.accent }]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={handleNotificationSoundToggle}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>🔔</Text>
                        <View>
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                                Notification Sound
                            </Text>
                            <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                                {settings.notificationSound ? 'Enabled' : 'Disabled'}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.optionValue, { color: colors.accent }]}>
                        {settings.notificationSound ? 'ON' : 'OFF'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Notifications Testing Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    NOTIFICATIONS TESTING
                </Text>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={handleRequestPermissions}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>🔔</Text>
                        <View>
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                                Request Permissions
                            </Text>
                            <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                                Allow notifications
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.arrow, { color: colors.accent }]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={handleTestNotification}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>⏰</Text>
                        <View>
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                                Test Notification
                            </Text>
                            <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                                Fires in 10 seconds
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.arrow, { color: colors.accent }]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={handleViewScheduled}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>📋</Text>
                        <View>
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                                View Scheduled
                            </Text>
                            <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                                See all scheduled notifications
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.arrow, { color: colors.accent }]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, styles.dangerOption, { backgroundColor: colors.cardBackground }]}
                    onPress={handleCancelAllNotifications}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>🚫</Text>
                        <View>
                            <Text style={[styles.optionText, { color: colors.danger }]}>
                                Cancel All Notifications
                            </Text>
                            <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                                Remove all scheduled reminders
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* About Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    ABOUT
                </Text>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={() => navigation.navigate('Terms')}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>📄</Text>
                        <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                            Terms & Conditions
                        </Text>
                    </View>
                    <Text style={[styles.arrow, { color: colors.accent }]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={() => navigation.navigate('License')}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>⚖️</Text>
                        <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                            License
                        </Text>
                    </View>
                    <Text style={[styles.arrow, { color: colors.accent }]}>›</Text>
                </TouchableOpacity>

            </View>

            {/* Developer Section */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
                    DEVELOPER
                </Text>

                <TouchableOpacity
                    style={[styles.option, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={handleDebugStorage}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>🐛</Text>
                        <View>
                            <Text style={[styles.optionText, { color: colors.textPrimary }]}>
                                Debug Storage
                            </Text>
                            <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                                View console logs
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.arrow, { color: colors.accent }]}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.option, styles.dangerOption, { backgroundColor: colors.cardBackground }]}
                    onPress={handleClearAllData}
                >
                    <View style={styles.optionLeft}>
                        <Text style={styles.optionIcon}>🗑️</Text>
                        <View>
                            <Text style={[styles.optionText, { color: colors.danger }]}>
                                Clear All Data
                            </Text>
                            <Text style={[styles.optionSubtext, { color: colors.textSecondary }]}>
                                Delete all events and settings
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textPrimary }]}>
                    Events Reminder App
                </Text>
                <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
                    Version 1.0.0
                </Text>
                <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
                    Events are stored locally on your device
                </Text>
                <Text style={[styles.footerSubtext, { color: colors.textSecondary }]}>
                    Made with ❤️ Gurdeep Singh
                </Text>
            </View>

            {/* Default Reminder Modal */}
            <Modal
                visible={reminderModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setReminderModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                            Default Reminder
                        </Text>
                        <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                            Choose when you want to be reminded
                        </Text>

                        <ScrollView style={styles.reminderOptions}>
                            {REMINDER_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.reminderOption,
                                        { backgroundColor: colors.background, borderColor: colors.borderColor },
                                        settings.defaultReminderDays === option.value && { backgroundColor: colors.accent, borderColor: colors.accent },
                                    ]}
                                    onPress={() => handleDefaultReminderChange(option.value)}
                                >
                                    <Text
                                        style={[
                                            styles.reminderOptionText,
                                            { color: colors.textPrimary },
                                            settings.defaultReminderDays === option.value && { color: '#ffffff' },
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                    {settings.defaultReminderDays === option.value && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            style={[styles.modalCloseButton, { backgroundColor: colors.background, borderColor: colors.borderColor }]}
                            onPress={() => setReminderModalVisible(false)}
                        >
                            <Text style={[styles.modalCloseButtonText, { color: colors.textPrimary }]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 16,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
    },
    option: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    optionIcon: {
        fontSize: 24,
        marginRight: 12,
    },
    optionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    optionSubtext: {
        fontSize: 13,
        marginTop: 2,
    },
    optionValue: {
        fontSize: 14,
        fontWeight: '600',
    },
    arrow: {
        fontSize: 20,
    },
    dangerOption: {
        borderColor: '#ff6b6b',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 40,
        paddingHorizontal: 20,
        paddingBottom: 60,
    },
    footerText: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    footerSubtext: {
        fontSize: 13,
        marginTop: 2,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    modalContent: {
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxHeight: '70%',
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        marginBottom: 20,
    },
    reminderOptions: {
        marginBottom: 20,
    },
    reminderOption: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 8,
        borderWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    reminderOptionText: {
        fontSize: 16,
        fontWeight: '600',
    },
    checkmark: {
        fontSize: 18,
        color: '#ffffff',
    },
    modalCloseButton: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    modalCloseButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});