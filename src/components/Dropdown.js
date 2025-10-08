import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
} from 'react-native';
import { useTheme } from '../utils/ThemeContext';

export default function Dropdown({ label, options, value, onSelect, placeholder }) {
    const { colors } = useTheme();
    const [modalVisible, setModalVisible] = useState(false);

    const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder;

    return (
        <View style={styles.container}>
            {label && <Text style={[styles.label, { color: colors.textPrimary }]}>{label}</Text>}

            <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.background, borderColor: colors.borderColor }]}
                onPress={() => setModalVisible(true)}
            >
                <Text style={[styles.buttonText, !value && styles.placeholder, { color: value ? colors.textPrimary : colors.textSecondary }]}>
                    {selectedLabel}
                </Text>
                <Text style={[styles.arrow, { color: colors.accent }]}>▼</Text>
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={[styles.modalContent, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>{label}</Text>
                        <FlatList
                            data={options}
                            keyExtractor={(item) => item.value}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.option,
                                        { borderBottomColor: colors.borderColor },
                                        item.value === value && { backgroundColor: colors.accent + '33' },
                                    ]}
                                    onPress={() => {
                                        onSelect(item.value);
                                        setModalVisible(false);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            { color: colors.textPrimary },
                                            item.value === value && { color: colors.accent, fontWeight: '600' },
                                        ]}
                                    >
                                        {item.label}
                                    </Text>
                                    {item.value === value && (
                                        <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>
                                    )}
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    button: {
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 16,
    },
    placeholder: {
        fontStyle: 'italic',
    },
    arrow: {
        fontSize: 12,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        borderRadius: 16,
        padding: 20,
        width: '80%',
        maxHeight: '60%',
        borderWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    option: {
        padding: 16,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionText: {
        fontSize: 16,
    },
    checkmark: {
        fontSize: 18,
    },
});