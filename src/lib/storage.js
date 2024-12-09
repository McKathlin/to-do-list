const storage = (function() {
    const _STORABLE_PROPERTIES = ["id", "typeName"];
    const _STORABLE_METHODS = ["pack", "unpack"];

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
        proto.save = function() {
            if (this._id !== undefined) {
                storage.save(this);
            }
        };
        _unpackers[proto.typeName] = proto.unpack;
    };

    const isStorable = function(proto) {
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
        const json = localStorage.getItem(_makeKey(typeName, id));
        if (!json) {
            return null; // Nothing to load.
        }
        const data = JSON.parse(json);
        const unpack = _unpackers[typeName];
        return unpack(data);
    };

    const save = function(storable) {
        if (!storable) {
            return false;
        }

        try {
            const key = _makeKey(storable.typeName, storable.id);
            localStorage.setItem(key, JSON.stringify(storable.pack()));
            console.log("Saved", key);
            return true;
        } catch (err) {
            console.error("Saving failed!", err);
            return false;
        }
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