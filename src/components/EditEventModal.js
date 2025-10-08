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

export default function EditEventModal({ visible, onClose, event, onUpdateEvent, onDeleteEvent }) {
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
        if (event && visible) {
            setDay(event.day.toString());
            setMonth(event.month.toString());
            setYear(event.year ? event.year.toString() : '');
            setEventName(event.name);
            setEventType(event.type);
            setRelation(event.relation);
            setNotes(event.notes || '');
            setReminderDays(event.reminderDays);
            setErrors({});
        }
    }, [event, visible]);

    const handleUpdate = () => {
        const dateErrors = validateDate(day, month, year);
        const newErrors = { ...dateErrors };

        if (!eventName.trim()) {
            newErrors.eventName = 'Event name is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            Alert.alert('Validation Error', 'Please fix the errors before updating.');
            return;
        }

        const updatedEvent = {
            ...event,
            name: eventName.trim(),
            day: parseInt(day, 10),
            month: parseInt(month, 10),
            year: year ? parseInt(year, 10) : null,
            type: eventType.toLowerCase().trim(),
            relation: relation.toLowerCase().trim(),
            notes: notes.trim(),
            reminderDays: reminderDays,
        };

        if (onUpdateEvent) {
            onUpdateEvent(updatedEvent);
        }

        onClose();
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Event',
            `Are you sure you want to delete "${event?.name}"? This cannot be undone.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => {
                        if (onDeleteEvent) {
                            onDeleteEvent(event);
                        }
                        onClose();
                    },
                },
            ]
        );
    };

    if (!event) return null;

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
                        <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Event</Text>

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
                                style={[styles.button, styles.updateButton, { backgroundColor: colors.accent, borderColor: colors.accentSecondary }]}
                                onPress={handleUpdate}
                            >
                                <Text style={styles.buttonText}>Update Event</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.button, styles.deleteButton, { backgroundColor: colors.danger }]}
                                onPress={handleDelete}
                            >
                                <Text style={styles.buttonText}>Delete</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={[styles.button, styles.closeButton, { backgroundColor: colors.background, borderColor: colors.borderColor }]}
                            onPress={onClose}
                        >
                            <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Cancel</Text>
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
    updateButton: {
        flex: 1,
        marginRight: 6,
    },
    deleteButton: {
        flex: 1,
        marginLeft: 6,
        borderColor: '#ff8787',
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