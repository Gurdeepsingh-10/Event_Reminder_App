import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

export default function TermsScreen({ navigation }) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backButton, { color: colors.accent }]}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    Terms & Conditions
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.section, { color: colors.textPrimary }]}>
                    Last Updated: October 4, 2025
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    1. Acceptance of Terms
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    By downloading, installing, or using the Birthday Reminder App ("the App"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the App.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    2. Use of the App
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    The App is designed to help you remember and track birthdays, anniversaries, and other important events. You may use the App for personal, non-commercial purposes only.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    3. Data Storage
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    All data (events, settings) is stored locally on your device. We do not collect, transmit, or store your personal data on any external servers. You are responsible for backing up your data.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    4. Notifications
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    The App uses local notifications to remind you of upcoming events. These notifications are scheduled and delivered entirely on your device. You can disable notifications at any time through your device settings.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    5. Privacy
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We respect your privacy. The App does not collect any personal information, analytics, or usage data. All information you enter remains on your device.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    6. Disclaimer of Warranties
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    The App is provided "as is" without warranties of any kind, either express or implied. We do not guarantee that the App will be error-free or uninterrupted.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    7. Limitation of Liability
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the App, including but not limited to missed events or incorrect notifications.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    8. Changes to Terms
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    We reserve the right to modify these Terms and Conditions at any time. Continued use of the App after changes constitutes acceptance of the modified terms.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    9. Contact
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    For questions about these Terms and Conditions, please contact us through the app settings.
                </Text>

                <View style={styles.spacer} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        fontSize: 1,
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 8,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    section: {
        fontSize: 14,
        marginBottom: 20,
        fontStyle: 'italic',
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 15,
        lineHeight: 22,
        marginBottom: 12,
    },
    spacer: {
        height: 40,
    },
});