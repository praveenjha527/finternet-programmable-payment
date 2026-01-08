# Complete Milestone

Marks a milestone as completed and triggers fund release if all conditions are met.

## Endpoint

```
POST /v1/payment-intents/:intentId/escrow/milestones/:milestoneId/complete
```

## Authentication

Requires API key authentication.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intentId` | string | Yes | The ID of the payment intent |
| `milestoneId` | string | Yes | The ID of the milestone to complete |

## Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `completedBy` | string | Yes | Ethereum address of the entity completing the milestone |
| `completionProof` | string | No | Proof of milestone completion (hash, text, etc.) |
| `completionProofURI` | string | No | URI where completion proof can be accessed |

## Request Example

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123/escrow/milestones/milestone_xyz789/complete \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "completedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "completionProof": "0xabcdef123456...",
    "completionProofURI": "https://example.com/proofs/milestone-0"
  }'
```

## Response

Returns a confirmation that the milestone was completed.

```json
{
  "object": "milestone",
  "status": "completed"
}
```

## Milestone Completion Process

When a milestone is completed:

1. **Status Update**: Milestone status changes to `COMPLETED`
2. **Completion Check**: System verifies milestone can be released
3. **Fund Release**: If conditions are met, funds are released
4. **Settlement**: Settlement job is scheduled for off-ramp processing

### Sequential Processing

Milestones must be completed in order:
- Milestone 0 must be completed before Milestone 1
- Milestone 1 must be completed before Milestone 2
- And so on...

### Automatic Release

If `autoReleaseOnProof` is enabled and all prerequisites are met:
- Funds are automatically released to merchant
- Settlement is scheduled
- Order status updates accordingly

## Completion Proof

The `completionProof` field can contain:
- Hash of completion document
- Signed completion certificate
- Delivery confirmation
- Any verifiable proof of milestone completion

### Generating Completion Proof

```typescript
import { ethers } from 'ethers';

// Example: Hash a completion document
const completionData = JSON.stringify({
  milestoneIndex: 0,
  completedAt: '2024-01-15T10:30:00Z',
  deliverables: ['feature-a', 'feature-b'],
  signedBy: 'merchant_address',
});

const completionProof = ethers.keccak256(ethers.toUtf8Bytes(completionData));
```

## Error Responses

### Milestone Not Found

```json
{
  "error": {
    "code": "resource_missing",
    "message": "Milestone not found",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `404 Not Found`

### Milestone Already Completed

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Milestone already completed",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

### Previous Milestone Not Completed

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Previous milestone (index 0) must be completed first",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

### Milestone Already Released

```json
{
  "error": {
    "code": "invalid_request",
    "message": "Milestone already released",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

## Code Examples

### JavaScript/TypeScript

```typescript
// Complete milestone 0
const response = await fetch(
  `https://api.finternet.com/v1/payment-intents/${intentId}/escrow/milestones/${milestoneId}/complete`,
  {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.FINTERNET_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      completedBy: merchantAddress,
      completionProof: completionProofHash,
      completionProofURI: 'https://example.com/proofs/milestone-0',
    }),
  }
);

const result = await response.json();
console.log('Milestone completed:', result.status);
```

### Python

```python
import requests

response = requests.post(
    f'https://api.finternet.com/v1/payment-intents/{intent_id}/escrow/milestones/{milestone_id}/complete',
    headers={
        'X-API-Key': os.environ['FINTERNET_API_KEY'],
        'Content-Type': 'application/json',
    },
    json={
        'completedBy': merchant_address,
        'completionProof': completion_proof_hash,
        'completionProofURI': 'https://example.com/proofs/milestone-0',
    }
)

result = response.json()
print('Milestone completed:', result['status'])
```

## Best Practices

### When to Complete a Milestone

- **Merchant**: When deliverables for the milestone are finished
- **Buyer**: When milestone deliverables are accepted
- **Both**: After mutual agreement on milestone completion

### Completion Proof

- **Document deliverables**: List what was completed
- **Include timestamps**: When completion occurred
- **Add signatures**: If applicable, include digital signatures
- **Store externally**: Use IPFS or other storage for proof documents

### Sequential Completion

Always complete milestones in order:
1. Complete Milestone 0
2. Wait for release confirmation
3. Complete Milestone 1
4. Continue sequentially

## Related

- [Create Milestone](create.md)
- [Milestone Payments](guides/milestone-payments.md)
- [Escrow Orders](concepts/escrow-orders.md)
