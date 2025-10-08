# Birthday Reminder App - Testing Checklist

## ✅ Basic Functionality

### Events Management
- [ ] Add event with all fields filled
- [ ] Add event with minimal fields (name, date only)
- [ ] Add event without year (recurring)
- [ ] Add event with year (one-time)
- [ ] Edit event name
- [ ] Edit event date
- [ ] Edit event reminder time
- [ ] Delete event
- [ ] Delete all events (Settings)

### Date Validation
- [ ] Try Feb 29 in leap year (2024) - should work
- [ ] Try Feb 29 in non-leap year (2023) - should fail
- [ ] Try Feb 30 - should fail
- [ ] Try April 31 - should fail
- [ ] Try month 13 - should fail
- [ ] Try day 32 - should fail

### Event Types & Relations
- [ ] Add Birthday event
- [ ] Add Anniversary event
- [ ] Add Other event
- [ ] Add Family relation
- [ ] Add Friends relation
- [ ] Add Work relation
- [ ] Add Other relation
- [ ] Verify all combinations display correctly

## ✅ Calendar & Display

### Calendar View
- [ ] Calendar shows current month
- [ ] Tapping date opens add modal with pre-filled date
- [ ] Events show as dots on calendar
- [ ] Birthday = red dot
- [ ] Anniversary = cyan dot
- [ ] Other = yellow dot

### Events List
- [ ] Events grouped by month (November 2025, December 2025, etc.)
- [ ] Each month has different color title
- [ ] Events sorted chronologically
- [ ] Days remaining shown correctly
- [ ] Event cards show all info (name, date, badges