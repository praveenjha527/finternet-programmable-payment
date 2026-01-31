# Get Escrow Order

Retrieves the escrow order associated with a payment intent.

## Endpoint

```
GET /v1/payment-intents/:intentId/escrow
```

## Authentication

Requires API key authentication.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intentId` | string | Yes | The ID of the payment intent |

## Request Example

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123/escrow \
  -H "X-API-Key: sk_test_your_key_here"
```

## Response

Returns the escrow order object if the payment intent is of type `DELIVERY_VS_PAYMENT`.

```json
{
  "id": "escrow_order_abc123",
  "object": "escrow_order",
  "data": {
    "id": "escrow_order_abc123",
    "paymentIntentId": "intent_2xYz9AbC123",
    "orderId": "1234567890",
    "merchantId": "merchant_abc123",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "buyerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "tokenAddress": "0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8",
    "amount": "1000.00",
    "deliveryPeriod": 2592000,
    "deliveryDeadline": "1735689600",
    "expectedDeliveryHash": "0x0000000000000000000000000000000000000000000000000000000000000000",
    "actualDeliveryHash": null,
    "autoReleaseOnProof": true,
    "deliveryOracle": "0x0000000000000000000000000000000000000000",
    "releaseType": "DELIVERY_PROOF",
    "timeLockUntil": null,
    "orderStatus": "PENDING",
    "settlementStatus": "NONE",
    "disputeWindow": "604800",
    "disputeRaisedAt": null,
    "disputeReason": null,
    "disputeRaisedBy": null,
    "createTxHash": "0xabc123...",
    "releasedAt": null,
    "settlementScheduledAt": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
}
```

## Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the escrow order |
| `paymentIntentId` | string | Associated payment intent ID |
| `orderId` | string | Contract order ID (BigInt as string) |
| `merchantId` | string | Merchant account ID |
| `contractAddress` | string | Escrow contract address |
| `buyerAddress` | string | Buyer's wallet address |
| `tokenAddress` | string | ERC-20 token address |
| `amount` | string | Escrow amount as decimal string |
| `deliveryPeriod` | integer | Delivery period in seconds |
| `deliveryDeadline` | string | Unix timestamp deadline (BigInt as string) |
| `expectedDeliveryHash` | string | Expected delivery proof hash (bytes32) |
| `actualDeliveryHash` | string | Actual delivery proof hash (if submitted) |
| `autoReleaseOnProof` | boolean | Whether to auto-release on delivery proof |
| `deliveryOracle` | string | Delivery oracle address (optional) |
| `releaseType` | string | Release type: `DELIVERY_PROOF`, `TIME_LOCKED`, `MILESTONE_LOCKED`, `AUTO_RELEASE` |
| `timeLockUntil` | string | Unix timestamp for time-locked release (if applicable) |
| `orderStatus` | string | Order status: `PENDING`, `SHIPPED`, `DELIVERED`, `COMPLETED`, `CANCELLED`, `DISPUTED` |
| `settlementStatus` | string | Settlement status: `NONE`, `SCHEDULED`, `EXECUTED`, `CONFIRMED`, `CANCELLED` |
| `disputeWindow` | string | Dispute window in seconds (BigInt as string) |
| `disputeRaisedAt` | string | When dispute was raised (Unix timestamp) |
| `disputeReason` | string | Reason for dispute |
| `disputeRaisedBy` | string | Address that raised the dispute |
| `createTxHash` | string | Transaction hash that created the order |
| `releasedAt` | string | When funds were released (Unix timestamp) |
| `settlementScheduledAt` | string | When settlement was scheduled (Unix timestamp) |

## Error Responses

### Payment Intent Not Found

```json
{
  "error": {
    "code": "resource_missing",
    "message": "Payment intent not found",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `404 Not Found`

### Not an Escrow Payment

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Payment intent is not of type DELIVERY_VS_PAYMENT",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

This occurs when the payment intent is not an escrow-based payment (e.g., `CONSENTED_PULL`).

### Escrow Order Not Found

```json
{
  "error": {
    "code": "resource_missing",
    "message": "Escrow order not found for this payment intent",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `404 Not Found`

## Code Examples

### JavaScript/TypeScript

```typescript
const response = await fetch(
  `https://api.finternet.com/v1/payment-intents/${intentId}/escrow`,
  {
    headers: {
      'X-API-Key': process.env.FINTERNET_API_KEY,
    },
  }
);

const escrowOrder = await response.json();
console.log('Order status:', escrowOrder.data.orderStatus);
console.log('Release type:', escrowOrder.data.releaseType);
```

### Python

```python
import requests

response = requests.get(
    f'https://api.finternet.com/v1/payment-intents/{intent_id}/escrow',
    headers={'X-API-Key': os.environ['FINTERNET_API_KEY']}
)

escrow_order = response.json()
print('Order status:', escrow_order['data']['orderStatus'])
```

## Related

- [Submit Delivery Proof](submit-delivery-proof.md)
- [Raise Dispute](raise-dispute.md)
- [Escrow Orders](concepts/escrow-orders.md)
- [Delivery vs Payment](guides/delivery-vs-payment.md)
