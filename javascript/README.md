### Wordlist usage

1. Search for the items in `dom.txt` in any of your target's javascript.
2. If found, search for instances where the items found in step 1 are passed to any of the items in `xss.txt`. If found you likely found a route to XSS.
3. Search for instances where the items found in step 1 are pass to any of the items in `redirect.txt`. If found you may have found a DOM-based open redirect.
4. If step 2 and step 3 fail but you did find items from step 1 then try to see if any of those items where assigned to **unique** variable names. Repeat step 2 and 3 using those variable names instead. 

##### render.txt

Use these payloads in instances where you know you won't be able to pop an alert() or view the console.log(). For example, in a Chrome-embedded application or something that doesn't have access to the window API (like a JCEF desktop application or something). 
