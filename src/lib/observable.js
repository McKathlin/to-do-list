export default class Observable {
    constructor() {
        this._observers = [];
    }

    subscribe(onChange) {
        this._observers.push(onChange);
    }

    unsubscribe(onChange) {
        this._observers = this._observers.filter((observer) => observer !== func);
    }

    notifyChanged(event) {
        this._observers.forEach((onChange) => onChange(event));
    }
};