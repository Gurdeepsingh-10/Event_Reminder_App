import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import Icon, { AppIcons } from '../components/Icon';
import { generateGiftIdeas, validateApiKey, testGeminiConnection } from '../services/geminiService';

export default function GiftIdeasScreen() {
    const { colors } = useTheme();

    const [formData, setFormData] = useState({
        hobbies: '',
        occupation: '',
        interests: '',
        personality: '',
        favorites: '',
        age: '',
        budget: '',
    });

    const [giftIdeas, setGiftIdeas] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleGenerateIdeas = async () => {
        // Validate at least one field is filled
        const hasAnyInput = Object.values(formData).some(value => value?.trim() !== '');

        if (!hasAnyInput) {
            Alert.alert(
                'Input Required',
                'Please fill in at least one field to generate personalized gift ideas.'
            );
            return;
        }

        // Validate API key
        if (!validateApiKey()) {
            Alert.alert(
                '🔑 API Key Missing',
                'Please add your FREE Gemini API key in:\n\nsrc/services/geminiService.js\n\nGet your key at:\nhttps://aistudio.google.com/app/apikey',
                [
                    { text: 'OK', style: 'default' }
                ]
            );
            return;
        }

        setLoading(true);
        setShowResults(false);

        try {
            console.log('🎁 Generating gift ideas...');
            const result = await generateGiftIdeas(formData);

            console.log('📦 Result:', result.success ? 'Success' : 'Failed');

            if (result.success) {
                console.log('✅ Generated', result.ideas.length, 'gift ideas');
                setGiftIdeas(result.ideas);
                setShowResults(true);
            } else {
                console.error('❌ Failed:', result.error);
                Alert.alert(
                    'Error',
                    result.error + (result.details ? '\n\n' + result.details : ''),
                    [{ text: 'OK', style: 'default' }]
                );
            }
        } catch (error) {
            console.error('❌ Exception:', error);
            Alert.alert(
                'Error',
                'An unexpected error occurred. Please try again.\n\n' + error.message,
                [{ text: 'OK', style: 'default' }]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleTestConnection = async () => {
        if (!validateApiKey()) {
            Alert.alert('API Key Missing', 'Please add your API key first.');
            return;
        }

        setLoading(true);
        const result = await testGeminiConnection();
        setLoading(false);

        if (result.success) {
            Alert.alert('✅ Connection Successful', result.message);
        } else {
            Alert.alert('❌ Connection Failed', result.error);
        }
    };

    const handleClear = () => {
        setFormData({
            hobbies: '',
            occupation: '',
            interests: '',
            personality: '',
            favorites: '',
            age: '',
            budget: '',
        });
        setGiftIdeas([]);
        setShowResults(false);
    };

    const handleBackToForm = () => {
        setShowResults(false);
    };

    // Results View
    if (showResults) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleBackToForm} style={styles.backButton}>
                            <Icon family="MaterialCommunityIcons" name="arrow-left" size={24} color={colors.textPrimary} />
                        </TouchableOpacity>
                        <View>
                            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                                Gift Ideas
                            </Text>
                            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                                {giftIdeas.length} personalized suggestions
                            </Text>
                        </View>
                    </View>

                    <View style={styles.resultsContainer}>
                        {giftIdeas.map((idea, index) => (
                            <View
                                key={idea.id}
                                style={[styles.ideaCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                            >
                                <View style={styles.ideaHeader}>
                                    <View style={[styles.ideaNumber, { backgroundColor: colors.accent }]}>
                                        <Text style={styles.ideaNumberText}>{index + 1}</Text>
                                    </View>
                                    <Text style={[styles.ideaName, { color: colors.textPrimary }]} numberOfLines={2}>
                                        {idea.name}
                                    </Text>
                                </View>
                                {idea.description ? (
                                    <Text style={[styles.ideaDescription, { color: colors.textSecondary }]}>
                                        {idea.description}
                                    </Text>
                                ) : null}
                            </View>
                        ))}

                        <TouchableOpacity
                            style={[styles.generateButton, { backgroundColor: colors.accent }]}
                            onPress={handleBackToForm}
                        >
                            <Icon family="MaterialCommunityIcons" name="refresh" size={20} color="#ffffff" />
                            <Text style={styles.generateButtonText}>Generate New Ideas</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </View>
        );
    }

    // Form View
    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                        Gift Ideas Generator
                    </Text>

                </View>

                <View style={styles.formContainer}>
                    <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                        Tell us about the person
                    </Text>

                    {/* Hobbies */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>
                            🎨 Hobbies
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.textPrimary, borderColor: colors.borderColor }]}
                            placeholder="e.g., Reading, Gaming, Gardening"
                            placeholderTextColor={colors.textSecondary}
                            value={formData.hobbies}
                            onChangeText={(text) => handleInputChange('hobbies', text)}
                        />
                    </View>

                    {/* Occupation */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>
                            💼 Occupation
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.textPrimary, borderColor: colors.borderColor }]}
                            placeholder="e.g., Software Engineer, Teacher"
                            placeholderTextColor={colors.textSecondary}
                            value={formData.occupation}
                            onChangeText={(text) => handleInputChange('occupation', text)}
                        />
                    </View>

                    {/* Interests */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>
                            ⭐ Interests
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.textPrimary, borderColor: colors.borderColor }]}
                            placeholder="e.g., Technology, Music, Travel"
                            placeholderTextColor={colors.textSecondary}
                            value={formData.interests}
                            onChangeText={(text) => handleInputChange('interests', text)}
                        />
                    </View>

                    {/* Personality */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>
                            🎭 Personality
                        </Text>
                        <TextInput
                            style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.textPrimary, borderColor: colors.borderColor }]}
                            placeholder="e.g., Introverted, Creative, Adventurous"
                            placeholderTextColor={colors.textSecondary}
                            value={formData.personality}
                            onChangeText={(text) => handleInputChange('personality', text)}
                        />
                    </View>

                    {/* Favorites */}
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: colors.textPrimary }]}>
                            ❤️ Favorite Things
                        </Text>
                        <TextInput
                            style={[styles.input, styles.textArea, { backgroundColor: colors.cardBackground, color: colors.textPrimary, borderColor: colors.borderColor }]}
                            placeholder="e.g., Color: Blue, Music: Jazz, Food: Italian"
                            placeholderTextColor={colors.textSecondary}
                            value={formData.favorites}
                            onChangeText={(text) => handleInputChange('favorites', text)}
                            multiline
                            numberOfLines={3}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Age & Budget Row */}
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>
                                🎂 Age
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.textPrimary, borderColor: colors.borderColor }]}
                                placeholder="e.g., 25"
                                placeholderTextColor={colors.textSecondary}
                                value={formData.age}
                                onChangeText={(text) => handleInputChange('age', text)}
                                keyboardType="number-pad"
                            />
                        </View>

                        <View style={[styles.inputGroup, styles.halfWidth]}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>
                                💰 Budget
                            </Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.textPrimary, borderColor: colors.borderColor }]}
                                placeholder="e.g., $50"
                                placeholderTextColor={colors.textSecondary}
                                value={formData.budget}
                                onChangeText={(text) => handleInputChange('budget', text)}
                            />
                        </View>
                    </View>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={[styles.generateButton, { backgroundColor: colors.accent, opacity: loading ? 0.6 : 1 }]}
                            onPress={handleGenerateIdeas}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <ActivityIndicator color="#ffffff" size="small" />
                                    <Text style={styles.generateButtonText}>Generating...</Text>
                                </>
                            ) : (
                                <>
                                    <Icon family="MaterialCommunityIcons" name="sparkles" size={20} color="#ffffff" />
                                    <Text style={styles.generateButtonText}>Get Gift Ideas</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <View style={styles.secondaryButtonRow}>
                            <TouchableOpacity
                                style={[styles.clearButton, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                                onPress={handleClear}
                                disabled={loading}
                            >
                                <Text style={[styles.clearButtonText, { color: colors.textPrimary }]}>Clear</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.testButton, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                                onPress={handleTestConnection}
                                disabled={loading}
                            >
                                <Icon family="MaterialCommunityIcons" name="connection" size={16} color={colors.textPrimary} />
                                <Text style={[styles.testButtonText, { color: colors.textPrimary }]}>Test API</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Text style={[styles.hint, { color: colors.textSecondary }]}>
                        💡 Tip: Fill in more fields for better personalized suggestions
                    </Text>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
    },
    formContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        borderWidth: 1,
    },
    textArea: {
        height: 80,
    },
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    buttonContainer: {
        marginTop: 24,
        marginBottom: 16,
    },
    generateButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        gap: 8,
    },
    generateButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    secondaryButtonRow: {
        flexDirection: 'row',
        gap: 12,
    },
    clearButton: {
        flex: 1,
        borderRadius: 12,
        padding: 14,
        alignItems: 'center',
        borderWidth: 1,
    },
    clearButtonText: {
        fontSize: 15,
        fontWeight: '600',
    },
    testButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
    },
    testButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    hint: {
        fontSize: 12,
        textAlign: 'center',
        fontStyle: 'italic',
    },
    resultsContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    ideaCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
    },
    ideaHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    ideaNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        flexShrink: 0,
    },
    ideaNumberText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    ideaName: {
        fontSize: 17,
        fontWeight: 'bold',
        flex: 1,
        lineHeight: 22,
    },
    ideaDescription: {
        fontSize: 14,
        lineHeight: 20,
        marginLeft: 44,
    },
});