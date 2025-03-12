(function monitorFunctionsAndProperties() {
    console.log("Monitoring started for potential security-critical functions and properties.");

    // List of functions and properties to monitor
    const targets = [
        { path: 'document.write', type: 'function' },
        { path: 'window.location', type: 'property' },
        { path: 'document.cookie', type: 'property' },
        { path: 'eval', type: 'function' },
        { path: 'document.domain', type: 'property' },
        { path: 'WebSocket', type: 'constructor' },
        { path: 'element.src', type: 'property' },
        { path: 'postMessage', type: 'function', scope: 'window' },
        { path: 'setRequestHeader', type: 'function' },
        { path: 'FileReader.prototype.readAsText', type: 'function' },
        { path: 'ExecuteSql', type: 'function' },
        { path: 'sessionStorage.setItem', type: 'function' },
        { path: 'document.evaluate', type: 'function' },
        { path: 'JSON.parse', type: 'function' },
        { path: 'element.setAttribute', type: 'function' },
    ];

    targets.forEach(({ path, type, scope }) => {
        const parts = path.split('.');
        const propName = parts.pop();
        const obj = scope ? window[scope] : parts.reduce((o, key) => o[key], window);

        if (!obj || !(propName in obj)) {
            console.warn(`Skipping ${path}: not found in current context.`);
            return;
        }

        const original = obj[propName];

        if (type === 'function') {
            // Hook into functions
            obj[propName] = function(...args) {
                console.warn(`${path} called with arguments:`, args);
                debugger; // Optional: Pause execution
                return original.apply(this, args);
            };
        } else if (type === 'property') {
            // Hook into properties
            const descriptor = Object.getOwnPropertyDescriptor(obj, propName) || {};
            Object.defineProperty(obj, propName, {
                get() {
                    const value = descriptor.get ? descriptor.get.call(this) : original;
                    console.warn(`Accessed ${path}, current value:`, value);
                    debugger; // Optional: Pause execution
                    return value;
                },
                set(value) {
                    console.warn(`Modified ${path}, new value:`, value);
                    debugger; // Optional: Pause execution
                    if (descriptor.set) {
                        descriptor.set.call(this, value);
                    } else {
                        obj[`_${propName}`] = value;
                    }
                }
            });
        } else if (type === 'constructor') {
            // Hook into constructors (like WebSocket)
            obj[propName] = function(...args) {
                console.warn(`New instance of ${path} created with arguments:`, args);
                debugger; // Optional: Pause execution
                return new original(...args);
            };
        }
    });

    console.log("Monitoring setup complete.");
})();

