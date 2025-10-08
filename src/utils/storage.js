import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const EVENTS_KEY = '@birthday_app_events';
const SETTINGS_KEY = '@birthday_app_settings';
const BACKUP_EVENTS_KEY = '@birthday_app_events_backup';

// Lock to prevent concurrent saves
let saveLock = false;
let pendingSave = null;

// ===== SAFE ATOMIC SAVE =====

/**
 * Atomic save with backup - prevents data corruption
 */
const atomicSave = async (key, data) => {
    const backupKey = key + '_backup';

    try {
        // Create backup of current data first
        const currentData = await AsyncStorage.getItem(key);
        if (currentData) {
            await AsyncStorage.setItem(backupKey, currentData);
        }

        // Save new data
        const jsonValue = JSON.stringify(data);
        await AsyncStorage.setItem(key, jsonValue);

        // Verify the save
        const verification = await AsyncStorage.getItem(key);
        if (!verification || verification !== jsonValue) {
            throw new Error('Data verification failed');
        }

        return true;
    } catch (error) {
        console.error('❌ Atomic save failed, attempting restore from backup:', error);

        // Try to restore from backup
        try {
            const backupData = await AsyncStorage.getItem(backupKey);
            if (backupData) {
                await AsyncStorage.setItem(key, backupData);
                console.log('✅ Restored from backup');
            }
        } catch (restoreError) {
            console.error('❌ Backup restore failed:', restoreError);
        }

        throw error;
    }
};

/**
 * Queue-based save to prevent concurrent writes
 */
const queuedSave = async (key, data) => {
    // If a save is in progress, queue this save
    if (saveLock) {
        console.log('💾 Save queued, waiting for lock...');
        pendingSave = { key, data };

        // Wait for lock to be released
        while (saveLock) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }

        // If there's still a pending save and it's ours, proceed
        if (pendingSave && pendingSave.key === key) {
            pendingSave = null;
        } else {
            return; // Another save took over
        }
    }

    // Acquire lock
    saveLock = true;

    try {
        await atomicSave(key, data);
    } finally {
        // Release lock
        saveLock = false;

        // Process any pending save
        if (pendingSave) {
            const { key: pendingKey, data: pendingData } = pendingSave;
            pendingSave = null;
            queuedSave(pendingKey, pendingData);
        }
    }
};

// ===== EVENTS STORAGE =====

/**
 * Save all events to AsyncStorage with atomic write
 */
export const saveEvents = async (events) => {
    try {
        console.log('💾 Saving events:', events.length);
        await queuedSave(EVENTS_KEY, events);
        console.log('✅ Events saved successfully');
        return true;
    } catch (error) {
        console.error('❌ Error saving events:', error);
        return false;
    }
};

/**
 * Load all events from AsyncStorage with backup recovery
 */
export const loadEvents = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(EVENTS_KEY);
        if (jsonValue !== null) {
            const events = JSON.parse(jsonValue);

            // Validate data structure
            if (!Array.isArray(events)) {
                throw new Error('Invalid events data structure');
            }

            console.log(`✅ Loaded ${events.length} events from storage`);
            return events;
        }

        // Try backup if main data doesn't exist
        console.log('ℹ️ No events found, checking backup...');
        const backupValue = await AsyncStorage.getItem(BACKUP_EVENTS_KEY);
        if (backupValue !== null) {
            const backupEvents = JSON.parse(backupValue);
            console.log(`✅ Restored ${backupEvents.length} events from backup`);
            return backupEvents;
        }

        console.log('ℹ️ No events or backup found');
        return [];
    } catch (error) {
        console.error('❌ Error loading events:', error);

        // Last resort: try backup
        try {
            const backupValue = await AsyncStorage.getItem(BACKUP_EVENTS_KEY);
            if (backupValue) {
                const backupEvents = JSON.parse(backupValue);
                console.log(`✅ Recovered ${backupEvents.length} events from backup after error`);
                return backupEvents;
            }
        } catch (backupError) {
            console.error('❌ Backup recovery also failed:', backupError);
        }

        return [];
    }
};

