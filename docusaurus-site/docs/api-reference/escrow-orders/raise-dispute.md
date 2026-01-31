# Raise Dispute

Raises a dispute for an escrow order, pausing fund release until the dispute is resolved.

## Endpoint

```
POST /v1/payment-intents/:intentId/escrow/dispute
```

## Authentication

Requires API key authentication.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intentId` | string | Yes | The ID of the payment intent |

## Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `reason` | string | Yes | Reason for the dispute |
| `raisedBy` | string | Yes | Ethereum address of the entity raising the dispute |
| `disputeWindow` | string | No | Dispute window in seconds (default: 604800 = 7 days) |

## Request Example

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123/escrow/dispute \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "reason": "Item not delivered as described",
    "raisedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "disputeWindow": "604800"
  }'
```

## Response

Returns a confirmation that the dispute was raised.

```json
{
  "object": "dispute",
  "status": "raised"
}
```

## Dispute Process

When a dispute is raised:

1. **Order Status**: Changes to `DISPUTED`
2. **Fund Release**: Paused until dispute resolution
3. **Dispute Window**: Starts counting down (default: 7 days)
4. **Timeout Job**: Scheduled to handle automatic resolution if not resolved

### Dispute Resolution

Disputes can be resolved in several ways:

- **Manual Resolution**: Admin or oracle resolves the dispute
- **Timeout**: If dispute window expires without resolution, default action is taken
- **Mutual Agreement**: Both parties agree to resolution

### Dispute Outcomes

- **MERCHANT_WON**: Merchant receives full payment
- **BUYER_WON**: Buyer receives full refund
- **PARTIAL_REFUND**: Partial refund to buyer, remainder to merchant

## Dispute Window

The dispute window determines how long the dispute can remain open before automatic resolution. Default is 7 days (604800 seconds).

Common values:
- **1 day**: `86400`
- **3 days**: `259200`
- **7 days**: `604800` (default)
- **14 days**: `1209600`
- **30 days**: `2592000`

## Error Responses

### Escrow Order Not Found

```json
{
  "error": {
    "code": "resource_missing",
    "message": "Escrow order not found",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `404 Not Found`

### Invalid Order Status

```json
{
  "error": {
    "code": "invalid_status",
    "message": "Cannot raise dispute: order is already completed",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

### Dispute Already Raised

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Dispute already raised for this order",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

## Code Examples

### JavaScript/TypeScript

```typescript
const response = await fetch(
  `https://api.finternet.com/v1/payment-intents/${intentId}/escrow/dispute`,
  {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.FINTERNET_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      reason: 'Item not delivered as described. Package was damaged upon arrival.',
      raisedBy: buyerAddress,
      disputeWindow: '604800', // 7 days
    }),
  }
);

const dispute = await response.json();
console.log('Dispute raised:', dispute.status);
```

### Python

```python
import requests

response = requests.post(
    f'https://api.finternet.com/v1/payment-intents/{intent_id}/escrow/dispute',
    headers={
        'X-API-Key': os.environ['FINTERNET_API_KEY'],
        'Content-Type': 'application/json',
    },
    json={
        'reason': 'Item not delivered as described. Package was damaged upon arrival.',
        'raisedBy': buyer_address,
        'disputeWindow': '604800',  # 7 days
    }
)

dispute = response.json()
print('Dispute raised:', dispute['status'])
```

## Best Practices

### When to Raise a Dispute

- **Buyer**: Item not received, damaged, or not as described
- **Merchant**: Buyer claims non-delivery but tracking shows delivery
- **Either Party**: Disagreement about delivery proof validity

### Dispute Reasons

Provide clear, detailed reasons:
- ✅ "Item not delivered. Tracking shows delivered but package not received."
- ✅ "Item damaged upon arrival. Photos attached."
- ❌ "Bad" (too vague)
- ❌ "Didn't like it" (not a valid dispute reason)

### Dispute Window Selection

- **Physical Goods**: 7-14 days (allows time for delivery and inspection)
- **Digital Goods**: 1-3 days (faster delivery, quicker resolution)
- **Services**: 7-30 days (depends on service completion timeline)

## Related

- [Get Escrow Order](get.md)
- [Submit Delivery Proof](submit-delivery-proof.md)
- [Dispute Resolution](guides/dispute-resolution.md)
- [Escrow Orders](concepts/escrow-orders.md)
