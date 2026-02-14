# Methodology

I'm putting this together as a living methodology document for how I conduct web-based server-side and API fuzzing. The idea is to have a few short, high-impact wordlists that are made up of key characters that are likely to break syntax and cause errors. The goal is not to spam payloads in hopes something happens, but instead to rapidly assess whether or not the parameters are potentially vulnerable, and if not, move on as quickly as possible. By keeping them short, you can run these in a few passes with different encodings. Hopefully, at the end, you will be able to tell if there's any chance of unhandled exception, which encoding caused it, and what the context is. 

**Encodings**
- urlencoded
- double urlencoded
- unicoded

Phase 1 - Triage
Phase 2 - Context and encoding behavior discovery
Phase 3 - Technology detection
Phase 4 - Targeted attacks



## Initial Server-side Fuzzing

The methodology for initial fuzzing of GET/POST parameters works like this:

#### Setup
1. Load the *base.txt* list (in Intruder)
2. Set basic transport safety encoding in Intruder using the *Payload encoding -> URL-encode these characters* input at the bottom of Intruder settings:
    - GET: `&=# /\<>"`
    - POST: `\"` 
~~3. Add an Intruder Match/Replace rule to replace `\{canary}` with a literal string, e.g. `canaryString`~~
3. In Payload processing, set a rule to Add Suffix and specify whatever canary string you desire (no special chars in this string)
4. Set your payload positions


#### Fuzzing
- **Pass #1**: Send as-is with only the transport safety encoding above
- **Pass #2**: Set *Payload processing > Add > Encode > URL-encode key characters*. Keep the transport encoding settings from pass #1 the exact same
- **Pass #3**: Set an additional, identical urlencode payload processing rule, keeping everything else from pass 1 and 2 the same
- **Pass #4**: Remove all payload processing rules, clear the base.txt payloads and load unicode.txt

**A note on transport encoding..**
> While the initial pass should remain unencoded, if you are fuzzing GET parameters you'll need to urlencode a few characters to make sure that the HTTP request is syntactically accurate, otherwise you'll get HTTP error responses without actually fuzzing anything.

In general, when fuzzing GET requests the full list of characters you should transport encode is:
`?&=#% /\@"<>`

However, since our base.txt list doesn't contain all of those, you can simply encode the ones mentioned in step #2. 


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


## Carriage Return Line Feed

#### Methodology

**crlf.txt**: Useful for injecting into the end of GET request lines, request headers, and optionally into typical GET and POST parameters (you never know). Hopefully useful for testing proxies. 

1. Load the `crlf.txt` list
2. Set basic transport safety encoding in Intruder using the *Payload encoding -> URL-encode these characters*. URLencode spaces only. 
3. Set you payload positions and let it run 

#### Detection

Even if you don't see your header returned in a response, there are other possible signs, including:

1. Response splitting symptoms (two responses in one, malformed or duplicated status lines, drastic content size changes/truncated or missing bodies)
2. Redirect behavior changes (a 200 turns into a redirect or vice versa)
3. Cache anomalies
4. Proxy/gateway error mode changes
5. Differential behavior across HTTP versions (strange behavior on HTTP/1.1 but not HTTP/2 or vice versa)


## Unicode Homoglyphs

Many of these look normal but are actually homoglyph variants. 

```
# ---- FULLWIDTH QUOTES / STRING BREAKERS ----
＇
＂
｀

# ---- FULLWIDTH SEPARATORS / OPERATORS ----
｜
＆
＋
＝
⁼

# ---- FULLWIDTH PATH / ROUTING CHARACTERS ----
／
＼
．

# ---- PATH TRAVERSAL VARIANTS ----
／..／
..／..／
＼..＼
..＼..＼

# ---- SYMBOL NORMALIZATION / FILTER BYPASS ----
﹣
－
＃
﹟
＊

# ---- YEN / WON SYMBOLS (BACKSLASH CONFUSION) ----
¥
₩
```

Here's a Ruby-based zsh alias for quickly printing these out on macOS:
```ruby
alias unicodehomoglyphs='ruby -e "
require \"uri\"

chars = %w[
＇ ＂ ｀
｜ ＆ ＋ ＝ ⁼
／ ＼ ．
﹣ － ＃ ﹟ ＊
¥ ₩
]

combos = %w[
／..／
..／..／
＼..＼
..＼..＼
¥..¥
..¥..¥
]

def urlenc(s)
  URI.encode_www_form_component(s)
end

def cps(s)
  s.codepoints.map { |cp| sprintf(\"U+%04X\", cp) }.join(\" \")
end

puts \"# Single characters\"
chars.each do |c|
  puts \"#{c}\t#{cps(c)}\t#{urlenc(c)}\"
end

puts \"\n# Combos\"
combos.each do |c|
  puts \"#{c}\t#{cps(c)}\t#{urlenc(c)}\"
end
"'
```

Here's the python version for those who hate Ruby (and because I won't be bothered to install Ruby on Windows):
```python
#!/usr/bin/env python3
import urllib.parse

CHARS = [
    # FULLWIDTH QUOTES / STRING BREAKERS
    "＇", "＂", "｀",

    # FULLWIDTH SEPARATORS / OPERATORS
    "｜", "＆", "＋", "＝", "⁼",

    # FULLWIDTH PATH / ROUTING CHARACTERS
    "／", "＼", "．",

    # SYMBOL NORMALIZATION / FILTER BYPASS
    "﹣", "－", "＃", "﹟", "＊",

    # YEN / WON SYMBOLS (BACKSLASH CONFUSION)
    "¥", "₩",
]

COMBOS = [
    "／..／",
    "..／..／",
    "＼..＼",
    "..＼..＼",
    "¥..¥",
    "..¥..¥",
]

def urlenc_utf8(s: str) -> str:
    # Percent-encode UTF-8 bytes (HackTricks-style)
    return urllib.parse.quote(s, safe="")

def codepoints_hex(s: str) -> str:
    return " ".join(f"U+{cp:04X}" for cp in map(ord, s))

def main() -> None:
    print("# Single characters")
    for ch in dict.fromkeys(CHARS):  # de-dupe preserving order
        print(f"{ch}\t{codepoints_hex(ch)}\t{urlenc_utf8(ch)}")

    print("\n# Combos")
    for s in dict.fromkeys(COMBOS):
        print(f"{s}\t{codepoints_hex(s)}\t{urlenc_utf8(s)}")

if __name__ == "__main__":
    main()
```

**Resources:**
- https://unicode-explorer.com/
- https://book.hacktricks.wiki/en/pentesting-web/unicode-injection/unicode-normalization.html
- https://appcheck-ng.com/wp-content/uploads/unicode_normalization.html
- https://0xacb.com/normalization_table
- https://www.compart.com/en/unicode/U+00A5 (sometimes decodes to a forward slash)
- https://github.com/carlospolop/sqlmap_to_unicode_template

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