/**
 * Delete a single event by ID
 */
export const deleteEventById = async (eventId, currentEvents) => {
    try {
        const updatedEvents = currentEvents.filter(event => event.id !== eventId);
        await saveEvents(updatedEvents);
        console.log('✅ Event deleted successfully:', eventId);
        return updatedEvents;
    } catch (error) {
        console.error('❌ Error deleting event:', error);
        return currentEvents;
    }
};

/**
 * Update a single event by ID
 */
export const updateEventById = async (eventId, updatedEventData, currentEvents) => {
    try {
        const updatedEvents = currentEvents.map(event =>
            event.id === eventId
                ? { ...event, ...updatedEventData, updatedAt: new Date().toISOString() }
                : event
        );
        await saveEvents(updatedEvents);
        console.log('✅ Event updated successfully:', eventId);
        return updatedEvents;
    } catch (error) {
        console.error('❌ Error updating event:', error);
        return currentEvents;
    }
};

/**
 * Clear all events from storage
 */
export const clearAllEvents = async () => {
    try {
        await AsyncStorage.removeItem(EVENTS_KEY);
        await AsyncStorage.removeItem(BACKUP_EVENTS_KEY);
        console.log('✅ All events cleared');
        return true;
    } catch (error) {
        console.error('❌ Error clearing events:', error);
        return false;
    }
};

// ===== SETTINGS STORAGE =====

const DEFAULT_SETTINGS = {
    theme: 'dark',
    defaultReminderDays: 1,
    notificationSound: true,
};

export const saveSettings = async (settings) => {
    try {
        await queuedSave(SETTINGS_KEY, settings);
        console.log('✅ Settings saved successfully');
        return true;
    } catch (error) {
        console.error('❌ Error saving settings:', error);
        return false;
    }
};

export const loadSettings = async () => {
    try {
        const jsonValue = await AsyncStorage.getItem(SETTINGS_KEY);
        if (jsonValue !== null) {
            const settings = JSON.parse(jsonValue);
            console.log('✅ Settings loaded');
            return settings;
        }
        console.log('ℹ️ No settings found, using defaults');
        return DEFAULT_SETTINGS;
    } catch (error) {
        console.error('❌ Error loading settings:', error);
        return DEFAULT_SETTINGS;
    }
};

export const updateSetting = async (key, value) => {
    try {
        const currentSettings = await loadSettings();
        const updatedSettings = { ...currentSettings, [key]: value };
        await saveSettings(updatedSettings);
        console.log(`✅ Setting '${key}' updated`);
        return updatedSettings;
    } catch (error) {
        console.error('❌ Error updating setting:', error);
        return null;
    }
};

// ===== UTILITY FUNCTIONS =====

export const getAllStorageData = async () => {
    try {
        const events = await loadEvents();
        const settings = await loadSettings();
        return { events, settings };
    } catch (error) {
        console.error('❌ Error loading all data:', error);
        return { events: [], settings: DEFAULT_SETTINGS };
    }
};

export const clearAllData = async () => {
    try {
        await AsyncStorage.multiRemove([EVENTS_KEY, SETTINGS_KEY, BACKUP_EVENTS_KEY]);
        console.log('✅ All data cleared');
        return true;
    } catch (error) {
        console.error('❌ Error clearing all data:', error);
        return false;
    }
};

export const debugStorage = async () => {
    try {
        const keys = await AsyncStorage.getAllKeys();
        console.log('🐛 Storage keys:', keys);

        const data = await AsyncStorage.multiGet(keys);
        console.log('🐛 Storage data:');
        data.forEach(([key, value]) => {
            console.log(`  ${key}:`, value ? JSON.parse(value) : null);
        });
    } catch (error) {
        console.error('❌ Error debugging storage:', error);
    }
};

// Keep legacy function names for compatibility
export const deleteEvent = deleteEventById;
export const updateEvent = updateEventById;