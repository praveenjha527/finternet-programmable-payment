# Confirm Payment Intent

Confirms a payment intent by verifying the EIP-712 signature and submitting the transaction to the blockchain.

## Endpoint

```
POST /v1/payment-intents/:intentId/confirm
```

## Authentication

Requires API key authentication.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intentId` | string | Yes | The ID of the payment intent to confirm |

## Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `signature` | string | Yes | EIP-712 signature from the payer's wallet |
| `payerAddress` | string | Yes | Ethereum address of the payer |

## Request Example

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123/confirm \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "signature": "0x1234567890abcdef...",
    "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318"
  }'
```

## Response

Returns the updated payment intent with transaction details.

```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "PROCESSING",
  "data": {
    "id": "intent_2xYz9AbC123",
    "status": "PROCESSING",
    "transactionHash": "0xabc123def456...",
    "signerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "phases": [
      {
        "phase": "SIGNATURE_VERIFICATION",
        "status": "COMPLETED",
        "completedAt": 1704067200
      },
      {
        "phase": "BLOCKCHAIN_CONFIRMATION",
        "status": "IN_PROGRESS",
        "startedAt": 1704067200
      }
    ],
    "created": 1704067200,
    "updated": 1704067200
  },
  "created": 1704067200,
  "updated": 1704067200
}
```

## Signature Format

The signature must be a valid EIP-712 signature for the typed data provided in the payment intent's `typedData` field.

### Signature Generation

When creating a payment intent, you receive a `typedData` object. The payer must sign this data using EIP-712:

```typescript
// Example using ethers.js
import { ethers } from 'ethers';

const domain = typedData.domain;
const types = typedData.types;
const message = typedData.message;

const signature = await signer.signTypedData(domain, types, message);
```

See [EIP-712 Specification](https://eips.ethereum.org/EIPS/eip-712) for details.

## Status Transitions

Confirming a payment intent transitions the status:

- `INITIATED` → `PROCESSING`
- `REQUIRES_SIGNATURE` → `PROCESSING`

After confirmation, the payment intent enters the `PROCESSING` state while waiting for blockchain confirmation.

## Error Responses

### Invalid Signature

```json
{
  "error": {
    "code": "signature_verification_failed",
    "message": "Signature verification failed",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

### Invalid State

```json
{
  "error": {
    "code": "invalid_state_transition",
    "message": "Cannot confirm payment intent in status: SUCCEEDED",
    "type": "invalid_request_error"
  }
}
```

**Status Code:** `400 Bad Request`

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

## Code Examples

### JavaScript/TypeScript

```typescript
import { ethers } from 'ethers';

// Get payment intent with typedData
const intentResponse = await fetch(
  `https://api.finternet.com/v1/payment-intents/${intentId}`,
  {
    headers: {
      'X-API-Key': process.env.FINTERNET_API_KEY,
    },
  }
);

const intent = await intentResponse.json();
const typedData = intent.data.typedData;

// Sign with wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const signature = await signer.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);

// Confirm payment intent
const confirmResponse = await fetch(
  `https://api.finternet.com/v1/payment-intents/${intentId}/confirm`,
  {
    method: 'POST',
    headers: {
      'X-API-Key': process.env.FINTERNET_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      signature,
      payerAddress: await signer.getAddress(),
    }),
  }
);

const confirmed = await confirmResponse.json();
console.log('Transaction hash:', confirmed.data.transactionHash);
```

### Python

```python
import requests
from eth_account.messages import encode_defunct
from eth_account import Account

# Get payment intent
response = requests.get(
    f'https://api.finternet.com/v1/payment-intents/{intent_id}',
    headers={'X-API-Key': os.environ['FINTERNET_API_KEY']}
)
intent = response.json()
typed_data = intent['data']['typedData']

# Sign with wallet (using web3.py)
from web3 import Web3
w3 = Web3(Web3.HTTPProvider('https://sepolia.infura.io/v3/YOUR_KEY'))
account = w3.eth.account.from_key('YOUR_PRIVATE_KEY')

# Sign typed data
signature = account.sign_typed_data(
    domain=typed_data['domain'],
    types=typed_data['types'],
    message=typed_data['message']
)

# Confirm payment intent
confirm_response = requests.post(
    f'https://api.finternet.com/v1/payment-intents/{intent_id}/confirm',
    headers={
        'X-API-Key': os.environ['FINTERNET_API_KEY'],
        'Content-Type': 'application/json',
    },
    json={
        'signature': signature.signature.hex(),
        'payerAddress': account.address,
    }
)

confirmed = confirm_response.json()
print('Transaction hash:', confirmed['data']['transactionHash'])
```

## Related

- [Create Payment Intent](create.md)
- [Retrieve Payment Intent](retrieve.md)
- [Payment Intent Statuses](concepts/status-lifecycle.md)
- [EIP-712 Signatures](guides/eip712-signatures.md)
