# Cloud Lists

Commands for getting up-to-date CIDR ranges and associated regions

**AWS**
`curl -s https://ip-ranges.amazonaws.com/ip-ranges.json`

To get a list of CIDRs by region
`curl -s https://ip-ranges.amazonaws.com/ip-ranges.json | jq '.prefixes[] | select(.region=="us-east-1") | .ip_prefix`

**Azure**
```sh
curl -s 'https://www.microsoft.com/en-us/download/details.aspx?id=56519' \
  | grep -o 'https://download\.microsoft\.com/download/[^"]*ServiceTags_Public_[0-9]\{8\}\.json' \
  | uniq \
  | xargs curl -s
```

To get just the CIDR ranges
```sh
curl -s 'https://www.microsoft.com/en-us/download/details.aspx?id=56519' \
  | grep -o 'https://download\.microsoft\.com/download/[^"]*ServiceTags_Public_[0-9]\{8\}\.json' \
  | uniq \
  | xargs curl -s \
  | jq -r '.values[].properties.addressPrefixes[]' \
  | sort -u
```

Alias form

**GCP**
`curl -s https://www.gstatic.com/ipranges/cloud.json`

Get a list of region-filtered CIDRs
`curl -s https://www.gstatic.com/ipranges/cloud.json |jq '.prefixes[].ipv4Prefix'
