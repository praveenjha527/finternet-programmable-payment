---
sidebar_position: 3
---

# Get Public Payment Intent

Retrieves a payment intent without authentication for frontend wallet interface. This public endpoint allows frontend applications to fetch payment intent data needed for wallet connection and transaction execution.

## Endpoint

```
GET /payment-intents/public/{intentId}
```

## Authentication

**Public Endpoint** - No authentication required.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intentId` | string | Yes | The payment intent ID |

## Response (200 OK)

Returns the payment intent object with all necessary data for frontend wallet integration.

```json
{
  "id": "intent_abc123xyz789",
  "object": "payment_intent",
  "status": "INITIATED",
  "data": {
    "id": "intent_abc123xyz789",
    "object": "payment_intent",
    "status": "INITIATED",
    "amount": "100.00",
    "currency": "USDC",
    "type": "DELIVERY_VS_PAYMENT",
    "description": "Order #12345",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123",
    "settlementStatus": "PENDING",
    "contractAddress": "0x319d975A5AAf7E5F5a6ae2CAbE5Ed418fE17E132",
    "chainId": 11155111,
    "transactionHash": null,
    "typedData": {
      "types": {
        "EIP712Domain": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "version",
            "type": "string"
          },
          {
            "name": "chainId",
            "type": "uint256"
          },
          {
            "name": "verifyingContract",
            "type": "address"
          }
        ],
        "PaymentIntent": [
          {
            "name": "intentId",
            "type": "bytes32"
          },
          {
            "name": "amount",
            "type": "uint256"
          },
          {
            "name": "nonce",
            "type": "uint256"
          }
        ]
      },
      "domain": {
        "name": "Finternet Payment Gateway",
        "chainId": 11155111,
        "version": "1",
        "verifyingContract": "0x319d975A5AAf7E5F5a6ae2CAbE5Ed418fE17E132"
      },
      "message": {
        "nonce": 0,
        "amount": "100000000",
        "intentId": "0xf65926ee94a84a01f2e5cfeca732528dc3a8320e74454753ddb81c90d7177f48"
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
      "tokenAddress": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      "contractMerchantId": "4"
    },
    "paymentUrl": "https://pay.fmm.finternetlab.io/?intent=intent_abc123xyz789",
    "estimatedFee": "2.50",
    "estimatedDeliveryTime": "15s",
    "created": 1770047115,
    "updated": 1770047115
  },
  "created": 1770047115,
  "updated": 1770047115
}
```

## Use Cases

### Frontend Wallet Integration

This endpoint is primarily used by frontend applications to:

1. **Fetch payment details** for wallet connection
2. **Get EIP-712 typed data** for user signature
3. **Retrieve contract address** for blockchain interaction
4. **Display payment information** to users
5. **Monitor payment status** without backend authentication

### Payment Flow Integration

```typescript
// Frontend wallet integration example
async function loadPaymentIntent(intentId: string) {
  const response = await fetch(
    `https://api.fmm.finternetlab.io/v1/payment-intents/public/${intentId}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to load payment intent');
  }
  
  const intent = await response.json();
  
  // Use the data for wallet connection
  return {
    contractAddress: intent.data.contractAddress,
    typedData: intent.data.typedData,
    amount: intent.data.amount,
    currency: intent.data.currency,
    chainId: intent.data.chainId
  };
}
```

## Response Fields

### Core Payment Data

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Payment intent identifier |
| `status` | string | Current payment status |
| `amount` | string | Payment amount |
| `currency` | string | Payment currency |
| `type` | string | Payment type |
| `description` | string | Payment description |

### Blockchain Integration

| Field | Type | Description |
|-------|------|-------------|
| `contractAddress` | string | Smart contract address for transaction |
| `chainId` | number | Blockchain network ID (11155111 for Sepolia) |
| `typedData` | object | EIP-712 structured data for signing |
| `transactionHash` | string | Blockchain transaction hash (if available) |
| `signature` | string | User's signature (if provided) |
| `signerAddress` | string | Signer's wallet address (if available) |

### Processing Status

| Field | Type | Description |
|-------|------|-------------|
| `phases` | array | Current processing phases and their status |
| `settlementStatus` | string | Settlement processing status |
| `estimatedFee` | string | Estimated transaction fee |
| `estimatedDeliveryTime` | string | Estimated completion time |

## Error Responses

### Payment Intent Not Found (404)

```json
{
  "object": "error",
  "type": "invalid_request_error",
  "code": "resource_missing",
  "message": "Payment intent not found: intent_abc123xyz789"
}
```

### Invalid Intent ID Format (400)

```json
{
  "object": "error",
  "type": "invalid_request_error",
  "code": "invalid_request",
  "message": "Invalid payment intent ID format",
  "param": "intentId"
}
```

## Code Examples

### JavaScript/TypeScript

```typescript
async function getPublicPaymentIntent(intentId: string) {
  try {
    const response = await fetch(
      `https://api.fmm.finternetlab.io/v1/payment-intents/public/${intentId}`
    );
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const intent = await response.json();
    
    console.log('Payment Intent:', intent.id);
    console.log('Status:', intent.data.status);
    console.log('Amount:', intent.data.amount, intent.data.currency);
    
    return intent;
  } catch (error) {
    console.error('Failed to fetch payment intent:', error);
    throw error;
  }
}

