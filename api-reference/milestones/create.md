# Create Milestone

Creates a payment milestone for a milestone-based escrow order.

## Endpoint

```
POST /v1/payment-intents/:intentId/escrow/milestones
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
| `milestoneIndex` | integer | Yes | Index of the milestone (0-based, must be unique per order) |
| `description` | string | No | Description of the milestone |
| `amount` | string | Yes | Amount to be released for this milestone (decimal string) |
| `percentage` | number | No | Percentage of total amount (0-100) |

## Request Example

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123/escrow/milestones \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "milestoneIndex": 0,
    "description": "Initial payment - 30%",
    "amount": "300.00",
    "percentage": 30
  }'
```

## Response

Returns the created milestone object.

```json
{
  "id": "milestone_xyz789",
  "object": "milestone",
  "data": {
    "id": "milestone_xyz789",
    "escrowOrderId": "escrow_order_abc123",
    "paymentIntentId": "intent_2xYz9AbC123",
    "milestoneIndex": 0,
    "description": "Initial payment - 30%",
    "amount": "300.00",
    "percentage": 30,
    "status": "PENDING",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Milestone Requirements

- The escrow order must have `releaseType: "MILESTONE_LOCKED"`
- `milestoneIndex` must be unique per order (0, 1, 2, ...)
- Total milestone amounts should not exceed the escrow order amount
- Milestones are processed in order (index 0, then 1, then 2, etc.)

## Milestone Lifecycle

```
PENDING → COMPLETED → RELEASED
```

1. **PENDING**: Milestone created, waiting for completion
2. **COMPLETED**: Milestone marked as completed (via [Complete Milestone](complete.md))
3. **RELEASED**: Funds released to merchant

## Error Responses

### Invalid Release Type

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Cannot create milestone for order with release type: DELIVERY_PROOF",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

### Duplicate Milestone Index

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Milestone with index 0 already exists",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

### Amount Exceeds Order Total

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Total milestone amounts exceed escrow order amount",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

## Code Examples

### JavaScript/TypeScript

```typescript
// Create multiple milestones for a project
const milestones = [
  {
    milestoneIndex: 0,
    description: 'Project kickoff - 20%',
    amount: '200.00',
    percentage: 20,
  },
  {
    milestoneIndex: 1,
    description: 'Mid-point delivery - 50%',
    amount: '500.00',
    percentage: 50,
  },
  {
    milestoneIndex: 2,
    description: 'Final delivery - 30%',
    amount: '300.00',
    percentage: 30,
  },
];

for (const milestone of milestones) {
  const response = await fetch(
    `https://api.finternet.com/v1/payment-intents/${intentId}/escrow/milestones`,
    {
      method: 'POST',
      headers: {
        'X-API-Key': process.env.FINTERNET_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(milestone),
    }
  );

  const created = await response.json();
  console.log(`Milestone ${milestone.milestoneIndex} created:`, created.id);
}
```

### Python

```python
import requests

milestones = [
    {
        'milestoneIndex': 0,
        'description': 'Project kickoff - 20%',
        'amount': '200.00',
        'percentage': 20,
    },
    {
        'milestoneIndex': 1,
        'description': 'Mid-point delivery - 50%',
        'amount': '500.00',
        'percentage': 50,
    },
    {
        'milestoneIndex': 2,
        'description': 'Final delivery - 30%',
        'amount': '300.00',
        'percentage': 30,
    },
]

for milestone in milestones:
    response = requests.post(
        f'https://api.finternet.com/v1/payment-intents/{intent_id}/escrow/milestones',
        headers={
            'X-API-Key': os.environ['FINTERNET_API_KEY'],
            'Content-Type': 'application/json',
        },
        json=milestone
    )

    created = response.json()
    print(f"Milestone {milestone['milestoneIndex']} created:", created['id'])
```

## Best Practices

### Milestone Planning

- **Break down large projects**: Divide into logical phases
- **Clear descriptions**: Make it clear what completion means
- **Reasonable amounts**: Don't create too many small milestones
- **Sequential indexing**: Use 0, 1, 2, ... in order

### Common Patterns

**3-Milestone Pattern (30/40/30):**
- Milestone 0: 30% - Project start
- Milestone 1: 40% - Mid-point
- Milestone 2: 30% - Final delivery

**4-Milestone Pattern (25/25/25/25):**
- Equal payments at each quarter

**Custom Pattern:**
- Adjust percentages based on project complexity and risk

## Related

- [Complete Milestone](complete.md)
- [Milestone Payments](guides/milestone-payments.md)
- [Escrow Orders](concepts/escrow-orders.md)
