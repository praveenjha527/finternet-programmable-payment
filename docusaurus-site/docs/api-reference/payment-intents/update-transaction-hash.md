---
sidebar_position: 5
---

# Update Transaction Hash

Updates a payment intent with the blockchain transaction hash. This public endpoint is called by frontend applications after contract execution to notify the backend of the transaction.

## Endpoint

```
POST /payment-intents/public/{intentId}/transaction-hash
```

## Authentication

**Public Endpoint** - No authentication required.

## Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `intentId` | string | Yes | The payment intent ID |

## Request Body

```json
{
  "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
}
```

## Request Body Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `transactionHash` | string | Yes | Blockchain transaction hash (64-character hex string with 0x prefix) |

## Response (200 OK)

Returns the updated payment intent with the new transaction hash.

```json
{
  "id": "intent_abc123xyz789",
  "object": "payment_intent",
  "status": "PROCESSING",
  "data": {
    "id": "intent_abc123xyz789",
    "object": "payment_intent",
    "status": "PROCESSING",
    "amount": "100.00",
    "currency": "USDC",
    "type": "DELIVERY_VS_PAYMENT",
    "description": "Order #12345",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123",
    "settlementStatus": "PENDING",
    "contractAddress": "0x319d975A5AAf7E5F5a6ae2CAbE5Ed418fE17E132",
    "chainId": 11155111,
    "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    "typedData": {
      "types": {
        "EIP712Domain": [...],
        "PaymentIntent": [...]
      },
      "domain": {...},
      "message": {...}
    },
    "signature": "0x1234567890abcdef...",
    "signerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "phases": [
      {
        "phase": "SIGNATURE_VERIFICATION",
        "status": "COMPLETED",
        "timestamp": 1770047200
      },
      {
        "phase": "BLOCKCHAIN_CONFIRMATION",
        "status": "IN_PROGRESS"
      }
    ],
    "metadata": {
      "tokenAddress": "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
      "contractMerchantId": "4"
    },
    "estimatedFee": "2.50",
    "estimatedDeliveryTime": "15s",
    "created": 1770047115,
    "updated": 1770047200
  },
  "created": 1770047115,
  "updated": 1770047200
}
```

## Use Cases

### Frontend Wallet Integration

This endpoint is called by frontend applications after users execute blockchain transactions:

1. **After Contract Execution**: Frontend calls this endpoint with the transaction hash
2. **Status Updates**: Backend begins monitoring the transaction for confirmations
3. **Phase Progression**: Payment intent moves to blockchain confirmation phase
4. **Settlement Trigger**: Confirmed transactions trigger settlement processes

### Transaction Flow

```typescript
// Frontend workflow after user signs and executes transaction
async function executePaymentTransaction(intentId: string, typedData: any) {
  // 1. Get wallet signer
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // 2. Execute contract transaction
  const contract = new ethers.Contract(contractAddress, contractABI, signer);
  const tx = await contract.executePayment(typedData.message, signature);
  
  // 3. Update backend with transaction hash
  await updateTransactionHash(intentId, tx.hash);
  
  // 4. Wait for confirmation
  await tx.wait();
  
  return tx;
}
```

## Response Fields

### Updated Fields

After updating the transaction hash, the following fields are modified:

| Field | Type | Description |
|-------|------|-------------|
| `transactionHash` | string | The blockchain transaction hash |
| `status` | string | Updated to `PROCESSING` |
| `phases` | array | New phase added for blockchain confirmation |
| `updated` | number | Timestamp updated to current time |

### Phase Updates

The payment intent phases are updated to include blockchain confirmation:

```json
{
  "phases": [
    {
      "phase": "SIGNATURE_VERIFICATION",
      "status": "COMPLETED",
      "timestamp": 1770047200
    },
    {
      "phase": "BLOCKCHAIN_CONFIRMATION",
      "status": "IN_PROGRESS"
    }
  ]
}
```

## Error Responses

### Invalid Transaction Hash (400)

```json
{
  "object": "error",
  "type": "invalid_request_error",
  "code": "invalid_transaction_hash",
  "message": "Transaction hash must be a valid 64-character hex string with 0x prefix",
  "param": "transactionHash"
}
```

### Payment Intent Not Found (404)

```json
{
  "object": "error",
  "type": "invalid_request_error",
  "code": "resource_missing",
  "message": "Payment intent not found: intent_abc123xyz789"
}
```

### Invalid Payment State (400)

```json
{
  "object": "error",
  "type": "invalid_request_error",
  "code": "invalid_state",
  "message": "Cannot update transaction hash: payment intent is already processed"
}
```

### Transaction Hash Already Set (400)

```json
{
  "object": "error",
  "type": "invalid_request_error",
  "code": "transaction_hash_exists",
  "message": "Transaction hash already set for this payment intent"
}
```

## Code Examples

### JavaScript/TypeScript

