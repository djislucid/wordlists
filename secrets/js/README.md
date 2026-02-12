## Javascript

#### Cloud Provider Credentials (Critical Impact). Direct cloud access or signing keys. Usually immediately exploitable.

**AWS**
```
AKIA
ASIA
aws_secret_access_key
```

**Azure**
```
AZURE_CLIENT_SECRET
AccountKey=
SharedAccessSignature
vsspat
```

**Google**
```
AIza
private_key_id
client_email
```

#### Fintech & Payment Processors (Financial Abuse Risk). Hardcoded payment API keys or signing secrets.

**Stripe**
```
sk_live_
rk_live_
pk_live_
whsec_
```

**Square**
```
sq0atp-
sq0csp-
sq0idp-
```

#### SaaS & Collaboration Tokens (Org Data Exposure / Lateral Movement). Tokens that often grant API access to repos, chat, CI/CD, etc.

**Github**
```
ghp_
github_pat_
```

**Slack**
```
xoxb-
xoxp-
xoxa-2
xoxr-
xapp-
```

**Auth0 / Okta**
```
auth0_client_secret
okta_client_secret
```

#### OAuth / Authentication Secrets (Privilege Escalation Risk). Secrets that may allow impersonation or token abuse.
```
client_secret
oauth_client_secret
access_token
refresh_token
Bearer 
Basic 
```

#### Cryptographic Private Keys (Catastrophic Impact). Complete compromise if found in JS.
```
-----BEGIN PRIVATE KEY-----
-----BEGIN OPENSSH PRIVATE KEY-----
-----BEGIN RSA PRIVATE KEY-----
-----BEGIN EC PRIVATE KEY-----
-----BEGIN PGP PRIVATE KEY BLOCK-----
```

#### Database / Infrastructure Connection Strings (Backend Access Risk). Credentialed connection URIs embedded in frontend config.
```
mongodb+srv://
mongodb://
postgres://
postgresql://
mysql://
redis://
```

#### JWT Tokens (Session / Identity Abuse Potential). High signal in JS bundles.
```
eyJ
```

## Regex searches

**Cloud Provider Credentials**
`AKIA|ASIA|aws_secret_access_key|AZURE_CLIENT_SECRET|AccountKey=|SharedAccessSignature|vsspat|AIza|private_key_id|client_email`

**Fintech/payments**
`sk_live_|rk_live_|pk_live_|whsec_|sq0atp-|sq0csp-|sq0idp-`

**Github**
`ghp_|github_pat_`

**Slack**
`xoxb-|xoxp-|xoxa-2|xoxr-|xapp-`

**Auth Providers**
`auth0_client_secret|okta_client_secret`

**Other Tokens**
`client_secret|oauth_client_secret|access_token|refresh_token|\bBearer\b|\bBasic\b`

**Private Keys**
`-----BEGIN (?:OPENSSH |RSA |EC |PGP )?PRIVATE KEY-----|-----BEGIN PGP PRIVATE KEY BLOCK-----`

**Sensitive URLs**
`mongodb\+srv:\/\/|mongodb:\/\/|postgres:\/\/|postgresql:\/\/|mysql:\/\/|redis:\/\/`
