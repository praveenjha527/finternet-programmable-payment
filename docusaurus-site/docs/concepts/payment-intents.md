# Payment Intents

Payment Intent is the Core Object in the Finternet Payment Gateway’s Payment API. It facilitates the exchange and confirmation of payment information between buyer and merchant and also enables interaction with the smart modules that host the conditional payment logic.

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
  "status": "INITIATED",
  "data": {
    "id": "intent_2xYz9AbC123",
    "object": "payment_intent",
    "status": "INITIATED",
    "amount": "1000.00",
    "currency": "USDC",
    "type": "DELIVERY_VS_PAYMENT",
    "description": "Order #ORD-123",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123",
    "settlementStatus": "PENDING",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "chainId": 11155111,
    "transactionHash": null,
    "typedData": {
      "types": {
        "EIP712Domain": [...],
        "PaymentIntent": [...]
      },
      "domain": {...},
      "message": {...}
    },
    "phases": [
      {
        "phase": "SIGNATURE_VERIFICATION",
        "status": "IN_PROGRESS"
      }
    ],
    "metadata": {
      "tokenAddress": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      "contractMerchantId": "4"
    },
    "paymentUrl": "https://pay.fmm.finternetlab.io/?intent=intent_2xYz9AbC123",
    "estimatedFee": "2.50",
    "estimatedDeliveryTime": "15s",
    "created": 1704067200,
    "updated": 1704067300
  },
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
- `DELIVERY_VS_PAYMENT` - Conditional payment with delivery verification

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
https://pay.fmm.finternetlab.io/?intent=intent_2xYz9AbC123
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
curl https://api.fmm.finternetlab.io/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "type": "DELIVERY_VS_PAYMENT",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123"
  }'
```

## Retrieving Payment Intents

```bash
curl https://api.fmm.finternetlab.io/v1/payment-intents/intent_2xYz9AbC123 \
  -H "X-API-Key: sk_test_your_key"
```

## Related Resources

- [Payment Types](payment-types.md) - Different payment options
- [Status & Lifecycle](status-lifecycle.md) - Complete status reference
- [API Reference](../api-reference/payment-intents/create.md) - Full API documentation
