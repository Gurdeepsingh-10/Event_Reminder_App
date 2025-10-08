import React, { useState, useEffect } from 'react';
import { initializeAppLifecycle, markUnsavedChanges } from '../utils/appLifecycle';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import FloatingActionButton from '../components/FloatingActionButton';
import AddEventModal from '../components/AddEventModal';
import EditEventModal from '../components/EditEventModal';
import { loadEvents, saveEvents, deleteEventById, updateEventById } from '../utils/storage';
import {
    getDaysUntilEvent,
    formatEventDate,
    sortEventsByDate,
    getUpcomingAge,
} from '../utils/dateCalculations';
import {
    cancelEventNotifications,
    rescheduleEventNotification
} from '../utils/notifications';
import { useTheme } from '../utils/ThemeContext';

export default function EventsScreen() {
    const { colors } = useTheme();
    const [selectedDate, setSelectedDate] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        console.log('🔵 EventsScreen mounted, loading events...');
        loadEventsFromStorage();
    }, []);

    const loadEventsFromStorage = async () => {
        console.log('🔵 START loadEventsFromStorage');
        setLoading(true);

        try {
            let loadedEvents = await loadEvents();
            console.log('🔵 Raw loaded events:', JSON.stringify(loadedEvents, null, 2));

            // Fix any case issues in existing data
            loadedEvents = loadedEvents.map(event => ({
                ...event,
                type: (event.type || 'other').toLowerCase().trim(),
                relation: (event.relation || 'other').toLowerCase().trim(),
            }));

            console.log('🔵 After normalization:', JSON.stringify(loadedEvents, null, 2));

            // Save corrected data
            if (loadedEvents.length > 0) {
                await saveEvents(loadedEvents);
                console.log('🔵 Saved normalized events');
            }

            console.log('📋 FINAL LOADED EVENTS:', loadedEvents.length);
            loadedEvents.forEach((e, i) => {
                console.log(`  ${i + 1}. ${e.name}: type="${e.type}", relation="${e.relation}"`);
            });

            setEvents(loadedEvents);
            console.log('🔵 State updated with events');
        } catch (error) {
            console.error('❌ Error loading events:', error);
            Alert.alert('Error', 'Failed to load events: ' + error.message);
        }

        setLoading(false);
        console.log('🔵 END loadEventsFromStorage');
    };

    // Debug: Log whenever events state changes
    useEffect(() => {
        console.log('🟢 Events state changed:', events.length, 'events');
    }, [events]);

    const onRefresh = async () => {
        console.log('🔄 Pull to refresh triggered');
        setRefreshing(true);
        await loadEventsFromStorage();
        setRefreshing(false);
    };

    const handleDayPress = (day) => {
        console.log('📅 Day pressed:', day.dateString);
        setSelectedDate(day.dateString);
        setModalVisible(true);
    };

    const handleAddEvent = () => {
        console.log('➕ Add event button pressed');
        setSelectedDate('');
        setModalVisible(true);
    };

    const handleEventAdded = async (event) => {
        console.log('➕ handleEventAdded called with:', JSON.stringify(event, null, 2));

        try {
            const updatedEvents = [...events, event];
            console.log('📊 Updated events array:', updatedEvents.length, 'events');

            await saveEvents(updatedEvents);
            console.log('💾 Saved to storage');

            setEvents(updatedEvents);
            console.log('✅ State updated');

            // Force a reload after brief delay
            setTimeout(async () => {
                console.log('🔄 Force reloading from storage...');
                const reloaded = await loadEvents();
                console.log('🔄 Reloaded:', reloaded.length, 'events');
                setEvents(reloaded);
            }, 200);

            Alert.alert('Success', 'Event added successfully!');
        } catch (error) {
            console.error('❌ Error adding event:', error);
            Alert.alert('Error', 'Failed to add event: ' + error.message);
        }
    };

    const handleEventPress = (event) => {
        console.log('👆 Event card pressed:', event.name);
        setSelectedEvent(event);
        setEditModalVisible(true);
    };

    const handleUpdateEvent = async (updatedEvent) => {
        console.log('✏️ Updating event:', updatedEvent.name);
        await cancelEventNotifications(updatedEvent);
        const newNotificationId = await rescheduleEventNotification(updatedEvent);
        updatedEvent.notificationId = newNotificationId;
        const updatedEvents = await updateEventById(updatedEvent.id, updatedEvent, events);
        setEvents(updatedEvents);
    };

    const handleDeleteEvent = async (event) => {
        console.log('🗑️ Deleting event:', event.name);
        await cancelEventNotifications(event);
        const updatedEvents = await deleteEventById(event.id, events);
        setEvents(updatedEvents);
    };

    // Sort all events by date
    console.log('🔵 Sorting events. Input:', events.length);
    const sortedEvents = sortEventsByDate(events);
    console.log('🔵 Sorted events:', sortedEvents.length);


    // Group events by month
    const groupedEventsByMonth = {};
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const monthColors = {
        'January': '#1abc9c',
        'February': '#e74c3c',
        'March': '#3498db',
        'April': '#9b59b6',
        'May': '#2ecc71',
        'June': '#f1c40f',
        'July': '#e67e22',
        'August': '#e91e63',
        'September': '#00bcd4',
        'October': '#ff9800',
        'November': '#ff6b6b',
        'December': '#4ecdc4',
    };

    console.log('🔵 Grouping events by month...');
    sortedEvents.forEach((event, index) => {
        try {
            const days = getDaysUntilEvent(event.day, event.month, event.year);
            console.log(`  ${index + 1}. ${event.name}: ${days} days until (day: ${event.day}, month: ${event.month}, year: ${event.year})`);

            // Handle negative days (past dates with specific years)
            let adjustedDays = days;
            if (days < 0 && event.year) {
                const nextOccurrence = getDaysUntilEvent(event.day, event.month, null);
                console.log(`  🔄 Past year detected, recalculating without year: ${nextOccurrence} days`);
                adjustedDays = nextOccurrence;
            }

            // Calculate which month this event will occur in
            const today = new Date();
            const futureDate = new Date(today);
            futureDate.setDate(futureDate.getDate() + adjustedDays);

            const eventMonth = monthNames[futureDate.getMonth()];
            const eventYear = futureDate.getFullYear();
            const monthKey = `${eventMonth} ${eventYear}`;

            if (!groupedEventsByMonth[monthKey]) {
                groupedEventsByMonth[monthKey] = [];
            }

            groupedEventsByMonth[monthKey].push(event);
            console.log(`  📅 Grouped into: ${monthKey}`);

        } catch (error) {
            console.error(`❌ Error processing event ${event.name}:`, error);
            // Put error events in current month as fallback
            const currentMonth = monthNames[new Date().getMonth()];
            const currentYear = new Date().getFullYear();
            const fallbackKey = `${currentMonth} ${currentYear}`;
            if (!groupedEventsByMonth[fallbackKey]) {
                groupedEventsByMonth[fallbackKey] = [];
            }
            groupedEventsByMonth[fallbackKey].push(event);
        }
    });

    // Sort month keys chronologically
    const sortedMonthKeys = Object.keys(groupedEventsByMonth).sort((a, b) => {
        const [monthA, yearA] = a.split(' ');
        const [monthB, yearB] = b.split(' ');
        const dateA = new Date(parseInt(yearA), monthNames.indexOf(monthA));
        const dateB = new Date(parseInt(yearB), monthNames.indexOf(monthB));
        return dateA - dateB;
    });

    console.log('🔵 Grouped by months:', sortedMonthKeys);
    // Generate marked dates for calendar
    const markedDates = {};
    if (selectedDate) {
        markedDates[selectedDate] = {
            selected: true,
            selectedColor: colors.accent,
        };
    }

    events.forEach((event) => {
        try {
            const currentYear = new Date().getFullYear();
            const dateStr = `${currentYear}-${String(event.month).padStart(2, '0')}-${String(event.day).padStart(2, '0')}`;
            markedDates[dateStr] = {
                ...markedDates[dateStr],
                marked: true,
                dotColor: event.type === 'birthday' ? '#ff6b6b' : event.type === 'anniversary' ? '#4ecdc4' : '#feca57',
            };
        } catch (error) {
            console.error('❌ Error marking date for:', event.name, error);
        }
    });

    // Get badge colors based on type and relation
    const getTypeBadgeColor = (type) => {
        switch (type) {
            case 'birthday': return '#ff6b6b';
            case 'anniversary': return '#4ecdc4';
            default: return '#feca57';
        }
    };

    const getRelationBadgeColor = (relation) => {
        switch (relation) {
            case 'family': return colors.accent;
            case 'friends': return '#48dbfb';
            case 'work': return '#ff9ff3';
            default: return '#a29bfe';
        }
    };

    const renderEventCard = (event) => {
        console.log('🎨 Rendering event card:', event.name);

        try {
            const daysUntil = getDaysUntilEvent(event.day, event.month, event.year);
            const upcomingAge = getUpcomingAge(event.day, event.month, event.year);

            return (
                <TouchableOpacity
                    key={event.id}
                    style={[styles.eventCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}
                    onPress={() => handleEventPress(event)}
                    activeOpacity={0.7}
                >
                    <View style={styles.eventLeft}>
                        <Text style={[styles.eventName, { color: colors.textPrimary }]}>{event.name}</Text>
                        <Text style={[styles.eventDate, { color: colors.textSecondary }]}>
                            {formatEventDate(event.day, event.month, event.year)}
                        </Text>

                        {/* Badges Row */}
                        <View style={styles.badgesRow}>
                            {/* Type Badge */}
                            <View style={[styles.badge, { backgroundColor: getTypeBadgeColor(event.type) }]}>
                                <Text style={styles.badgeText}>
                                    {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                </Text>
                            </View>

                            {/* Relation Badge */}
                            <View style={[styles.badge, { backgroundColor: getRelationBadgeColor(event.relation) }]}>
                                <Text style={styles.badgeText}>
                                    {event.relation.charAt(0).toUpperCase() + event.relation.slice(1)}
                                </Text>
                            </View>

                            {/* Age Badge (if available) */}
                            {upcomingAge !== null && (
                                <View style={[styles.badge, { backgroundColor: '#54a0ff' }]}>
                                    <Text style={styles.badgeText}>Turning {upcomingAge}</Text>
                                </View>
                            )}
                        </View>

                        {/* Notes */}
                        {event.notes && event.notes.trim() !== '' && (
                            <Text style={[styles.eventNotes, { color: colors.textSecondary }]} numberOfLines={2}>
                                📝 {event.notes}
                            </Text>
                        )}
                    </View>

                    {/* Days Badge */}
                    <View
                        style={[
                            styles.eventRight,
                            { backgroundColor: colors.borderColor },
                            daysUntil === 0 && { backgroundColor: '#ff6b6b' },
                            daysUntil === 1 && { backgroundColor: '#feca57' },
                        ]}
                    >
                        <Text style={styles.daysLeft}>{daysUntil}</Text>
                        <Text style={styles.daysLabel}>
                            {daysUntil === 0 ? 'today' : daysUntil === 1 ? 'day' : 'days'}
                        </Text>
                    </View>
                </TouchableOpacity>
            );
        } catch (error) {
            console.error('❌ Error rendering card for:', event.name, error);
            return (
                <View key={event.id} style={[styles.eventCard, { backgroundColor: '#ff0000' }]}>
                    <Text style={{ color: '#fff' }}>Error rendering: {event.name}</Text>
                </View>
            );
        }
    };

    const renderSection = (monthKey, sectionEvents) => {
        console.log(`📂 renderSection called: ${monthKey} with ${sectionEvents.length} events`);

        if (sectionEvents.length === 0) {
            console.log(`📂 Section ${monthKey} is empty, not rendering`);
            return null;
        }

        const [monthName, year] = monthKey.split(' ');
        const monthColor = monthColors[monthName] || colors.accent;

        console.log(`📂 Rendering section ${monthKey} with events:`, sectionEvents.map(e => e.name));

        return (
            <View key={monthKey} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: monthColor }]}>
                    {monthName} {year} ({sectionEvents.length})
                </Text>
                {sectionEvents.map(event => {
                    console.log(`  🎨 Mapping event: ${event.name}`);
                    return renderEventCard(event);
                })}
            </View>
        );
    };

    console.log('🔵 Checking loading state:', loading);
    if (loading) {
        console.log('🔵 Showing loading screen');
        return (
            <View style={[styles.container, styles.centerContent, { backgroundColor: colors.background }]}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading events...</Text>
            </View>
        );
    }

    console.log('🔵 Rendering main content');
    console.log('🔵 sortedEvents.length:', sortedEvents.length);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.accent}
                        colors={[colors.accent]}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>All Events</Text>
                    <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                        {events.length} {events.length === 1 ? 'event' : 'events'} tracked
                    </Text>
                </View>



                {/* Calendar */}
                <View style={[styles.calendarCard, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                    <Calendar
                        current={new Date().toISOString().split('T')[0]}
                        onDayPress={handleDayPress}
                        markedDates={markedDates}
                        theme={{
                            calendarBackground: colors.cardBackground,
                            textSectionTitleColor: colors.textSecondary,
                            selectedDayBackgroundColor: colors.accent,
                            selectedDayTextColor: '#ffffff',
                            todayTextColor: colors.accent,
                            dayTextColor: colors.textPrimary,
                            textDisabledColor: colors.borderColor,
                            monthTextColor: colors.textPrimary,
                            textMonthFontSize: 18,
                            textMonthFontWeight: 'bold',
                            arrowColor: colors.accent,
                            textDayFontSize: 14,
                            textDayHeaderFontSize: 12,
                        }}
                        style={styles.calendar}
                    />
                </View>

                {/* Legend */}
                <View style={styles.legendSection}>
                    <Text style={[styles.legendTitle, { color: colors.textSecondary }]}>Legend:</Text>
                    <View style={styles.legendRow}>
                        <View style={[styles.legendItem]}>
                            <View style={[styles.legendDot, { backgroundColor: '#ff6b6b' }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Birthday</Text>
                        </View>
                        <View style={[styles.legendItem]}>
                            <View style={[styles.legendDot, { backgroundColor: '#4ecdc4' }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Anniversary</Text>
                        </View>
                        <View style={[styles.legendItem]}>
                            <View style={[styles.legendDot, { backgroundColor: '#feca57' }]} />
                            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Other</Text>
                        </View>
                    </View>
                </View>


                {/* Events List */}
                <View style={styles.eventsSection}>
                    {console.log('🔵 About to render events, sortedEvents.length:', sortedEvents.length)}
                    {sortedEvents.length === 0 ? (
                        <>
                            {console.log('🔵 Rendering empty state')}
                            <View style={[styles.emptyState, { backgroundColor: colors.cardBackground, borderColor: colors.borderColor }]}>
                                <Text style={[styles.emptyText, { color: colors.textPrimary }]}>
                                    No events yet
                                </Text>
                                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                                    Tap the + button to add your first event
                                </Text>
                            </View>
                        </>
                    ) : (
                        <>
                            {console.log('🔵 Rendering month sections')}
                            {sortedMonthKeys.map(monthKey => renderSection(monthKey, groupedEventsByMonth[monthKey]))}
                            {console.log('🔵 Finished rendering all month sections')}
                        </>
                    )}
                </View>
            </ScrollView>

            <FloatingActionButton onPress={handleAddEvent} />

            <AddEventModal
                visible={modalVisible}
                onClose={() => {
                    console.log('❌ Closing add modal');
                    setModalVisible(false);
                }}
                selectedDate={selectedDate}
                onAddEvent={handleEventAdded}
            />

            <EditEventModal
                visible={editModalVisible}
                onClose={() => {
                    console.log('❌ Closing edit modal');
                    setEditModalVisible(false);
                    setSelectedEvent(null);
                }}
                event={selectedEvent}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContent: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
    },
    header: {
        paddingTop: 60,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    headerTitle: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    debugPanel: {
        marginHorizontal: 20,
        marginBottom: 16,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
    },
    debugTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    debugText: {
        fontSize: 12,
        marginBottom: 4,
    },
    calendarCard: {
        marginHorizontal: 16,
        marginBottom: 16,
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    calendar: {
        borderRadius: 16,
    },
    legendSection: {
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    legendTitle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
    },
    legendRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    legendText: {
        fontSize: 12,
    },
    eventsSection: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    emptyState: {
        borderRadius: 16,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderStyle: 'dashed',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        textAlign: 'center',
    },
    eventCard: {
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
    },
    eventLeft: {
        flex: 1,
        marginRight: 12,
    },
    eventName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    eventDate: {
        fontSize: 14,
        marginBottom: 8,
    },
    badgesRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 6,
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#ffffff',
        textTransform: 'capitalize',
    },
    eventNotes: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: 4,
    },
    eventRight: {
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 12,
        minWidth: 70,
    },
    daysLeft: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    daysLabel: {
        fontSize: 12,
        color: '#ffffff',
    },
});