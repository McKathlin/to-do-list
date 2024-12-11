

const dateDiffs = (function() {

    // Constants

    const MILLISECONDS_PER_SECOND = 1000;
    const SECONDS_PER_MINUTE = 60;
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 24;

    const TICKS_PER_MILLISECOND = 1;
    const TICKS_PER_SECOND = TICKS_PER_MILLISECOND * MILLISECONDS_PER_SECOND;
    const TICKS_PER_MINUTE = TICKS_PER_SECOND * SECONDS_PER_MINUTE;
    const TICKS_PER_HOUR = TICKS_PER_MINUTE * MINUTES_PER_HOUR;
    const TICKS_PER_DAY = TICKS_PER_HOUR * HOURS_PER_DAY;

    const DAYS_PER_WEEK = 7;
    const BUSINESS_DAYS_PER_WEEK = 5;
    const DAY_NAMES = ["Sunday", "Monday", "Tuesday",
        "Wednesday", "Thursday", "Friday", "Saturday"];
    const IS_BUSINESS_DAY = [false, true, true,
        true, true, true, false];

    // Variables and properties

    // _eodHours = hours from midnight to end of work day
    let _eodHours = 17; // 5:00pm
    
    const hoursToEndOfDay = {
        get: function() {
            return _eodHours;
        },
        set: function(hours) {
            if (typeof hours == "number") {
                _eodHours = hours;
            } else {
                throw new Error("hoursToEndOfDay must be a number!");
            }
        },
    };

    // Date adjustment utilities

    const addOffset = function(aDate, offsetTimeSpan) {
        if (!aDate) {
            return null;
        }
        let offsetTicks = timeSpanToTicks(offsetTimeSpan);
        return new Date(aDate.getTime() + offsetTicks);
    };

    const stripTime = function(aDateTime) {
        if (!aDateTime) {
            return null;
        }
        // Strips the time off of a Date
        // returning the moment that day began.
        return new Date(aDateTime.toDateString());
    };

    // Day-only calculations

    const dayDiff = function(endDate, startDate) {
        if (endDate && startDate) {
            return (stripTime(endDate) - stripTime(startDate)) / TICKS_PER_DAY;
        } else if (endDate) {
            return -Infinity; // No start date.
        } else if (startDate) {
            return Infinity; // No end date.
        } else {
            return 0;
        }
    };

    const dayOfWeekString = function(aDate) {
        if (!aDate) {
            return null;
        }
        return DAY_NAMES[aDate.getDay()];
    };

    const daysFromToday = function(aDate) {
        const now = new Date();
        return dayDiff(aDate, now);
    };

    const daysFromTodayString = function(aDate) {
        if (!aDate) {
            return null;
        }

        const days = daysFromToday(aDate);
        if (days < 0) {
            // It's in the past
            if (-1 == days) {
                return "yesterday";
            } else {
                return `${-days} days ago`;
            }
        } else {
            // It's in the future
            if (days > 7) {
                return `in ${days} days`;
            } else if (days == 1) {
                return "tomorrow";
            } else {
                // It's less than a week away
                return dayOfWeekString(aDate);
            }
        }
    };

    const today = function() {
        let now = new Date();
        return stripTime(now);
    };

    // Business day calculations

    const businessDayDiff = function(endDate, startDate) {
        const daysApart = dayDiff(endDate, startDate);
        if (!Number.isFinite(daysApart)) {
            // Don't try to calculate infinite business days.
            return daysApart;
        }
        const weeks = Math.floor(daysApart / DAYS_PER_WEEK);
        let remainder = daysApart - (weeks * DAYS_PER_WEEK);
        if (endDate.getDay() < startDate.getDay()) {
            // The remainder spans a weekend,
            // so subtract the days of the weekend.
            remainder = Math.max(0,
                remainder - (DAYS_PER_WEEK - BUSINESS_DAYS_PER_WEEK));
        }
        return (weeks * BUSINESS_DAYS_PER_WEEK) + remainder;
    };

    const businessDaysFromToday = function(aDate) {
        const now = new Date();
        return businessDayDiff(aDate, now);
    };

    const isBusinessDay = function(aDate) {
        return IS_BUSINESS_DAY[aDate.getDay()];
    };

    // Date input conversions

    const toInputDateString = function(aDate) {
        if (!aDate) {
            return null;
        }
        return aDate.toISOString().split("T")[0];
    };

    const inputToUTC = function(dateInputStr) {
        if (!dateInputStr) {
            return null;
        }
        return new Date(`${dateInputStr} UTC`);
    };

    const inputToLocal = function(dateInputStr) {
        let utcDate = inputToUTC(dateInputStr);
        let offset = { minutes: new Date().getTimezoneOffset() };
        return addOffset(utcDate, offset);
    };

    const inputToLocalEOD = function(dateInputStr) {
        let utcDate = inputToUTC(dateInputStr);
        let offset = {
            hours: hoursToEndOfDay.get(),
            minutes: new Date().getTimezoneOffset()
        };
        return addOffset(utcDate, offset);
    };

    const timeSpanToTicks = function(timeSpan) {
        if (!timeSpan) {
            return 0;
        }
        let ticks = 0;
        ticks += (timeSpan.days ?? 0) * TICKS_PER_DAY;
        ticks += (timeSpan.hours ?? 0) * TICKS_PER_HOUR;
        ticks += (timeSpan.minutes ?? 0) * TICKS_PER_MINUTE;
        ticks += (timeSpan.seconds ?? 0) * TICKS_PER_SECOND;
        ticks += (timeSpan.milliseconds ?? 0) * TICKS_PER_MILLISECOND;
        return ticks;
    };

    // Module build

    let myModule = {
        addOffset, stripTime,
        dayDiff, daysFromToday, daysFromTodayString, today,
        businessDayDiff, businessDaysFromToday, isBusinessDay,
        toInputDateString, inputToUTC, inputToLocal, inputToLocalEOD,
    };

    Object.defineProperties(myModule, {
        hoursToEndOfDay,
    });

    return myModule;
})();

export default dateDiffs;
