const storage = (function() {
    const _STORABLE_PROPERTIES = ["id", "typeName"];
    const _STORABLE_METHODS = ["pack", "unpack"];

    const _cachedData = {};
    const _unpackers = {};

    // Public methods

    const registerType = function(proto) {
        if (!isStorable(proto)) {
            const usageMessage =
                "Storable functions require the following:" +
                "\nProperties: " + _STORABLE_PROPERTIES.join(", ") +
                "\nMethods" + _STORABLE_METHODS.join(", ");
            throw new Error(usageMessage);
        }
        _unpackers[proto.typeName] = proto.unpack;
    };

    const isStorable = function(proto) {
        console.log("Checking storability:", proto);
        for (const prop of _STORABLE_PROPERTIES) {
            if (prop in proto == false) {
                return false;
            }
        }

        for (const method of _STORABLE_METHODS) {
            if (typeof proto[method] != "function") {
                return false;
            }
        }
        return true;
    };

    const load = function(typeName, id) {
        // !!! Implement loading from local storage
        const key = _makeKey(typeName, id);
        const data = _cachedData[key];
        const unpack = _unpackers[typeName];
        return unpack(data);
    };

    const save = function(storable) {
        // !!! Implement saving to local storage
        const key = _makeKey(storable.typeName, storable.id);
        _cachedData[key] = storable.pack();
    };

    // Private helpers

    const _makeKey = function(typeName, id) {
        return `${typeName}_${id}`;
    };

    // Module returns

    return {
        registerType, load, save
    }
})();

export default storage;