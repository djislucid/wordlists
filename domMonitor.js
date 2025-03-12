(function() {
    console.log("🔍 Monitoring critical JavaScript API calls...");

    function logAccess(method, args) {
        console.warn(`${method} called with arguments:`, args);
        console.trace(); // Show the call stack for debugging
    }

    function hookFunction(obj, funcName) {
        const originalFunc = obj[funcName];
        obj[funcName] = function(...args) {
            logAccess(`${obj.constructor.name}.${funcName}`, args);
            return originalFunc.apply(this, args);
        };
    }

    function hookProperty(obj, propName) {
        Object.defineProperty(obj, propName, {
            get: function() {
                logAccess(`Accessed ${obj.constructor.name}.${propName}`, []);
                return obj[`__${propName}`];
            },
            set: function(value) {
                logAccess(`Modified ${obj.constructor.name}.${propName}`, [value]);
                obj[`__${propName}`] = value;
            },
            configurable: true
        });
    }

    // 🛠️ Hooking functions
    hookFunction(window, "eval");
    hookFunction(document, "write");
    hookFunction(document, "evaluate");
    hookFunction(JSON, "parse");
    hookFunction(WebSocket.prototype, "send");

    // 🛠️ Hooking properties
    hookProperty(document, "cookie");
    hookProperty(document, "domain");
    hookProperty(window, "location");

    // 🛠️ Hooking FileReader.readAsText
    if (window.FileReader) {
        hookFunction(FileReader.prototype, "readAsText");
    }

    // 🛠️ Hooking local/session storage
    hookFunction(sessionStorage, "setItem");

    // 🛠️ Hooking setAttribute (for tracking `element.src` changes)
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
        if (name === "src") {
            logAccess(`Element.setAttribute("${name}")`, [value]);
        }
        return originalSetAttribute.apply(this, arguments);
    };

    // 🛠️ Hooking XMLHttpRequest.setRequestHeader
    if (window.XMLHttpRequest) {
        hookFunction(XMLHttpRequest.prototype, "setRequestHeader");
    }

    // 🛠️ Hooking Web SQL (deprecated, but still present in some browsers)
    if (window.openDatabase) {
        hookFunction(Database.prototype, "executeSql");
    }

    console.log("Monitoring script active!");
})();

