import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTheme } from '../utils/ThemeContext';

export default function LicenseScreen({ navigation }) {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={[styles.header, { borderBottomColor: colors.borderColor }]}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={[styles.backButton, { color: colors.accent }]}>‹ Back</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                    License
                </Text>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.section, { color: colors.textPrimary }]}>
                    MIT License
                </Text>

                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Copyright (c) 2025 Birthday Reminder App
                </Text>

                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

                </Text>

                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
                </Text>

                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    Third-Party Libraries
                </Text>

                <Text style={[styles.subheading, { color: colors.textPrimary }]}>
                    React Native
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    MIT License - Copyright (c) Meta Platforms, Inc. and affiliates.
                </Text>

                <Text style={[styles.subheading, { color: colors.textPrimary }]}>
                    Expo
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    MIT License - Copyright (c) 2015-present 650 Industries, Inc.
                </Text>

                <Text style={[styles.subheading, { color: colors.textPrimary }]}>
                    React Navigation
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    MIT License - Copyright (c) 2017 React Navigation Contributors
                </Text>

                <Text style={[styles.subheading, { color: colors.textPrimary }]}>
                    react-native-calendars
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    MIT License - Copyright (c) 2017 Wix.com
                </Text>

                <Text style={[styles.subheading, { color: colors.textPrimary }]}>
                    @react-native-async-storage/async-storage
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    MIT License - Copyright (c) 2015-present, Facebook, Inc.
                </Text>

                <Text style={[styles.subheading, { color: colors.textPrimary }]}>
                    expo-notifications
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    MIT License - Copyright (c) 2015-present 650 Industries, Inc.
                </Text>

                <Text style={[styles.heading, { color: colors.textPrimary }]}>
                    Attribution
                </Text>
                <Text style={[styles.paragraph, { color: colors.textSecondary }]}>
                    This app uses emoji icons from the Unicode Standard, which are freely available and not subject to copyright.
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
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    heading: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 24,
        marginBottom: 12,
    },
    subheading: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 6,
    },
    paragraph: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 12,
    },
    spacer: {
        height: 40,
    },
});