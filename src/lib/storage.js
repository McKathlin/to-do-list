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
                "\nMethods: " + _STORABLE_METHODS.join(", ");
            throw new Error(usageMessage);
        }
        if (!proto.save) {
            proto.save = function() {
                if (this.id !== undefined) {
                    storage.save(this);
                }
            };
        }
        if (!proto.wipeSave) {
            proto.wipeSave = function() {
                if (this.id !== undefined) {
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
        const json = loadPrimitive(_makeKey(typeName, id));
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

    const loadPrimitive = function(key) {
        return localStorage.getItem(key);
    };

    const save = function(storable) {
        if (!storable) {
            throw new Error("Can't save non-storable", storable);
        }

        try {
            const key = _makeKey(storable.typeName, storable.id);
            savePrimitive(key, JSON.stringify(storable.pack()));
            return true;
        } catch (err) {
            console.error("Saving failed!", err);
            return false;
        }
    };

    const savePrimitive = function(key, value) {
        localStorage.setItem(key, value);
    };

    const wipe = function(storable) {
        if (!storable) {
            throw new Error("Can't wipe non-storable", storable);
        }

        try {
            const key = _makeKey(storable.typeName, storable.id);
            wipePrimitive(key);
        } catch (err) {
            console.error("Wiping failed!", err);
        }
    };

    const wipePrimitive = function(key) {
        localStorage.removeItem(key);
    };

    // Private helpers

    const _makeKey = function(typeName, id) {
        return `${typeName}_${id}`;
    };

    // Module returns

    return {
        registerType, isStorable,
        load, loadPrimitive,
        save, savePrimitive,
        wipe, wipePrimitive,
    };
}());

export default storage;