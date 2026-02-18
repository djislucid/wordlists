# Client-Side Wordlists

**Sources**
```
# URL / ROUTER INPUTS
location.search
location.hash
location.pathname
new URL(
URLSearchParams(
decodeURIComponent(
decodeURI(

# Angular routing
queryParamMap
queryParams
paramMap
params

# DOM INPUTS (USER-CONTROLLED)
.addEventListener('input'
.addEventListener('change'
.value
.valueAsNumber
.valueAsDate
FormData(

# STORAGE (PERSISTED TAINT)
localStorage.getItem(
sessionStorage.getItem(
document.cookie

# CROSS-CONTEXT INPUTS
addEventListener('message'
onmessage
BroadcastChannel(
MessageChannel(
SharedWorker(
Worker(

# BACKEND-DERIVED (TAINTED BY DEFAULT)
responseText
responseJSON
res.json(
```

**Frameworks**
```
# Angular
bypassSecurityTrustHtml
bypassSecurityTrustUrl
bypassSecurityTrustResourceUrl
bypassSecurityTrustScript
DomSanitizer
SafeHtml
SafeUrl
SafeResourceUrl
[innerHTML]
innerHtml
ng-bind-html
$sanitize

# React
dangerouslySetInnerHTML
createElement(
useMemo(
useEffect(
ref=

# Vue/Svelte
v-html
{@html
```

**DOM Sinks**
```
# DOM execution / JS codegen
eval(
new Function(
setTimeout(
setInterval(
Function(

# HTML injection sinks
innerHTML
outerHTML
insertAdjacentHTML
document.write(
document.writeln(
DOMParser(
createContextualFragment(
Range.prototype.createContextualFragment(
$.parseHTML(
jQuery.parseHTML(

# URL / navigation sinks (open redirect, DOM XSS via javascript: URLs, UXSS-ish gadgets)
location=
location.assign(
location.replace(
location.href
window.open(
navigate(
history.pushState(
history.replaceState(

# Attribute sinks (DOM XSS / JS URL / CSPT-style path tricks)
setAttribute(
src=
href=
srcdoc=
action=
formaction=
data=
poster=

# Script/style/link injection primitives (often appear in gadget chains)
createElement('script'
createElement("script"
appendChild(
insertBefore(
replaceChild(
setProperty(

# postMessage entrypoints (DOM XSS / logic bugs via message handling)
addEventListener('message'
addEventListener("message"
onmessage
postMessage(

# storage/session taint sources/sinks (often used in chains, auth flow issues)
localStorage.setItem(
sessionStorage.setItem(
localStorage.getItem(
sessionStorage.getItem(

# network construction points (client-side path manipulation / SSRF-ish within same-origin APIs)
fetch(
XMLHttpRequest(
open(
send(
setRequestHeader(
WebSocket(
EventSource(

# JSON / parsing edges (prototype pollution chains, logic bugs)
JSON.parse(
```

### Methodology

1. Start with sinks.txt
- Search the whole repo/bundle for sinks.
- For each match, note the file and line.

2. For any “HTML-ish” sink, immediately search nearby for redflags
- In the same file (or call stack), search frameworks.txt patterns.

3. Only then look for sources feeding those sinks
- Search sources.txt and see if the same file/module touches URL/storage/message/form inputs.

