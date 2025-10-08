// Comprehensive date calculation utilities

/**
 * Calculate days until next occurrence of an event
 * Handles both events with specific years and recurring events (no year)
 */
export const getDaysUntilEvent = (day, month, year) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentYear = today.getFullYear();

    // If year is specified AND it's in the future, calculate for that specific date
    if (year && year >= currentYear) {
        const eventDate = new Date(year, month - 1, day);
        eventDate.setHours(0, 0, 0, 0);

        const diffTime = eventDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays;
    }

    // For recurring events (no year OR past year like birth year), find next occurrence
    let nextDate = new Date(currentYear, month - 1, day);
    nextDate.setHours(0, 0, 0, 0);

    // If the date has passed this year, use next year
    if (nextDate < today) {
        nextDate = new Date(currentYear + 1, month - 1, day);
    }

    const diffTime = nextDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays;
};

/**
 * Get the next occurrence date of an event
 */
export const getNextOccurrenceDate = (day, month, year) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentYear = today.getFullYear();

    if (year) {
        return new Date(year, month - 1, day);
    }

    let nextDate = new Date(currentYear, month - 1, day);
    if (nextDate < today) {
        nextDate = new Date(currentYear + 1, month - 1, day);
    }

    return nextDate;
};

/**
 * Format date for display
 */
export const formatEventDate = (day, month, year) => {
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const nextDate = getNextOccurrenceDate(day, month, year);
    const dayName = nextDate.toLocaleDateString('en-US', { weekday: 'long' });
    const displayYear = year || nextDate.getFullYear();

    return `${dayName}, ${day} ${months[month - 1]} ${displayYear}`;
};

/**
 * Format days remaining as human-readable text
 */
export const formatDaysRemaining = (days) => {
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return `${Math.abs(days)} days ago`;
    if (days < 7) return `In ${days} days`;
    if (days < 14) return `In 1 week`;
    if (days < 30) return `In ${Math.floor(days / 7)} weeks`;
    if (days < 60) return `In 1 month`;
    if (days < 365) return `In ${Math.floor(days / 30)} months`;
    return `In ${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? 's' : ''}`;
};

/**
 * Calculate age/years if year is provided
 */
export const calculateAge = (day, month, year) => {
    if (!year) return null;

    const today = new Date();
    const birthDate = new Date(year, month - 1, day);

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return age;
};

/**
 * Get upcoming age (for next birthday)
 */
/**
 * Get upcoming age (for next birthday)
 */
export const getUpcomingAge = (day, month, year) => {
    if (!year) return null;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // JavaScript months are 0-indexed
    const currentDay = today.getDate();

    // Calculate current age
    let age = currentYear - year;

    // Check if birthday hasn't happened yet this year
    if (currentMonth < month || (currentMonth === month && currentDay < day)) {
        age = age - 1; // Birthday hasn't happened yet this year
    }

    // Upcoming age is current age + 1 (for next birthday)
    const upcomingAge = age + 1;

    console.log(`Age calculation: Born ${day}/${month}/${year}, Current: ${currentDay}/${currentMonth}/${currentYear}, Current age: ${age}, Upcoming: ${upcomingAge}`);

    return upcomingAge;
};

/**
 * Group events by time period
 */
export const groupEventsByPeriod = (events) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const groups = {
        today: [],
        thisWeek: [],
        thisMonth: [],
        later: [],
        past: [],
    };

    events.forEach((event) => {
        const days = getDaysUntilEvent(event.day, event.month, event.year);

        if (days < 0) {
            groups.past.push(event);
        } else if (days === 0) {
            groups.today.push(event);
        } else if (days <= 7) {
            groups.thisWeek.push(event);
        } else if (days <= 30) {
            groups.thisMonth.push(event);
        } else {
            groups.later.push(event);
        }
    });

    return groups;
};

/**
 * Sort events by next occurrence
 */
export const sortEventsByDate = (events) => {
    return [...events].sort((a, b) => {
        const daysA = getDaysUntilEvent(a.day, a.month, a.year);
        const daysB = getDaysUntilEvent(b.day, b.month, b.year);
        return daysA - daysB;
    });
};

/**
 * Check if event is today
 */
export const isToday = (day, month, year) => {
    const today = new Date();
    const eventDate = getNextOccurrenceDate(day, month, year);

    return (
        today.getDate() === eventDate.getDate() &&
        today.getMonth() === eventDate.getMonth() &&
        today.getFullYear() === eventDate.getFullYear()
    );
};

/**
 * Check if event is within next N days
 */
export const isWithinDays = (day, month, year, numDays) => {
    const days = getDaysUntilEvent(day, month, year);
    return days >= 0 && days <= numDays;
};