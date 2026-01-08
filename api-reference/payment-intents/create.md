# Create Payment Intent

Creates a new payment intent. A payment intent represents a request to collect payment from a payer.

## Endpoint

```
POST /payment-intents
```

## Authentication

Requires API key authentication.

## Request

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `amount` | string | Yes | Payment amount (e.g., `"100.00"`) |
| `currency` | string | Yes | Currency code (`USDC`, `USDT`, `DAI`) |
| `type` | string | Yes | Payment type (`CONSENTED_PULL`, `DELIVERY_VS_PAYMENT`) |
| `settlementMethod` | string | Yes | Settlement method (`OFF_RAMP_MOCK`, `OFF_RAMP_TO_RTP`, `OFF_RAMP_TO_BANK`) |
| `settlementDestination` | string | Yes | Where to send fiat funds (bank account, RTP ID, etc.) |
| `description` | string | No | Human-readable description |
| `metadata` | object | No | Custom metadata (key-value pairs) |

### Escrow-Specific Parameters (for DELIVERY_VS_PAYMENT)

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `deliveryPeriod` | number | No | Delivery period in seconds (default: 2592000 = 30 days) |
| `expectedDeliveryHash` | string | No | Expected delivery hash (bytes32) |
| `autoRelease` | boolean | No | Auto-release on delivery proof (default: `false`) |
| `deliveryOracle` | string | No | Delivery oracle address (optional) |

### Metadata Fields for Release Types

For `DELIVERY_VS_PAYMENT` type, include release type in metadata:

**Time-Locked Release:**
```json
{
  "metadata": {
    "releaseType": "TIME_LOCKED",
    "timeLockUntil": "1735689600"
  }
}
```

**Milestone-Based Release:**
```json
{
  "metadata": {
    "releaseType": "MILESTONE_LOCKED"
  }
}
```

**Delivery Proof Release:**
```json
{
  "metadata": {
    "releaseType": "DELIVERY_PROOF",
    "autoRelease": true
  }
}
```

## Example Request

### Consented Pull

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "type": "CONSENTED_PULL",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123",
    "description": "Order #12345",
    "metadata": {
      "orderId": "ORD-123",
      "customerId": "CUST-456"
    }
  }'
```

### Delivery vs Payment (Time-Locked)

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "amount": "1000.00",
    "currency": "USDC",
    "type": "DELIVERY_VS_PAYMENT",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123",
    "deliveryPeriod": 2592000,
    "autoRelease": true,
    "metadata": {
      "releaseType": "TIME_LOCKED",
      "timeLockUntil": "1735689600"
    }
  }'
```

## Response

### Success Response (200 OK)

Returns a payment intent object wrapped in the standard API response format. **The response includes a `paymentUrl` field that you can redirect users to for payment completion.**

```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "INITIATED",
  "data": {
    "id": "intent_2xYz9AbC123",
    "object": "payment_intent",
    "status": "INITIATED",
    "amount": "100.00",
    "currency": "USDC",
    "type": "CONSENTED_PULL",
    "description": "Order #12345",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123",
    "settlementStatus": null,
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "transactionHash": null,
    "chainId": 11155111,
    "typedData": {
      "types": {
        "EIP712Domain": [
          { "name": "name", "type": "string" },
          { "name": "version", "type": "string" },
          { "name": "chainId", "type": "uint256" },
          { "name": "verifyingContract", "type": "address" }
        ],
        "ConsentedPull": [
          { "name": "intentId", "type": "string" },
          { "name": "payer", "type": "address" },
          { "name": "payee", "type": "address" },
          { "name": "amount", "type": "uint256" },
          { "name": "token", "type": "address" },
          { "name": "deadline", "type": "uint256" }
        ]
      },
      "domain": {
        "name": "ConsentedPull",
        "version": "1",
        "chainId": 11155111,
        "verifyingContract": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318"
      },
      "message": {
        "intentId": "intent_2xYz9AbC123",
        "payer": "0x0000000000000000000000000000000000000000",
        "payee": "0xMerchantAddress...",
        "amount": "100000000",
        "token": "0xTokenAddress...",
        "deadline": 1704153600
      }
    },
    "signature": null,
    "signerAddress": null,
    "phases": [
      {
        "phase": "SIGNATURE_VERIFICATION",
        "status": "IN_PROGRESS"
      }
    ],
    "metadata": {
      "orderId": "ORD-123",
      "customerId": "CUST-456"
    },
    "paymentUrl": "https://pay.finternet.com/?intent=intent_2xYz9AbC123",
    "created": 1704067200,
    "updated": 1704067200
  },
  "metadata": {
    "orderId": "ORD-123",
    "customerId": "CUST-456"
  },
  "created": 1704067200,
  "updated": 1704067200
}
```

### Frontend Payment URL

**Important:** The response includes a `paymentUrl` in the `data` object. This URL is automatically generated and points to the frontend payment interface where users can:

1. Connect their wallet
2. Review payment details
3. Sign and execute the payment transaction

