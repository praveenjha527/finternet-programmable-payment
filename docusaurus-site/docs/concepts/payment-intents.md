# Payment Intents

Payment intents are the core object in Finternet's API. They represent a request to collect payment from a payer and track the entire payment lifecycle.

## What is a Payment Intent?

A payment intent is a record that:
- Represents a payment request
- Tracks payment status through its lifecycle
- Contains all information needed to process the payment
- Links blockchain transactions to fiat settlements

## Payment Intent Object

```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "SUCCEEDED",
  "amount": "100.00",
  "currency": "USDC",
  "type": "DELIVERY_VS_PAYMENT",
  "description": "Order #12345",
  "settlementMethod": "OFF_RAMP_MOCK",
  "settlementDestination": "bank_account_123",
  "settlementStatus": "IN_PROGRESS",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
  "transactionHash": "0xabc123def456...",
  "chainId": 11155111,
  "typedData": { ... },
  "signature": "0x1234...",
  "signerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
  "phases": [
    {
      "phase": "SIGNATURE_VERIFICATION",
      "status": "COMPLETED",
      "timestamp": 1704067200
    },
    {
      "phase": "BLOCKCHAIN_CONFIRMATION",
      "status": "COMPLETED",
      "timestamp": 1704067250
    },
    {
      "phase": "SETTLEMENT",
      "status": "IN_PROGRESS",
      "timestamp": 1704067300
    }
  ],
  "metadata": {
    "orderId": "ORD-123",
    "customerId": "CUST-456"
  },
  "paymentUrl": "https://pay.finternet.com/?intent=intent_2xYz9AbC123",
  "created": 1704067200,
  "updated": 1704067300
}
```

## Core Fields

### `id`
Unique identifier for the payment intent. Format: `intent_` followed by alphanumeric characters.

### `status`
Current status of the payment. See [Status & Lifecycle](status-lifecycle.md) for all statuses.

### `amount`
Payment amount as a string. Always includes decimal places (e.g., `"100.00"`).

### `currency`
Currency code. Supported: `USDC`, `USDT`, `DAI`.

### `type`
Payment type. Options:
- `CONSENTED_PULL` - Standard payment with payer consent
- `DELIVERY_VS_PAYMENT` - Escrow-based payment with delivery verification

### `settlementMethod`
How funds are converted to fiat. Options:
- `OFF_RAMP_MOCK` - Mock settlement (testing)
- `OFF_RAMP_TO_RTP` - Real-Time Payment settlement
- `OFF_RAMP_TO_BANK` - Bank transfer settlement

### `settlementDestination`
Where fiat funds are sent (bank account, RTP identifier, etc.).

## Phases

Payment intents track progress through multiple phases:

| Phase | Description |
|-------|-------------|
| `SIGNATURE_VERIFICATION` | Verifying EIP-712 signature |
| `BLOCKCHAIN_CONFIRMATION` | Waiting for blockchain transaction confirmation |
| `ESCROW_LOCKED` | Funds locked in escrow (DvP only) |
| `AWAITING_DELIVERY_PROOF` | Waiting for delivery confirmation (DvP only) |
| `SETTLEMENT` | Processing fiat settlement |

Each phase has a status: `IN_PROGRESS`, `COMPLETED`, or `FAILED`.

## Metadata

Store custom data with payment intents:

```json
{
  "metadata": {
    "orderId": "ORD-123",
    "customerId": "CUST-456",
    "invoiceNumber": "INV-789",
    "customField": "any value"
  }
}
```

Metadata is:
- ✅ Stored with the payment intent
- ✅ Returned in all API responses
- ✅ Included in webhooks
- ✅ Searchable in audit logs

## Payment URL

Every payment intent includes a `paymentUrl` that directs payers to complete payment:

```
https://pay.finternet.com/?intent=intent_2xYz9AbC123
```

This URL:
- Opens the payment interface
- Pre-fills payment details
- Handles wallet connection
- Processes payment execution

## Lifecycle

```
INITIATED
  ↓
REQUIRES_SIGNATURE (optional)
  ↓
PROCESSING
  ↓
SUCCEEDED
  ↓
SETTLED
  ↓
FINAL
```

See [Status & Lifecycle](status-lifecycle.md) for detailed state transitions.

## Creating Payment Intents

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "type": "CONSENTED_PULL",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123"
  }'
```

## Retrieving Payment Intents

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123 \
  -H "X-API-Key: sk_test_your_key"
```

## Related Resources

- [Payment Types](payment-types.md) - Different payment options
- [Status & Lifecycle](status-lifecycle.md) - Complete status reference
- [API Reference](api-reference/payment-intents.md) - Full API documentation
