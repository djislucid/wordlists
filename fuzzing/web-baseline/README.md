## Methodology

The base methodology for initiall fuzzing of GET/POST parameters works like this:


#### Setup
1. Load your base.txt list
2. Set basic transport safety encoding in Intruder using the *Payload encoding -> URL-encode these characters* input at the bottom of Intruder settings:
    - GET: `?&=# /\"`
    - POST: `\"` 
3. Add an Intruder Match/Replace rule to replace `\{canary}` with a literal string, e.g. `canaryString`
4. Set your payload positions


#### Fuzzing
- **Pass #1**: Send as-is with only the transport safety encoding above
- **Pass #2**: Set *Payload processing > Add > Encode > URL-encode key characters*. Keep the transport encoding settings from pass #1 the exact same
- **Pass #3**: Set an additional, identical urlencode payload processing rule, keeping everything else from pass 1 and 2 the same
- **Pass #4**: Remove all payload processing rules, clear the base.txt payloads and load unicode.txt


#### Interpreting Results

In each attack’s results table, search the response for any of these strings (where {canary} was replace with the literal string "canaryString"):

- canaryString → confirms reflection anywhere (baseline signal)
- %25 → indicates percent-encoding survived in output (often indicates only 0–1 decode happened somewhere in the reflection path)
- %2f or %5c or %22 → same idea, but more specific
- ..%2f (or ..%5c) → often indicates traversal-like strings are being reflected post-normalization

If Pass #1 (single-encode) reflects %2fcanaryString but Pass #2 reflects /canaryString (or breaks differently), that strongly suggests a second decode is happening somewhere (or a normalization boundary changed), because B started “more encoded” than A.

If Pass #1 reflects /canaryString but Pass #2 reflects %2fcanaryString, that suggests only one decode happens, and the extra encoding in B survived to reflection.

If both runs reflect the same representation, decoding depth is likely consistent (or reflection is happening before decoding).

This works even if the app doesn’t throw errors, because you’re using the output representation as a proxy for decode depth.

**Practical tip:**
> In Intruder, add Grep – Match rules for:

- canaryString
- %25
- %2f
- %5c
- %22


#### Unicode Homoglyphs

**Resources:**
- https://book.hacktricks.wiki/en/pentesting-web/unicode-injection/unicode-normalization.html
- https://appcheck-ng.com/wp-content/uploads/unicode_normalization.html
- https://0xacb.com/normalization_table
- https://www.compart.com/en/unicode/U+00A5 (sometimes decodes to a forward slash)

```
o – %e1%b4%bc
r – %e1%b4%bf
1 – %c2%b9
= – %e2%81%bc
/ – %ef%bc%8f
- – %ef%b9%a3
# – %ef%b9%9f
* – %ef%b9%a1
' – %ef%bc%87
" – %ef%bc%82
| – %ef%bd%9c
```


#### To Do

- [x] ~~Watch base.txt when initially fuzzing to see if your literal entries of space, tab, and carriage return line feed actually are processing correctly~~. We're moving CRLF to an independent list. 