**Example:**
```json
{
  "data": {
    "paymentUrl": "https://pay.finternet.com/?intent=intent_2xYz9AbC123"
  }
}
```

**Usage:**
```typescript
const response = await apiRequest('/payment-intents', {...});
const paymentUrl = response.data.paymentUrl;

// Redirect user to payment page
window.location.href = paymentUrl;
// or
window.open(paymentUrl, '_blank');
```

The payment URL format is:
```
https://pay.finternet.com/?intent={intentId}
```

For local development:
```
http://localhost:5173/?intent={intentId}
```

### Error Responses

#### Invalid Amount (400)

```json
{
  "error": {
    "code": "invalid_request_error",
    "message": "Amount must be a positive number",
    "type": "invalid_request_error"
  }
}
```

#### Invalid Payment Type (400)

```json
{
  "error": {
    "code": "invalid_request_error",
    "message": "Invalid payment type. Must be CONSENTED_PULL or DELIVERY_VS_PAYMENT",
    "type": "invalid_request_error"
  }
}
```

#### Authentication Error (401)

```json
{
  "error": {
    "code": "authentication_required",
    "message": "API key is required",
    "type": "authentication_error"
  }
}
```

## Response Structure

The response follows the standard API response format:

```typescript
{
  id: string;                    // Payment intent ID
  object: "payment_intent";       // Object type
  status: string;                 // Current status (INITIATED)
  data: {                         // Payment intent data object
    id: string;
    object: "payment_intent";
    status: string;
    amount: string;
    currency: string;
    type: string;
    description?: string;
    settlementMethod: string;
    settlementDestination: string;
    settlementStatus?: string | null;
    contractAddress?: string | null;
    transactionHash?: string | null;
    chainId?: number | null;
    typedData?: object | null;    // EIP-712 typed data for signature
    signature?: string | null;
    signerAddress?: string | null;
    phases?: Array<{              // Payment phases
      phase: string;
      status: string;
      timestamp?: number;
    }> | null;
    metadata?: Record<string, unknown> | null;
    paymentUrl: string;           // ⭐ Frontend payment URL
    created: number;              // Unix timestamp
    updated: number;              // Unix timestamp
  };
  metadata?: Record<string, unknown>; // Request metadata (echoed back)
  created: number;               // Unix timestamp
  updated: number;                // Unix timestamp
}
```

### Key Response Fields

| Field | Location | Type | Description |
|-------|----------|------|-------------|
| `id` | Top level | string | Unique payment intent identifier |
| `object` | Top level | string | Always `"payment_intent"` |
| `status` | Top level | string | Current payment status |
| `data` | Top level | object | Complete payment intent data |
| `paymentUrl` | `data.paymentUrl` | string | **Frontend URL for payment completion** |
| `typedData` | `data.typedData` | object | EIP-712 typed data for signature |
| `phases` | `data.phases` | array | Payment phases and their statuses |
| `contractAddress` | `data.contractAddress` | string | Smart contract address |
| `created` | Top level & `data` | number | Unix timestamp of creation |
| `updated` | Top level & `data` | number | Unix timestamp of last update |

## Notes

- Payment intents are created with status `INITIATED`
- **The `paymentUrl` is automatically generated** and included in `data.paymentUrl`
- **Redirect users to `data.paymentUrl`** to complete payment on the frontend
- EIP-712 typed data is included in `data.typedData` for payer signature
- For `DELIVERY_VS_PAYMENT` type, an escrow order is created automatically
- Metadata is stored and returned in all subsequent requests
- The `paymentUrl` format: `https://pay.finternet.com/?intent={intentId}`

## Using the Payment URL

After creating a payment intent, redirect your users to the `paymentUrl`:

### JavaScript/TypeScript

```typescript
const response = await apiRequest('/payment-intents', {
  method: 'POST',
  body: JSON.stringify({
    amount: '100.00',
    currency: 'USDC',
    type: 'CONSENTED_PULL',
    settlementMethod: 'OFF_RAMP_MOCK',
    settlementDestination: 'bank_account_123',
  }),
});

// Get the payment URL from the response
const paymentUrl = response.data.paymentUrl;

// Redirect user to payment page
window.location.href = paymentUrl;
```

### Python

```python
response = api_request('/payment-intents', method='POST', data={
    'amount': '100.00',
    'currency': 'USDC',
    'type': 'CONSENTED_PULL',
    'settlementMethod': 'OFF_RAMP_MOCK',
    'settlementDestination': 'bank_account_123',
})

payment_url = response['data']['paymentUrl']

# Redirect user (in web framework)
return redirect(payment_url)
```

### Backend Redirect

```typescript
// Express.js example
app.post('/create-payment', async (req, res) => {
  const intent = await createPaymentIntent(req.body);
  res.redirect(intent.data.paymentUrl);
});
```

## Related

- [Retrieve Payment Intent](retrieve.md)
- [Confirm Payment Intent](confirm.md)
- [Payment Types](concepts/payment-types.md)
