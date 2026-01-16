# Unicode Normalization

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
