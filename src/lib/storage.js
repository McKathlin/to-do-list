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
        if (!proto.save) {
            proto.save = function() {
                if (this._id !== undefined) {
                    storage.save(this);
                }
            };
        }
        if (!proto.wipeSave) {
            proto.wipeSave = function() {
                if (!this._id !== undefined) {
                    storage.wipe(this);
                }
            }
        }
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

        try {
            const data = JSON.parse(json);
            const unpack = _unpackers[typeName];
            return unpack(data);
        } catch (err) {
            console.error("Loading failed!", err);
            return null;
        }
        
    };

    const save = function(storable) {
        if (!storable) {
            return false;
        }

        try {
            const key = _makeKey(storable.typeName, storable.id);
            localStorage.setItem(key, JSON.stringify(storable.pack()));
            return true;
        } catch (err) {
            console.error("Saving failed!", err);
            return false;
        }
    };

    const wipe = function(storable) {
        if (!storable) {
            return false;
        }

        try {
            const key = _makeKey(storable.typeName, storable.id);
            localStorage.removeItem(key);
        } catch (err) {
            console.error("Wiping failed!", err);
        }
    };

    // Private helpers

    const _makeKey = function(typeName, id) {
        return `${typeName}_${id}`;
    };

    // Module returns

    return {
        registerType, isStorable, load, save, wipe
    }
})();

export default storage;