// Date validation helpers

export const isLeapYear = (year) => {
    if (!year) return false;
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

export const getDaysInMonth = (month, year) => {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (month === 2 && year && isLeapYear(year)) {
        return 29;
    }

    return daysInMonth[month - 1] || 31;
};

export const validateDate = (day, month, year) => {
    const errors = {};

    // Convert to numbers
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    const yearNum = year ? parseInt(year, 10) : null;

    // Day validation
    if (!day || day === '') {
        errors.day = 'Day is required';
    } else if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
        errors.day = 'Day must be 1-31';
    } else if (month && monthNum >= 1 && monthNum <= 12) {
        const maxDays = getDaysInMonth(monthNum, yearNum);
        if (dayNum > maxDays) {
            const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];
            errors.day = `${monthNames[monthNum]} has only ${maxDays} days`;
        }
    }

    // Month validation
    if (!month || month === '') {
        errors.month = 'Month is required';
    } else if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        errors.month = 'Month must be 1-12';
    }

    // Year validation (optional, but if provided must be valid)
    if (year && year !== '') {
        if (isNaN(yearNum)) {
            errors.year = 'Year must be a number';
        } else if (yearNum < 1900) {
            errors.year = 'Year must be 1900 or later';
        } else if (yearNum > 2100) {
            errors.year = 'Year must be 2100 or earlier';
        }

        // Special Feb 29 validation
        if (monthNum === 2 && dayNum === 29 && !isLeapYear(yearNum)) {
            errors.day = `Feb 29 is only valid in leap years`;
            errors.year = `${yearNum} is not a leap year`;
        }
    }

    // Check if date is valid by trying to create it
    if (Object.keys(errors).length === 0) {
        try {
            const testDate = new Date(yearNum || 2000, monthNum - 1, dayNum);
            if (testDate.getDate() !== dayNum || testDate.getMonth() !== monthNum - 1) {
                errors.day = 'Invalid date';
            }
        } catch (e) {
            errors.day = 'Invalid date';
        }
    }

    return errors;
};

export const formatDate = (day, month, year) => {
    const d = String(day).padStart(2, '0');
    const m = String(month).padStart(2, '0');
    const y = year || 'YYYY';

    return `${d}/${m}/${y}`;
};

// Sanitize date input - remove non-numeric characters
export const sanitizeDateInput = (input) => {
    return input.replace(/[^0-9]/g, '');
};

// Auto-format as user types (e.g., convert "1" to "01" when leaving field)
export const autoFormatDay = (day) => {
    const num = parseInt(day, 10);
    if (isNaN(num)) return '';
    if (num < 1) return '01';
    if (num > 31) return '31';
    return String(num).padStart(2, '0');
};

export const autoFormatMonth = (month) => {
    const num = parseInt(month, 10);
    if (isNaN(num)) return '';
    if (num < 1) return '01';
    if (num > 12) return '12';
    return String(num).padStart(2, '0');
};