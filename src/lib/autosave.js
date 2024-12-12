import storage from "./storage.js";
import Observable from "./observable.js";

const FIRST_ID = 1;

const _idGenerator = (function () {
  let _nextIds = {};

  const generateFor = function (typeName) {
    const storageKey = `nextId_${typeName}`;

    // Get the next ID for this type or make a new one.
    let id =
      _nextIds[typeName] ??
      Number.parseInt(storage.loadPrimitive(storageKey) ?? FIRST_ID);

    // Increment the next ID and save it for later.
    _nextIds[typeName] = id + 1;
    storage.savePrimitive(storageKey, _nextIds[typeName]);

    return id;
  };

  return { generateFor };
})();

// This Observable saves whenever a change is made.
class AutosavingObservable extends Observable {
  constructor(id = null) {
    super();

    // Set an id that's unique for this object's type.
    if (!this.typeName) {
      throw new Error("AutosavingObservable needs a typeName!");
    }
    this._id = id ?? _idGenerator.generateFor(this.typeName);
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
  FIRST_ID,
  load: storage.load,
  registerType: storage.registerType,
};
