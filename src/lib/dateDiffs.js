

const dateDiffs = (function() {
    
    const MILLISECONDS_PER_SECOND = 1000;
    const SECONDS_PER_MINUTE = 60;
    const MINUTES_PER_HOUR = 60;
    const HOURS_PER_DAY = 24;

    const TICKS_PER_MILLISECOND = 1;
    const TICKS_PER_SECOND = TICKS_PER_MILLISECOND * MILLISECONDS_PER_SECOND;
    const TICKS_PER_MINUTE = TICKS_PER_SECOND * SECONDS_PER_MINUTE;
    const TICKS_PER_HOUR = TICKS_PER_MINUTE * MINUTES_PER_HOUR;
    const TICKS_PER_DAY = TICKS_PER_HOUR * HOURS_PER_DAY;

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

    const addOffset = function(aDate, offsetTimeSpan) {
        let offsetTicks = timeSpanToTicks(offsetTimeSpan);
        return new Date(aDate.getTime() + offsetTicks);
    };

    const inputToUTC = function(dateInputStr) {
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
        let ticks = 0;
        ticks += (timeSpan.days ?? 0) * TICKS_PER_DAY;
        ticks += (timeSpan.hours ?? 0) * TICKS_PER_HOUR;
        ticks += (timeSpan.minutes ?? 0) * TICKS_PER_MINUTE;
        ticks += (timeSpan.seconds ?? 0) * TICKS_PER_SECOND;
        ticks += (timeSpan.milliseconds ?? 0) * TICKS_PER_MILLISECOND;
        return ticks;
    };

    let myModule = {
        inputToUTC, inputToLocal, inputToLocalEOD,
        addOffset
    };

    Object.defineProperties(myModule, {
        hoursToEndOfDay,
    });

    return myModule;
})();

export default dateDiffs;
