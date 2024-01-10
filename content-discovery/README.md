# Web Content

`base.txt`: Contains a unique and generic wordlist to use as a starting point for other wordlists. Once you've discovered what type of technology the target is running the append the appropriate technology-specific wordlists to this file. `base.txt` has been guaranteed to contain a fully unique set of entries which is in none of the other technology-specific wordlists so when you append there will not be duplicates. Note that the `lucid*.txt` lists both contain `base.txt` in it's entirety plus addition entries. 

`lucidweb.txt`: A reasonably sized generic wordlist for general purpose fuzzing. Contains the entire contents of `base.txt` plus various additional entries. Use this in most generic situations for the quickest impactful discovery.

`lucid-all.txt`: My original general-purpose wordlist. This contains everything that are in both `lucidweb.txt` and `base.txt`, in addition to more general purpose, oauth, CVE, admin panels, and various technologies. Use this when you have more time and want to get the best coverage.

`all.txt`: Probably won't use this very often. This contains all of the web wordlists' sorted entries as well as a number of fuzzing strings and added CVE entries. Use this when you want to blow stuff up. 
