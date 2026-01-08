# Submit Delivery Proof

Submits a delivery proof for an escrow order, allowing funds to be released to the merchant.

## Endpoint

```
POST /v1/payment-intents/:intentId/escrow/delivery-proof
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
| `proofHash` | string | Yes | Hash of the delivery proof (bytes32 hex string) |
| `proofURI` | string | No | URI where the delivery proof can be accessed (IPFS, HTTP, etc.) |
| `submittedBy` | string | Yes | Ethereum address of the entity submitting the proof |
| `submitTxHash` | string | No | Transaction hash if proof was submitted on-chain |

## Request Example

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123/escrow/delivery-proof \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "proofHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "proofURI": "https://example.com/delivery-proofs/12345",
    "submittedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318"
  }'
```

## Delivery Proof Hash

The `proofHash` should be a `bytes32` hash (64 hex characters) of your delivery proof. Common approaches:

1. **Hash of delivery confirmation document**: Hash a PDF, image, or text document
2. **Hash of tracking number**: Hash the tracking number and delivery confirmation
3. **Hash of signed delivery receipt**: Hash a digitally signed delivery receipt

### Generating a Proof Hash

```typescript
import { ethers } from 'ethers';

// Example: Hash a delivery confirmation
const deliveryConfirmation = JSON.stringify({
  trackingNumber: 'TRACK123456',
  deliveredAt: '2024-01-15T10:30:00Z',
  recipient: 'John Doe',
  signature: 'signed_receipt_data'
});

const proofHash = ethers.keccak256(ethers.toUtf8Bytes(deliveryConfirmation));
// Returns: 0xabcdef1234567890...
```

## Response

Returns the delivery proof object.

```json
{
  "id": "delivery_proof_xyz789",
  "object": "delivery_proof",
  "data": {
    "id": "delivery_proof_xyz789",
    "escrowOrderId": "escrow_order_abc123",
    "paymentIntentId": "intent_2xYz9AbC123",
    "proofHash": "0xabcdef1234567890...",
    "proofURI": "https://example.com/delivery-proofs/12345",
    "submittedBy": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "submittedAt": "1704067200",
    "submitTxHash": "0x1234...",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

## Order Status Requirements

The escrow order must be in `Created` status (status `0` on-chain) to submit a delivery proof. The order lifecycle is:

```
Created (0) → Delivered (2) → AwaitingSettlement (3) → Completed (4)
```

After submitting delivery proof:
- If `autoReleaseOnProof` is `true`, funds are automatically released
- Order status transitions to `DELIVERED`
- Settlement is scheduled automatically

## Auto-Release Behavior

If `autoReleaseOnProof` is enabled:

1. Delivery proof is submitted on-chain
2. Contract automatically releases funds to merchant's contract balance
3. Order status transitions to `AwaitingSettlement` (3)
4. Settlement job is automatically enqueued
5. Funds are converted to fiat and sent to merchant's bank account

If `autoReleaseOnProof` is `false`, manual release is required.

## Error Responses

### Invalid Order Status

```json
{
  "error": {
    "code": "invalid_status",
    "message": "Cannot submit delivery proof: order status is 2, must be Created (0). Order lifecycle: Created (0) → Delivered (2) → AwaitingSettlement (3) → Completed (4)",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

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

### Invalid Proof Hash Format

```json
{
  "error": {
    "code": "invalid_request",
    "message": "proofHash must be a valid bytes32 hex string",
    "type": "invalid_request_error",
    "param": "proofHash"
  }
}
```

**Status Code:** `400 Bad Request`

## Code Examples

### JavaScript/TypeScript

```typescript
import { ethers } from 'ethers';

// Generate proof hash
const deliveryData = {
  trackingNumber: 'TRACK123456',
  deliveredAt: new Date().toISOString(),
  recipient: 'John Doe',
};

const proofHash = ethers.keccak256(
  ethers.toUtf8Bytes(JSON.stringify(deliveryData))
);

// Submit delivery proof
const response = await fetch(
  `https://api.finternet.com/v1/payment-intents/${intentId}/escrow/delivery-proof`,
  {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.FINTERNET_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      proofHash,
      proofURI: 'https://example.com/delivery-proofs/12345',
      submittedBy: merchantAddress,
    }),
  }
);

const deliveryProof = await response.json();
console.log('Delivery proof submitted:', deliveryProof.id);
```

### Python

```python
import requests
from web3 import Web3

# Generate proof hash
delivery_data = {
    'trackingNumber': 'TRACK123456',
    'deliveredAt': '2024-01-15T10:30:00Z',
    'recipient': 'John Doe',
}

proof_hash = Web3.keccak(text=json.dumps(delivery_data)).hex()

# Submit delivery proof
response = requests.post(
    f'https://api.finternet.com/v1/payment-intents/{intent_id}/escrow/delivery-proof',
    headers={
        'X-API-Key': os.environ['FINTERNET_API_KEY'],
        'Content-Type': 'application/json',
    },
    json={
        'proofHash': proof_hash,
        'proofURI': 'https://example.com/delivery-proofs/12345',
        'submittedBy': merchant_address,
    }
)

delivery_proof = response.json()
print('Delivery proof submitted:', delivery_proof['id'])
```

## Related

- [Get Escrow Order](get.md)
- [Raise Dispute](raise-dispute.md)
- [Delivery vs Payment](guides/delivery-vs-payment.md)
- [Escrow Orders](concepts/escrow-orders.md)
