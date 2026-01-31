# Retrieve Payment Intent

Retrieves the details of an existing payment intent.

## Endpoint

```
GET /v1/payment-intents/:intentId
```

## Authentication

Requires API key authentication.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intentId` | string | Yes | The ID of the payment intent to retrieve |

## Request Example

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123 \
  -H "X-API-Key: sk_test_your_key_here"
```

## Response

Returns a payment intent object if valid and accessible.

```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "SUCCEEDED",
  "data": {
    "id": "intent_2xYz9AbC123",
    "merchantId": "merchant_abc123",
    "status": "SUCCEEDED",
    "amount": "1000.00",
    "currency": "USDC",
    "type": "DELIVERY_VS_PAYMENT",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "9876543210",
    "settlementStatus": "IN_PROGRESS",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "transactionHash": "0xabc123...",
    "chainId": 11155111,
    "signerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "phases": [
      {
        "phase": "SIGNATURE_VERIFICATION",
        "status": "COMPLETED",
        "completedAt": 1704067200
      },
      {
        "phase": "BLOCKCHAIN_CONFIRMATION",
        "status": "COMPLETED",
        "completedAt": 1704067260
      },
      {
        "phase": "ESCROW_LOCKED",
        "status": "COMPLETED",
        "completedAt": 1704067320
      },
      {
        "phase": "SETTLEMENT",
        "status": "IN_PROGRESS",
        "startedAt": 1704067380
      }
    ],
    "metadata": {
      "orderId": "ORD-123",
      "customerId": "CUST-456"
    },
    "created": 1704067200,
    "updated": 1704067380
  },
  "created": 1704067200,
  "updated": 1704067380
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the payment intent |
| `status` | string | Current status (see [Status Lifecycle](concepts/status-lifecycle.md)) |
| `amount` | string | Payment amount as a decimal string |
| `currency` | string | Currency code (e.g., `USDC`) |
| `type` | string | Payment type (`DELIVERY_VS_PAYMENT` or `CONSENTED_PULL`) |
| `settlementMethod` | string | Settlement method (e.g., `OFF_RAMP_MOCK`) |
| `settlementDestination` | string | Destination for settlement (bank account, etc.) |
| `settlementStatus` | string | Current settlement status |
| `contractAddress` | string | Smart contract address (if applicable) |
| `transactionHash` | string | Blockchain transaction hash |
| `chainId` | integer | Blockchain chain ID |
| `signerAddress` | string | Address that signed the payment |
| `phases` | array | Array of payment phases with status |
| `metadata` | object | Custom metadata associated with the payment |
| `created` | integer | Unix timestamp of creation |
| `updated` | integer | Unix timestamp of last update |

## Public Endpoint

For frontend integration, use the public endpoint (no authentication required):

```
GET /v1/payment-intents/public/:intentId
```

This endpoint returns the same data but doesn't require API key authentication. Use it when displaying payment information to end users.

## Error Responses

### Payment Intent Not Found

```json
{
  "error": {
    "code": "resource_missing",
    "message": "Payment intent not found: intent_2xYz9AbC123",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `404 Not Found`

### Access Denied

```json
{
  "error": {
    "code": "forbidden",
    "message": "You do not have access to this payment intent",
    "type": "authentication_error"
  }
}
```

**Status Code:** `403 Forbidden`

This occurs when you try to access a payment intent that belongs to another merchant.

## Code Examples

### JavaScript/TypeScript

```typescript
const response = await fetch(
  `https://api.finternet.com/v1/payment-intents/${intentId}`,
  {
    headers: {
      'X-API-Key': process.env.FINTERNET_API_KEY,
    },
  }
);

const paymentIntent = await response.json();
console.log(paymentIntent.data.status);
```

### Python

```python
import requests

response = requests.get(
    f'https://api.finternet.com/v1/payment-intents/{intent_id}',
    headers={'X-API-Key': os.environ['FINTERNET_API_KEY']}
)

payment_intent = response.json()
print(payment_intent['data']['status'])
```

### cURL

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123 \
  -H "X-API-Key: sk_test_your_key_here"
```

## Related

- [Create Payment Intent](create.md)
- [Confirm Payment Intent](confirm.md)
- [Payment Intent Statuses](concepts/status-lifecycle.md)