```typescript
async function updateTransactionHash(intentId: string, transactionHash: string) {
  try {
    const response = await fetch(
      `https://api.fmm.finternetlab.io/v1/payment-intents/public/${intentId}/transaction-hash`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionHash
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to update transaction hash: ${response.status}`);
    }

    const result = await response.json();
    console.log('Transaction hash updated:', result.data.transactionHash);
    console.log('New status:', result.data.status);
    
    return result;
  } catch (error) {
    console.error('Error updating transaction hash:', error);
    throw error;
  }
}

// Usage in wallet integration
async function handleTransactionExecution(intentId: string, contractData: any) {
  // Execute transaction
  const tx = await executeContractTransaction(contractData);
  
  // Update backend immediately
  await updateTransactionHash(intentId, tx.hash);
  
  // Wait for confirmation
  const receipt = await tx.wait();
  console.log('Transaction confirmed:', receipt.transactionHash);
  
  return receipt;
}
```

### React Hook Example

```typescript
import { useState, useCallback } from 'react';

export function useTransactionUpdate() {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateHash = useCallback(async (intentId: string, txHash: string) => {
    setUpdating(true);
    setError(null);

    try {
      const response = await fetch(
        `https://api.fmm.finternetlab.io/v1/payment-intents/public/${intentId}/transaction-hash`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transactionHash: txHash }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update transaction hash');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setUpdating(false);
    }
  }, []);

  return { updateHash, updating, error };
}
```

### Python

```python
import requests

def update_transaction_hash(intent_id, transaction_hash):
    """Update payment intent with blockchain transaction hash"""
    url = f'https://api.fmm.finternetlab.io/v1/payment-intents/public/{intent_id}/transaction-hash'
    
    payload = {
        'transactionHash': transaction_hash
    }
    
    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        
        result = response.json()
        print(f'Transaction hash updated: {result["data"]["transactionHash"]}')
        print(f'New status: {result["data"]["status"]}')
        
        return result
        
    except requests.exceptions.RequestException as e:
        print(f'Failed to update transaction hash: {e}')
        raise

# Usage example
if __name__ == '__main__':
    intent_id = 'intent_abc123xyz789'
    tx_hash = '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
    
    try:
        result = update_transaction_hash(intent_id, tx_hash)
        print('Update successful!')
    except Exception as e:
        print(f'Update failed: {e}')
```

### cURL

```bash
# Update transaction hash
curl https://api.fmm.finternetlab.io/v1/payment-intents/public/intent_abc123xyz789/transaction-hash \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "transactionHash": "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"
  }'

# With error handling
curl -f https://api.fmm.finternetlab.io/v1/payment-intents/public/intent_abc123xyz789/transaction-hash \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{"transactionHash": "0xabcdef..."}' \
  || echo "Failed to update transaction hash"
```

## Integration Patterns

### Automatic Updates

```typescript
// Automatically update transaction hash after contract execution
class PaymentProcessor {
  async processPayment(intentId: string, paymentData: any) {
    try {
      // 1. Execute blockchain transaction
      const tx = await this.executeTransaction(paymentData);
      
      // 2. Immediately update backend
      await this.updateTransactionHash(intentId, tx.hash);
      
      // 3. Monitor for confirmation
      const receipt = await tx.wait();
      
      // 4. Transaction is now confirmed
      console.log('Payment processed successfully:', receipt.transactionHash);
      
      return receipt;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw error;
    }
  }

  private async updateTransactionHash(intentId: string, txHash: string) {
    // Implementation here
    return updateTransactionHash(intentId, txHash);
  }
}
```

### Error Recovery

```typescript
// Handle failed transaction hash updates with retry
async function updateTransactionHashWithRetry(
  intentId: string, 
  txHash: string, 
  maxRetries: number = 3
) {
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await updateTransactionHash(intentId, txHash);
    } catch (error) {
      lastError = error as Error;
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`Retry ${attempt} failed, waiting ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(`Failed to update transaction hash after ${maxRetries} attempts: ${lastError.message}`);
}
```

## Validation Rules

### Transaction Hash Format

- **Length**: Exactly 66 characters (including 0x prefix)
- **Prefix**: Must start with "0x"
- **Characters**: Only hexadecimal characters (0-9, a-f, A-F)
- **Case**: Case insensitive

### Valid Examples

```
0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890
0xABCDEF1234567890ABCDEF1234567890ABCDEF1234567890ABCDEF1234567890
0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef
```

### Invalid Examples

```
abcdef1234567890...  // Missing 0x prefix
0x123...             // Too short
0xGHIJKL...          // Invalid characters
```

## Security Considerations

- **Public Access**: This endpoint is publicly accessible without authentication
- **Idempotency**: Multiple calls with the same transaction hash are handled gracefully
- **Validation**: Transaction hash format is strictly validated
- **Rate Limiting**: May be subject to rate limiting to prevent abuse

## Related Endpoints

- [Get Public Payment Intent](get-public.md)
- [Process Payment](process-payment.md)
- [Confirm Payment Intent](confirm.md)
- [Create Payment Intent](create.md)
