const storage = (function() {
    const _cachedData = {};
    const _unpackers = {};

    const _makeKey = function(dataType, id) {
        return `${dataType}_${id}`;
    };

    const load = function(dataType, id) {
        // !!! Implement loading from local storage
        const key = _makeKey(dataType, id);
        const data = _cachedData[key];
        const unpack = _unpackers[dataType];
        return unpack(data);
    };

    const save = function(storable) {
        // !!! Implement saving to local storage
        const key = _makeKey(storable.dataType, storable.id);
        _cachedData[key] = storable.pack();
        _unpackers[storable.dataType] = storable.unpack;
    };

    return {
        load, save
    }
})();

export default storage;