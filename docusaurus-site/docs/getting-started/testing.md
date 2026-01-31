# Testing

Learn how to test your Finternet integration safely using test API keys and test scenarios.

## Test vs Live Keys

Finternet provides separate environments for testing and production:

| Environment | API Key Prefix | Use Case |
|-------------|----------------|----------|
| Test | `sk_test_` | Development, testing, staging |
| Live | `sk_live_` | Production transactions |

> ⚠️ **Important**: Always use test keys during development. Live keys process real transactions with real money.

## Test Scenarios

### Scenario 1: Successful Payment

Create a payment intent and confirm it normally:

```bash
# Create intent
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "type": "CONSENTED_PULL",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "test_account"
  }'

# Confirm payment
curl https://api.finternet.com/v1/payment-intents/intent_xxx/confirm \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "signature": "0x...",
    "payerAddress": "0x..."
  }'
```

### Scenario 2: Failed Transaction

Test error handling by providing an invalid signature:

```bash
curl https://api.finternet.com/v1/payment-intents/intent_xxx/confirm \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "signature": "0xinvalid",
    "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318"
  }'
```

**Expected Response:**
```json
{
  "error": {
    "code": "signature_verification_failed",
    "message": "Invalid EIP-712 signature",
    "type": "invalid_request_error"
  }
}
```

### Scenario 3: Invalid State Transition

Test state machine validation:

```bash
# Try to confirm an already confirmed payment
curl https://api.finternet.com/v1/payment-intents/intent_xxx/confirm \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "signature": "0x...",
    "payerAddress": "0x..."
  }'
```

**Expected Response:**
```json
{
  "error": {
    "code": "invalid_state_transition",
    "message": "Cannot transition from SUCCEEDED to PROCESSING",
    "type": "invalid_request_error"
  }
}
```

## Test Data

### Test Amounts

Use small amounts for testing:
- `"10.00"` - Small test payment
- `"100.00"` - Standard test payment
- `"1000.00"` - Large test payment

### Test Currencies

Supported test currencies:
- `"USDC"` - USD Coin (most common)
- `"USDT"` - Tether USD
- `"DAI"` - Dai Stablecoin

### Test Settlement Destinations

Use test account identifiers:
- `"test_account_123"`
- `"bank_test_456"`
- `"mock_settlement_789"`

## Integration Testing

### Example: Node.js/TypeScript

```typescript
// Test payment creation using direct API calls
async function testPayment() {
  const response = await fetch('https://api.finternet.com/v1/payment-intents', {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.FINTERNET_TEST_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: '10.00',
      currency: 'USDC',
      type: 'CONSENTED_PULL',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'test_account',
    }),
  });

  const intent = await response.json();
  console.log('Created intent:', intent.id);
  console.log('Status:', intent.status);
  
  // Verify status
  if (intent.status !== 'INITIATED') {
    throw new Error('Expected INITIATED status');
  }
  
  return intent;
}
```

### Example: Python

```python
import os
import requests

API_KEY = os.environ.get('FINTERNET_TEST_API_KEY')
BASE_URL = 'https://api.finternet.com/v1'

def test_payment():
    # Create payment intent
    response = requests.post(
        f'{BASE_URL}/payment-intents',
        headers={
            'X-API-Key': API_KEY,
            'Content-Type': 'application/json',
        },
        json={
            'amount': '10.00',
            'currency': 'USDC',
            'type': 'CONSENTED_PULL',
            'settlementMethod': 'OFF_RAMP_MOCK',
            'settlementDestination': 'test_account',
        }
    )
    
    intent = response.json()
    assert intent['status'] == 'INITIATED'
    return intent
```

## Mock Mode

In test mode, Finternet uses mock implementations for:
- **Blockchain transactions** - Simulated confirmations
- **Settlement processing** - Mock bank transfers
- **Delivery proofs** - Test delivery verification

This allows you to test the complete flow without real blockchain transactions.

## Test Checklist

Before going live, test:

- [ ] Payment intent creation
- [ ] Payment confirmation
- [ ] Status polling
- [ ] Error handling
- [ ] Invalid signatures
- [ ] State transitions
- [ ] Settlement completion
- [ ] Webhook delivery (if using)
- [ ] Rate limiting
- [ ] Authentication errors

## Rate Limits (Test Mode)

Test mode has relaxed rate limits for development:
- **100 requests per minute** per API key
- **1000 requests per hour** per API key

These limits are higher than production to support rapid testing.

## Next Steps

- 📖 Read [Error Handling](errors/error-codes.md) for all error scenarios
- 🔄 Learn about [Webhooks](resources/webhooks.md) for event notifications
- 🚀 Review [Going Live](resources/going-live.md) checklist before production
