import React, { createContext, useState, useContext, useEffect } from 'react';
import { loadSettings, updateSetting } from './storage';

// Theme colors
export const THEMES = {
    dark: {
        background: '#1a1a2e',
        cardBackground: '#16213e',
        borderColor: '#2d3561',
        textPrimary: '#ffffff',
        textSecondary: '#888888',
        accent: '#9d4edd',
        accentSecondary: '#b185db',
        success: '#4ecdc4',
        warning: '#feca57',
        danger: '#ff6b6b',
        iconTint: '#ffffff',
    },
    light: {
        background: '#f5f5f5',
        cardBackground: '#ffffff',
        borderColor: '#e0e0e0',
        textPrimary: '#1a1a1a',
        textSecondary: '#666666',
        accent: '#ff6b35',
        accentSecondary: '#ff8c61',
        success: '#2ecc71',
        warning: '#f39c12',
        danger: '#e74c3c',
        iconTint: '#1a1a1a',
    },
};

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark');
    const [colors, setColors] = useState(THEMES.dark);
    const [loading, setLoading] = useState(true);

    // Load theme from storage on mount
    useEffect(() => {
        loadThemeFromStorage();
    }, []);

    const loadThemeFromStorage = async () => {
        const settings = await loadSettings();
        const savedTheme = settings.theme || 'dark';
        setTheme(savedTheme);
        setColors(THEMES[savedTheme]);
        setLoading(false);
    };

    const toggleTheme = async () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        setColors(THEMES[newTheme]);
        await updateSetting('theme', newTheme);
        console.log('✅ Theme changed to:', newTheme);
    };

    const setThemeMode = async (mode) => {
        if (mode !== 'dark' && mode !== 'light') return;
        setTheme(mode);
        setColors(THEMES[mode]);
        await updateSetting('theme', mode);
        console.log('✅ Theme set to:', mode);
    };

    return (
        <ThemeContext.Provider value={{ theme, colors, toggleTheme, setThemeMode, loading }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};