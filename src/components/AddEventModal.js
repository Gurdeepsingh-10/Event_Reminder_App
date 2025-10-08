import React, { useState, useEffect } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import Dropdown from './Dropdown';
import { validateDate } from '../utils/validation';
import { scheduleEventNotification } from '../utils/notifications';
import { useTheme } from '../utils/ThemeContext';

const EVENT_TYPES = [
    { label: 'Birthday', value: 'birthday' },
    { label: 'Anniversary', value: 'anniversary' },
    { label: 'Other', value: 'other' },
];

const RELATIONS = [
    { label: 'Family', value: 'family' },
    { label: 'Friends', value: 'friends' },
    { label: 'Work', value: 'work' },
    { label: 'Other', value: 'other' },
];

const REMINDER_OPTIONS = [
    { label: 'On the day', value: 0 },
    { label: '1 day before', value: 1 },
    { label: '2 days before', value: 2 },
    { label: '3 days before', value: 3 },
    { label: '1 week before', value: 7 },
    { label: '2 weeks before', value: 14 },
    { label: '1 month before', value: 30 },
];

export default function AddEventModal({ visible, onClose, selectedDate, onAddEvent }) {
    const { colors } = useTheme();
    const [day, setDay] = useState('');
    const [month, setMonth] = useState('');
    const [year, setYear] = useState('');
    const [eventName, setEventName] = useState('');
    const [eventType, setEventType] = useState('birthday');
    const [relation, setRelation] = useState('family');
    const [notes, setNotes] = useState('');
    const [reminderDays, setReminderDays] = useState(1);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (selectedDate && visible) {
            const [y, m, d] = selectedDate.split('-');
            setDay(parseInt(d, 10).toString());
            setMonth(parseInt(m, 10).toString());
            setYear(y);
        }
    }, [selectedDate, visible]);

    const handleClear = () => {
        setDay('');
        setMonth('');
        setYear('');
        setEventName('');
        setEventType('birthday');
        setRelation('family');
        setNotes('');
        setReminderDays(1);
        setErrors({});
    };

    const handleAdd = async () => {
        const dateErrors = validateDate(day, month, year);
        const newErrors = { ...dateErrors };

        if (!eventName.trim()) {
            newErrors.eventName = 'Event name is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Alert.alert('Validation Error', 'Please fix the errors before adding the event.');
            return;
        }

        const event = {
            id: Date.now().toString(),
            name: eventName.trim(),
            day: parseInt(day, 10),
            month: parseInt(month, 10),
            year: year ? parseInt(year, 10) : null,
            type: eventType.toLowerCase().trim(),
            relation: relation.toLowerCase().trim(),
            notes: notes.trim(),
            reminderDays: reminderDays,
            createdAt: new Date().toISOString(),
            notificationId: null,
        };

        const notificationId = await scheduleEventNotification(event);
        event.notificationId = notificationId;

        console.log('✅ Event created with notification:', event);

        if (onAddEvent) {
            onAddEvent(event);
        }

        handleClear();
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalOverlay}
            >
                <View style={[styles.modalContent, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <ScrollView showsVerticalScrollIndicator={false}>
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Event</Text>

                        <View style={styles.row}>
                            <View style={styles.dateInput}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Day *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderColor }, errors.day && styles.inputError]}
                                    value={day}
                                    onChangeText={setDay}
                                    placeholder="DD"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                />
                                {errors.day && <Text style={styles.errorText}>{errors.day}</Text>}
                            </View>

                            <View style={styles.dateInput}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Month *</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderColor }, errors.month && styles.inputError]}
                                    value={month}
                                    onChangeText={setMonth}
                                    placeholder="MM"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="number-pad"
                                    maxLength={2}
                                />
                                {errors.month && <Text style={styles.errorText}>{errors.month}</Text>}
                            </View>

                            <View style={styles.dateInput}>
                                <Text style={[styles.label, { color: colors.textPrimary }]}>Year</Text>
                                <TextInput
                                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderColor }, errors.year && styles.inputError]}
                                    value={year}
                                    onChangeText={setYear}
                                    placeholder="YYYY"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="number-pad"
                                    maxLength={4}
                                />
                                {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Event Name / Person *</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderColor }, errors.eventName && styles.inputError]}
                                value={eventName}
                                onChangeText={setEventName}
                                placeholder="e.g., John's Birthday"
                                placeholderTextColor={colors.textSecondary}
                            />
                            {errors.eventName && (
                                <Text style={styles.errorText}>{errors.eventName}</Text>
                            )}
                        </View>

                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Dropdown
                                    label="Event Type"
                                    options={EVENT_TYPES}
                                    value={eventType}
                                    onSelect={setEventType}
                                    placeholder="Select type"
                                />
                            </View>

                            <View style={styles.halfWidth}>
                                <Dropdown
                                    label="Relation"
                                    options={RELATIONS}
                                    value={relation}
                                    onSelect={setRelation}
                                    placeholder="Select relation"
                                />
                            </View>
                        </View>

                        <View style={styles.fieldContainer}>
                            <Text style={[styles.label, { color: colors.textPrimary }]}>Notes (Optional)</Text>
                            <TextInput
                                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.borderColor }]}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Add any notes..."
                                placeholderTextColor={colors.textSecondary}
                                multiline={true}
                                numberOfLines={3}
                            />
                        </View>

                        <Dropdown
                            label="Remind Me"
                            options={REMINDER_OPTIONS}
                            value={reminderDays}
                            onSelect={setReminderDays}
                            placeholder="Select reminder"
                        />

                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.button, styles.addButton, { backgroundColor: colors.accent, borderColor: colors.accentSecondary }]}
                                onPress={handleAdd}
                            >
                                <Text style={styles.buttonText}>Add Event</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.clearButton, { backgroundColor: colors.borderColor }]}
                                onPress={handleClear}
                            >
                                <Text style={styles.buttonText}>Clear</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, styles.closeButton, { backgroundColor: colors.background, borderColor: colors.borderColor }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Close</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 24,
        maxHeight: '90%',
        borderTopWidth: 2,
        borderLeftWidth: 1,
        borderRightWidth: 1,
    },
    modalTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    dateInput: {
        flex: 1,
        marginHorizontal: 4,
    },
    halfWidth: {
        flex: 1,
        marginHorizontal: 4,
    },
    fieldContainer: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        borderWidth: 1,
    },
    inputError: {
        borderColor: '#ff6b6b',
        borderWidth: 2,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    errorText: {
        fontSize: 12,
        color: '#ff6b6b',
        marginTop: 4,
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    button: {
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
    },
    addButton: {
        flex: 1,
        marginRight: 6,
    },
    clearButton: {
        flex: 1,
        marginLeft: 6,
    },
    closeButton: {
        borderWidth: 1,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
});