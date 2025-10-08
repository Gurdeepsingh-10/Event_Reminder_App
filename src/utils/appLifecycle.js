import { AppState } from 'react-native';
import { loadEvents, saveEvents } from './storage';

let appStateSubscription = null;
let currentAppState = AppState.currentState;
let unsavedChanges = false;
let eventsCache = [];

/**
 * Mark that there are unsaved changes
 */
export const markUnsavedChanges = (events) => {
    unsavedChanges = true;
    eventsCache = events;
};

/**
 * Save changes when app goes to background
 */
const handleAppStateChange = async (nextAppState) => {
    console.log('📱 App state changed:', currentAppState, '→', nextAppState);

    // App is going to background
    if (currentAppState.match(/active/) && nextAppState.match(/inactive|background/)) {
        console.log('📱 App going to background');

        if (unsavedChanges && eventsCache.length > 0) {
            console.log('💾 Saving unsaved changes before background...');
            await saveEvents(eventsCache);
            unsavedChanges = false;
        }
    }

    // App is coming to foreground
    if (currentAppState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App coming to foreground');

        // Reload events to ensure fresh data
        const reloadedEvents = await loadEvents();
        console.log('🔄 Reloaded events from storage:', reloadedEvents.length);
    }

    currentAppState = nextAppState;
};

/**
 * Initialize app lifecycle listeners
 */
export const initializeAppLifecycle = () => {
    if (appStateSubscription) {
        return; // Already initialized
    }

    console.log('🎬 Initializing app lifecycle listeners');
    appStateSubscription = AppState.addEventListener('change', handleAppStateChange);
};

/**
 * Cleanup app lifecycle listeners
 */
export const cleanupAppLifecycle = () => {
    if (appStateSubscription) {
        console.log('🧹 Cleaning up app lifecycle listeners');
        appStateSubscription.remove();
        appStateSubscription = null;
    }
};