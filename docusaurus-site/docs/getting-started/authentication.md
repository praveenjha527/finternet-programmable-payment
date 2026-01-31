# Authentication

All requests to the Finternet API must be authenticated using API keys. This guide explains how to authenticate your requests securely.

## API Keys

API keys identify your merchant account and authorize API requests. Each key is unique and should be kept secret.

### Key Types

Finternet provides different key types for different environments:

| Type | Prefix | Use Case |
|------|--------|----------|
| Test | `sk_test_` | Development and testing |
| Live | `sk_live_` | Production transactions |
| Hackathon | `sk_hackathon_` | Hackathon participants |

### Key Format

```
sk_{environment}_{unique_identifier}
```

**Example:**
```
sk_test_51AbC123XyZ789Def456Ghi012Jkl345Mno678
```

## Authentication Methods

Finternet supports two authentication methods:

### Method 1: HTTP Header (Recommended)

Include your API key in the `X-API-Key` header:

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key_here"
```

### Method 2: Authorization Header

Use the `Authorization` header with Bearer token format:

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "Authorization: Bearer sk_test_your_key_here"
```

## Security Best Practices

### ✅ Do

- Store API keys in environment variables
- Use different keys for test and production
- Rotate keys regularly
- Use secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)
- Restrict key permissions when possible

### ❌ Don't

- Commit API keys to version control
- Share keys in client-side code
- Expose keys in URLs or query parameters
- Use production keys in development
- Share keys between team members (use separate accounts)

## Example: Environment Variables

**Node.js / TypeScript:**
```typescript
const apiKey = process.env.FINTERNET_API_KEY;

const response = await fetch('https://api.finternet.com/v1/payment-intents', {
  headers: {
    'X-API-Key': apiKey,
    'Content-Type': 'application/json',
  },
});
```

**Python:**
```python
import os
import requests

api_key = os.environ.get('FINTERNET_API_KEY')

response = requests.get(
    'https://api.finternet.com/v1/payment-intents',
    headers={'X-API-Key': api_key}
)
```

**cURL:**
```bash
export FINTERNET_API_KEY="sk_test_your_key_here"

curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: $FINTERNET_API_KEY"
```

## Merchant Isolation

Each API key is scoped to a specific merchant account. When you make a request:

- You can only access payment intents created by your merchant account
- Attempting to access another merchant's resources returns `403 Forbidden`
- All audit logs and transactions are associated with your merchant ID

## Error Responses

### Invalid API Key

```json
{
  "error": {
    "code": "forbidden",
    "message": "Invalid API key",
    "type": "authentication_error"
  }
}
```

**Status Code:** `403 Forbidden`

### Missing API Key

```json
{
  "error": {
    "code": "authentication_required",
    "message": "API key is required",
    "type": "authentication_error"
  }
}
```

**Status Code:** `401 Unauthorized`

## Testing Authentication

Test your API key with a simple request:

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key_here" \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "10.00",
    "currency": "USDC",
    "type": "CONSENTED_PULL",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "test_account"
  }'
```

If authentication succeeds, you'll receive a payment intent object. If it fails, you'll get an error response.

## Key Rotation

For security, rotate your API keys periodically:

1. Generate a new API key in your dashboard
2. Update your application to use the new key
3. Test thoroughly in a test environment
4. Deploy to production
5. Revoke the old key after confirming everything works

## Next Steps

- Learn about [Payment Intents](concepts/payment-intents.md)
- Read the [API Reference](api-reference/introduction.md)
- Check out [Code Examples](examples/quickstart.md)
