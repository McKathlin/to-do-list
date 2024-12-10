import storage from "./storage.js";
import Observable from "./observable.js";

// This Observable saves whenever a change is made.
class AutosavingObservable extends Observable {
    constructor(myId) {
        // Do usual Observable stuff
        super();

        // Check id type
        if (typeof myId != "string" && typeof myId != "number") {
            throw new Error("AutosavingObservable id must be a string or number.");
        }

        // Set id
        this._id = myId;
    }

    get id() {
        return this._id;
    }

    onCreate() {
        storage.save(this);
    }

    notifyChanged(event = {}) {
        if (event.action === undefined) {
            event.action = "update";
        }
        super.notifyChanged(event);
        storage.save(this);
    }

    destroy() {
        this.notifyChanged({ action: "delete" });
        this.unsubscribeAll();
        storage.wipe(this);
    }
}

export default {
    AutosavingObservable,
    load: storage.load,
    registerType: storage.registerType,
};
