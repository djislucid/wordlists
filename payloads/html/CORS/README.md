# CORS Testing Toolkit — README

This directory contains simple, purpose-built HTML PoCs used to test different CORS behaviors during client-side security testing.

Each file answers a specific question about what attacker-controlled JavaScript can do from another origin using a victim’s browser.

---

# Recommended Testing Order

When you discover CORS headers on an endpoint, use the files in this order:

1. basic_get.html  
   → Can attacker JavaScript read authenticated responses?

2. json_post.html  
   → Can attacker JavaScript perform authenticated actions?

3. allow_headers.html  
   → Can attacker JavaScript send privileged or trusted headers?

4. exposed_headers.html  
   → Can attacker JavaScript read sensitive response headers?

5. cross-origin-auth.html  
   → Can APIs be abused using Authorization tokens cross-origin?

6. public_wildcard.html  
   → Is data unintentionally readable by any website?

This order moves from the most common real-world issue to more situational but high-impact misconfigurations.

---

## basic_get.html
Credentialed Cross-Origin Read Test (Baseline)

### What it tests
Whether attacker-controlled JavaScript can read authenticated API responses cross-origin.

### Relevant response headers
```
Access-Control-Allow-Origin must allow the attacker origin  
Access-Control-Allow-Credentials must be true
```

### When to use
- First test whenever CORS headers are present
- API endpoints returning user or account data
- Applications using session cookies
- SPA or API-driven applications

### Look for..
- Origin reflection (server mirrors Origin header)
- Dynamic or wildcard-like origin handling
- Credentials allowed alongside non-static origins

### Real attack scenario
A victim visits an attacker website. The attacker’s JavaScript silently reads authenticated API responses containing private user information.

Typical impact includes exposure of profile data, account details, or sensitive API responses.

---

## json_post.html
Authenticated Action / Preflight Test

### What it tests
Whether cross-origin JavaScript can send JSON POST requests and read responses.

This triggers browser preflight validation.

### Relevant response headers
```
Access-Control-Allow-Origin  
Access-Control-Allow-Credentials  
Access-Control-Allow-Methods must include POST  
Access-Control-Allow-Headers must allow Content-Type
```

### When to use
- Endpoint supports POST, PUT, or PATCH
- API modifies account or application state
- Modern JSON APIs

### Look for..
- Access-Control-Allow-Methods allows many methods or appears overly broad
- APIs performing account updates or administrative actions

### Real attack scenario
An attacker website performs authenticated actions such as changing account settings, generating API keys, or submitting transactions while also reading the server response.

This effectively becomes CSRF with response visibility.

---

## allow_headers.html
Custom Header Trust Test

### What it tests
Whether attacker JavaScript is allowed to send arbitrary request headers cross-origin.

### Relevant response headers
```
Access-Control-Allow-Headers
```

### When to use
- APIs using custom headers
- Backend logic depends on headers
- Internal or admin APIs suspected

### Look for..
Access-Control-Allow-Headers allows everything or broadly matches headers (for example allowing all headers or wide patterns).

### Why this matters
Many systems trust headers for authorization or routing decisions, such as:
- X-API-Key
- X-Internal-Request
- X-Tenant-ID
- X-User-Role
- X-CSRF-Token

If browsers allow these headers cross-origin, attacker JavaScript can impersonate trusted clients.

### Real attack scenario
Attacker-controlled requests inject trusted headers that backend services treat as privileged, potentially bypassing authorization checks.

---

## cross-origin-auth.html
Authorization Header Acceptance Test

### What it tests
Whether the server allows cross-origin requests containing an Authorization header.

### Relevant response headers
```
Access-Control-Allow-Headers must include Authorization  
Access-Control-Allow-Origin must allow attacker origin
```

### When to use
- Applications using bearer tokens or API tokens
- Tokens stored client-side (localStorage or sessionStorage)
- API-first or SPA architectures

### Important clarification
This test does not steal tokens.  
It determines whether stolen tokens could be abused remotely.

### Real attack scenario
A minor vulnerability elsewhere exposes a token. Because CORS allows Authorization headers cross-origin, an attacker can build an external control interface that continuously interacts with victim APIs without needing further exploitation.

This frequently escalates smaller issues into persistent account takeover.

---

## exposed_headers.html
Sensitive Response Header Exposure Test

### What it tests
Whether attacker JavaScript can read non-standard response headers.

Browsers normally hide most response headers unless explicitly exposed.

### Relevant response headers
```
Access-Control-Expose-Headers
```

### When to use
- Authentication or metadata appears in headers
- Login or refresh flows observed
- APIs returning identifiers or tokens in headers

### Look for..
Access-Control-Expose-Headers exposes many headers or exposes everything.

### Real attack examples
Sensitive information often appears in headers such as:
- authentication tokens
- refresh tokens
- user identifiers
- internal infrastructure data
- redirect tokens in Location headers

### Real attack scenario
Attacker JavaScript reads authentication or session information directly from response headers without requiring XSS.

---

## public_wildcard.html
Unauthenticated Public Data Exposure

### What it tests
Whether any website can read endpoint responses without credentials.

### Relevant response headers
```
Access-Control-Allow-Origin set to *
```

### When to use
- Endpoint appears internal or semi-private
- Configuration or metadata APIs discovered
- Device or infrastructure interfaces

### Look for..
Wildcard origin allowed on endpoints that appear intended only for application use.

### Real attack scenarios

1. Unintended public API exposure  
Developers assume data is only accessible through their UI, but any website can fetch and read it.

2. Internal network data exposure  
If a victim visits an attacker site, the attacker’s JavaScript can query internal resources accessible from the victim’s network. If those services allow wildcard CORS, internal data may be exfiltrated externally.

---

# Interpreting Results

Successful exploitation is indicated when:
- The response body is readable in JavaScript
- Response headers are accessible
- No browser CORS error appears
- Requests succeed while including credentials

Common browser console failures indicate:
- Origin not allowed
- Credentials not permitted
- Preflight validation failure

---

# Reporting Guidance (General)

Higher severity findings typically involve:
- Credentialed access combined with sensitive data exposure
- Ability to perform authenticated actions
- Token exposure or reusable authentication mechanisms

Context always determines final severity.

---

# Final Notes

These PoCs simulate a realistic attacker model:

A malicious website executing JavaScript in a victim’s browser.

They intentionally avoid proxies, extensions, or manual token manipulation so successful execution directly demonstrates real-world exploitability.
