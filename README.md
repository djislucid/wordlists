# Wordlists

My curated collection of hand-picked or self-created wordlists. 

## Wordlist Variables

Many of these files may contain variables. These will be the same variables for every file in order to customize for usage with tools such as ffuf and Burp Intruder quick and easy. 

```
{domain} - Will always be the attacker/callback server or IP
{goodDomain} - Will be a known good domain, or the vulnerable domain 
{payload} - For match/replacing with different fuzzing payloads
{path} - A file path
{file} - An additional path
{separator} - For adding separators to fuzzing payloads. For example, the command injection fuzz lists. 
```

When using these against your targets you can either match and replace these ahead of time, script quick solutions using these lists, or simply set Match and Replace rules when using these lists in Burp Intruder.
