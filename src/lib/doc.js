// doc.js
// by McKathlin
// A module that makes HTML element creation quicker and tighter

const doc = (function() {
    const _typeRegex = /^([a-z][a-z0-9]*)/i;
    const _idRegex = /#([a-z][a-z0-9_\-]*)/i;
    const _classRegex = /\.[a-z0-9_\-]+/gi;

    const _classListPropertyNames = ["classes", "classList"];
    const _specialPropertySet = new Set([
        "classes", "classList", "className", "text", "children"
    ]);

    function make(selector, properties) {
        // Standardize properties object
        if (!properties) {
            if ("object" == typeof selector) {
                properties = selector;
                selector = null;
            } else {
                properties = {};
            }
        } else if ("string" == typeof properties) {
            let text = properties;
            properties = { text };
        } else if (Array.isArray(properties)) {
            let children = properties;
            properties = { children };
        }

        // Make an element of the specified type.
        let type = "div";
        if (typeof selector == "string") {
            const typeCapture = selector.match(_typeRegex);
            if (typeCapture && typeCapture[1]) {
                type = typeCapture[1];
            }
        }
        
        let element = document.createElement(type);

        // Set the id, if any.
        const idCapture = selector.match(_idRegex);
        if (idCapture) {
            element.id = idCapture[1];
        } else if (properties.id) {
            element.id = properties.id;
        }

        // Set any classes from selector
        const classTags = selector.match(_classRegex) ?? [];
        for (const classTag of classTags) {
            let className = classTag.slice(1); // Take off leading dot
            element.classList.add(className);
        }

        // Set classes from properties, if applicable
        if (properties.className) {
            element.className = properties.className;
        }
        for (const classPropertyName of _classListPropertyNames) {
            if (properties[classPropertyName]) {
                for (let className of properties[classPropertyName]) {
                    element.classList.add(className);
                }
            }
        }

        // Set text
        if (properties.text) {
            element.append(properties.text);
        }

        // Set attributes
        for (const propName in properties) {
            if (_specialPropertySet.has(propName)) {
                // Special properties are handled some other way, not here.
            } else {
                element.setAttribute(propName, properties[propName]);
            }
        }

        // Set children
        if (properties.children) {
            //console.log(properties.children);
            element.append(...properties.children);
        }

        return element;
    }

    function _elementClosure(elementType) {
        return function(text, properties) {
            if (properties) {
                properties.text = text;
            } else if ("string" == typeof text) {
                properties = { text };
            } else {
                properties = text;
            }
            return make(elementType, properties);
        };
    }

    const module = { make };

    const _shortcuts = [
        "a", "button", "div", "em",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "fieldset", "img", "input", "label", "li", "menu", "ol",
        "p", "span", "strong", "textarea", "ul",
    ];
    for (const shortcut of _shortcuts) {
        module[shortcut] = _elementClosure(shortcut);
    }

    module.br = function() { return document.createElement("br"); }

    return module;
})();

export default doc;