// Usage in React component
import React, { useEffect, useState } from 'react';

export const PaymentWidget: React.FC<{ intentId: string }> = ({ intentId }) => {
  const [intent, setIntent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicPaymentIntent(intentId)
      .then(setIntent)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [intentId]);

  if (loading) return <div>Loading payment details...</div>;
  if (!intent) return <div>Failed to load payment</div>;

  return (
    <div className="payment-widget">
      <h3>Payment Details</h3>
      <p>Amount: {intent.data.amount} {intent.data.currency}</p>
      <p>Description: {intent.data.description}</p>
      <p>Status: {intent.data.status}</p>
      {/* Wallet connection UI here */}
    </div>
  );
};
```

### Python

```python
import requests

def get_public_payment_intent(intent_id):
    """Fetch public payment intent data"""
    url = f'https://api.fmm.finternetlab.io/v1/payment-intents/public/{intent_id}'
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        
        intent = response.json()
        
        print(f'Payment Intent: {intent["id"]}')
        print(f'Status: {intent["data"]["status"]}')
        print(f'Amount: {intent["data"]["amount"]} {intent["data"]["currency"]}')
        
        return intent
        
    except requests.exceptions.RequestException as e:
        print(f'Failed to fetch payment intent: {e}')
        raise

# Usage example
if __name__ == '__main__':
    intent_id = 'intent_abc123xyz789'
    intent = get_public_payment_intent(intent_id)
    
    # Access blockchain data
    contract_address = intent['data']['contractAddress']
    typed_data = intent['data']['typedData']
    chain_id = intent['data']['chainId']
    
    print(f'Contract: {contract_address}')
    print(f'Chain ID: {chain_id}')
```

### cURL

```bash
# Fetch payment intent
curl https://api.fmm.finternetlab.io/v1/payment-intents/public/intent_abc123xyz789

# With error handling
curl -f https://api.fmm.finternetlab.io/v1/payment-intents/public/intent_abc123xyz789 \
  || echo "Failed to fetch payment intent"
```

## Frontend Integration Patterns

### Wallet Connection Flow

```typescript
import { ethers } from 'ethers';

async function connectWalletAndPay(intentId: string) {
  // 1. Fetch payment intent
  const intent = await getPublicPaymentIntent(intentId);
  
  // 2. Connect to wallet
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();
  
  // 3. Sign EIP-712 message
  const signature = await signer.signTypedData(
    intent.data.typedData.domain,
    intent.data.typedData.types,
    intent.data.typedData.message
  );
  
  // 4. Execute contract transaction
  const contract = new ethers.Contract(
    intent.data.contractAddress,
    contractABI,
    signer
  );
  
  const tx = await contract.executePayment(
    intent.data.typedData.message,
    signature
  );
  
  // 5. Update transaction hash
  await updateTransactionHash(intentId, tx.hash);
  
  return tx;
}
```

### Status Polling

```typescript
async function pollPaymentStatus(intentId: string, onStatusChange: (status: string) => void) {
  const poll = async () => {
    try {
      const intent = await getPublicPaymentIntent(intentId);
      onStatusChange(intent.data.status);
      
      // Continue polling if not final
      if (!['SETTLED', 'FINAL', 'CANCELED'].includes(intent.data.status)) {
        setTimeout(poll, 2000); // Poll every 2 seconds
      }
    } catch (error) {
      console.error('Polling error:', error);
      setTimeout(poll, 5000); // Retry after 5 seconds on error
    }
  };
  
  poll();
}
```

## Security Considerations

- **Public Access**: This endpoint is publicly accessible without authentication
- **No Sensitive Data**: Only returns data safe for public consumption
- **Rate Limiting**: May be subject to rate limiting to prevent abuse
- **CORS Enabled**: Configured to allow cross-origin requests from frontend domains

## Related Endpoints

- [Create Payment Intent](create.md)
- [Update Transaction Hash](update-transaction-hash.md)
- [Process Payment](process-payment.md)
- [Confirm Payment Intent](confirm.md)
