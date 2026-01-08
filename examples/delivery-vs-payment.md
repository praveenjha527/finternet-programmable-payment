# Delivery vs Payment Example

Complete example of implementing a Delivery vs Payment (DvP) escrow transaction.

## Overview

This example shows how to create an escrow order, handle delivery, and release funds automatically when delivery proof is submitted.

## Complete Flow

```typescript
const API_KEY = process.env.FINTERNET_API_KEY;
const BASE_URL = 'https://api.finternet.com/v1';

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return response.json();
}

// 1. Create payment intent with DvP type
const createDvPPayment = async (amount: string, orderId: string) => {
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      currency: 'USDC',
      type: 'DELIVERY_VS_PAYMENT',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_123',
      description: `Order ${orderId}`,
      metadata: {
        orderId,
        deliveryPeriod: 2592000, // 30 days
        releaseType: 'DELIVERY_PROOF',
        autoRelease: true,
      },
    }),
  });

  return intent;
};

// 2. Buyer confirms payment
const confirmPayment = async (intentId: string, signature: string, payerAddress: string) => {
  return apiRequest(`/payment-intents/${intentId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({
      signature,
      payerAddress,
    }),
  });
};

// 3. Merchant submits delivery proof
const submitDeliveryProof = async (
  intentId: string,
  proofHash: string,
  proofURI: string,
  merchantAddress: string
) => {
  return apiRequest(`/payment-intents/${intentId}/escrow/delivery-proof`, {
    method: 'POST',
    body: JSON.stringify({
      proofHash,
      proofURI,
      submittedBy: merchantAddress,
    }),
  });
};

// 4. Generate delivery proof hash
import { ethers } from 'ethers';

const generateDeliveryProof = (trackingNumber: string, deliveredAt: string) => {
  const deliveryData = {
    trackingNumber,
    deliveredAt,
    recipient: 'John Doe',
  };

  const proofHash = ethers.keccak256(
    ethers.toUtf8Bytes(JSON.stringify(deliveryData))
  );

  return proofHash;
};

// Complete example
const runDvPFlow = async () => {
  // Step 1: Create payment intent
  const intent = await createDvPPayment('1000.00', 'ORD-123');
  console.log('Payment intent created:', intent.id);

  // Step 2: Buyer confirms (frontend handles this)
  // ... wallet connection and signature ...

  // Step 3: Wait for payment confirmation
  let paymentStatus = 'PROCESSING';
  while (paymentStatus !== 'SUCCEEDED') {
    const status = await apiRequest(`/payment-intents/${intent.id}`);
    paymentStatus = status.data.status;
    
    if (paymentStatus === 'SUCCEEDED') {
      console.log('Payment confirmed, funds locked in escrow');
      break;
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  // Step 4: Merchant ships item
  // ... shipping process ...

  // Step 5: Submit delivery proof
  const proofHash = generateDeliveryProof('TRACK123456', new Date().toISOString());
  const deliveryProof = await submitDeliveryProof(
    intent.id,
    proofHash,
    'https://example.com/delivery-proofs/12345',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f42318'
  );
  console.log('Delivery proof submitted:', deliveryProof.id);

  // Step 6: Funds automatically released (if autoReleaseOnProof is true)
  // Check escrow order status
  const escrowOrder = await apiRequest(`/payment-intents/${intent.id}/escrow`);
  console.log('Escrow order status:', escrowOrder.data.orderStatus);
  console.log('Settlement status:', escrowOrder.data.settlementStatus);
};
```

## Python Example

```python
import requests
import os
import time
from web3 import Web3

API_KEY = os.environ.get('FINTERNET_API_KEY')
BASE_URL = 'https://api.finternet.com/v1'

def api_request(endpoint, method='GET', data=None):
    url = f'{BASE_URL}{endpoint}'
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
    }
    
    if method == 'POST':
        response = requests.post(url, headers=headers, json=data)
    else:
        response = requests.get(url, headers=headers)
    
    response.raise_for_status()
    return response.json()

# Create DvP payment
def create_dvp_payment(amount, order_id):
    return api_request('/payment-intents', method='POST', data={
        'amount': amount,
        'currency': 'USDC',
        'type': 'DELIVERY_VS_PAYMENT',
        'settlementMethod': 'OFF_RAMP_MOCK',
        'settlementDestination': 'bank_account_123',
        'description': f'Order {order_id}',
        'metadata': {
            'orderId': order_id,
            'deliveryPeriod': 2592000,
            'releaseType': 'DELIVERY_PROOF',
            'autoRelease': True,
        }
    })

# Submit delivery proof
def submit_delivery_proof(intent_id, proof_hash, proof_uri, merchant_address):
    return api_request(
        f'/payment-intents/{intent_id}/escrow/delivery-proof',
        method='POST',
        data={
            'proofHash': proof_hash,
            'proofURI': proof_uri,
            'submittedBy': merchant_address,
        }
    )

# Generate proof hash
def generate_delivery_proof(tracking_number, delivered_at):
    delivery_data = {
        'trackingNumber': tracking_number,
        'deliveredAt': delivered_at,
        'recipient': 'John Doe',
    }
    
    proof_hash = Web3.keccak(text=str(delivery_data)).hex()
    return proof_hash

# Run flow
intent = create_dvp_payment('1000.00', 'ORD-123')
print(f'Payment intent created: {intent["id"]}')

# Wait for payment confirmation
while True:
    status = api_request(f'/payment-intents/{intent["id"]}')
    if status['data']['status'] == 'SUCCEEDED':
        print('Payment confirmed')
        break
    time.sleep(5)

# Submit delivery proof
proof_hash = generate_delivery_proof('TRACK123456', '2024-01-15T10:30:00Z')
delivery_proof = submit_delivery_proof(
    intent['id'],
    proof_hash,
    'https://example.com/delivery-proofs/12345',
    '0x742d35Cc6634C0532925a3b844Bc9e7595f42318'
)
print(f'Delivery proof submitted: {delivery_proof["id"]}')
```

## Related

- [Delivery vs Payment Guide](guides/delivery-vs-payment.md)
- [Submit Delivery Proof](api-reference/escrow-orders/submit-delivery-proof.md)
- [Escrow Orders](concepts/escrow-orders.md)
