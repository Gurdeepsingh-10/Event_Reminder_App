import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';

export default function GlassCard({ children, style, intensity = 80 }) {
    const { theme, colors } = useTheme();

    return (
        <View style={[styles.container, style]}>
            <BlurView
                intensity={intensity}
                tint={theme === 'dark' ? 'dark' : 'light'}
                style={styles.blur}
            >
                <LinearGradient
                    colors={
                        theme === 'dark'
                            ? ['rgba(22, 33, 62, 0.8)', 'rgba(26, 26, 46, 0.6)']
                            : ['rgba(255, 255, 255, 0.8)', 'rgba(245, 245, 245, 0.6)']
                    }
                    style={styles.gradient}
                >
                    <View style={[styles.content, { borderColor: colors.borderColor }]}>
                        {children}
                    </View>
                </LinearGradient>
            </BlurView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 16,
        overflow: 'hidden',
    },
    blur: {
        borderRadius: 16,
    },
    gradient: {
        borderRadius: 16,
    },
    content: {
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
});