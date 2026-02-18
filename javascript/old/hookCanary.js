(() => {
  const CANARY = "reversecCanary";
  const BREAK = true; // set false to only log

  const hit = (label, details) => {
    console.groupCollapsed(`Canary hit: ${label}`);
    console.log(details);
    console.log(new Error("stack").stack);
    console.groupEnd();
    if (BREAK) debugger;
  };

  const str = (v) => {
    try { return typeof v === "string" ? v : JSON.stringify(v); }
    catch { return String(v); }
  };

  const argsContainCanary = (args) =>
    args.some(a => str(a).includes(CANARY));

  // --- Hook helpers ---
  const hookFunction = (obj, name, label = name) => {
    const orig = obj?.[name];
    if (typeof orig !== "function") return;
    obj[name] = function (...args) {
      if (argsContainCanary(args)) hit(label, { args });
      return orig.apply(this, args);
    };
  };

  const hookSetter = (proto, prop, label = prop) => {
    const desc = Object.getOwnPropertyDescriptor(proto, prop);
    if (!desc || typeof desc.set !== "function") return;
    Object.defineProperty(proto, prop, {
      configurable: desc.configurable,
      enumerable: desc.enumerable,
      get: desc.get,
      set: function (v) {
        if (str(v).includes(CANARY)) hit(label, { value: v });
        return desc.set.call(this, v);
      }
    });
  };

  // --- XSS sinks ---
  hookFunction(Document.prototype, "write", "document.write");
  hookFunction(Document.prototype, "writeln", "document.writeln");
  hookFunction(Element.prototype, "insertAdjacentHTML", "insertAdjacentHTML");
  hookSetter(Element.prototype, "innerHTML", "innerHTML=");
  hookSetter(Element.prototype, "outerHTML", "outerHTML=");
  hookFunction(Range.prototype, "createContextualFragment", "createContextualFragment");
  hookFunction(DOMParser.prototype, "parseFromString", "DOMParser.parseFromString");

  hookFunction(window, "eval", "eval");
  hookFunction(window, "setTimeout", "setTimeout");
  hookFunction(window, "setInterval", "setInterval");
  // Function constructor
  const OrigFunction = Function;
  window.Function = function (...args) {
    if (argsContainCanary(args)) hit("Function()", { args });
    return OrigFunction.apply(this, args);
  };

  // Attribute & URL-ish sinks
  hookFunction(Element.prototype, "setAttribute", "setAttribute");
  hookFunction(Element.prototype, "setAttributeNS", "setAttributeNS");
  // Common URL setters
  if (window.Location?.prototype) {
    hookFunction(Location.prototype, "assign", "location.assign");
    hookFunction(Location.prototype, "replace", "location.replace");
  }
  hookFunction(history, "pushState", "history.pushState");
  hookFunction(history, "replaceState", "history.replaceState");
  // Some helpful setters on specific elements
  if (window.HTMLScriptElement?.prototype) hookSetter(HTMLScriptElement.prototype, "src", "script.src=");
  if (window.HTMLIFrameElement?.prototype) {
    hookSetter(HTMLIFrameElement.prototype, "src", "iframe.src=");
    hookSetter(HTMLIFrameElement.prototype, "srcdoc", "iframe.srcdoc=");
  }
  if (window.HTMLAnchorElement?.prototype) hookSetter(HTMLAnchorElement.prototype, "href", "a.href=");

  // --- CSPT-ish request construction sinks ---
  hookFunction(window, "fetch", "fetch");
  hookFunction(XMLHttpRequest.prototype, "open", "XHR.open");
  hookFunction(XMLHttpRequest.prototype, "setRequestHeader", "XHR.setRequestHeader");
  // URL + Request constructors
  const OrigURL = URL;
  window.URL = function (...args) {
    if (argsContainCanary(args)) hit("new URL()", { args });
    return new OrigURL(...args);
  };
  const OrigRequest = Request;
  window.Request = function (...args) {
    if (argsContainCanary(args)) hit("new Request()", { args });
    return new OrigRequest(...args);
  };

  // --- postMessage surface ---
  hookFunction(window, "postMessage", "window.postMessage");
  hookFunction(EventTarget.prototype, "addEventListener", "addEventListener");
  // Also flag onmessage assignment (common pattern)
  if (Object.getOwnPropertyDescriptor(window, "onmessage")?.set) {
    hookSetter(window, "onmessage", "window.onmessage=");
  }

  console.log(`Canary monitor installed. Type the canary: ${CANARY}`);
})();

