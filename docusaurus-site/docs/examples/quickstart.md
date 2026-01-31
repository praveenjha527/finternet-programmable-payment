# Quickstart Examples

Get started with Finternet in minutes. These examples show common integration patterns using direct API calls.

## Prerequisites

- Node.js 18+ or Python 3.8+
- Finternet API key
- Basic understanding of REST APIs

## JavaScript/TypeScript

### Basic Setup

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

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'API request failed');
  }

  return response.json();
}
```

### Create Payment Intent

```typescript
const intent = await apiRequest('/payment-intents', {
  method: 'POST',
  body: JSON.stringify({
    amount: '100.00',
    currency: 'USDC',
    type: 'CONSENTED_PULL',
    settlementMethod: 'OFF_RAMP_MOCK',
    settlementDestination: 'bank_account_123',
    description: 'Order #12345',
    metadata: {
      orderId: 'ORD-123',
      customerId: 'CUST-456',
    },
  }),
});

console.log('Payment Intent:', intent.id);
console.log('Payment URL:', intent.data.paymentUrl);
```

### Confirm Payment

```typescript
import { ethers } from 'ethers';

// Get typed data from payment intent
const intent = await apiRequest(`/payment-intents/${intentId}`);
const typedData = intent.data.typedData;

// Sign with wallet
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const signature = await signer.signTypedData(
  typedData.domain,
  typedData.types,
  typedData.message
);

// Confirm payment
const confirmed = await apiRequest(`/payment-intents/${intentId}/confirm`, {
  method: 'POST',
  body: JSON.stringify({
    signature,
    payerAddress: await signer.getAddress(),
  }),
});

console.log('Transaction hash:', confirmed.data.transactionHash);
```

### Check Payment Status

```typescript
const checkStatus = async (intentId: string) => {
  const intent = await apiRequest(`/payment-intents/${intentId}`);
  
  console.log('Status:', intent.data.status);
  console.log('Phases:', intent.data.phases);
  
  if (intent.data.status === 'SUCCEEDED') {
    console.log('Payment confirmed!');
  }
  
  return intent;
};

// Poll every 5 seconds
const pollStatus = setInterval(async () => {
  const intent = await checkStatus(intentId);
  if (intent.data.status === 'SUCCEEDED') {
    clearInterval(pollStatus);
  }
}, 5000);
```

## Python

### Basic Setup

```python
import os
import requests

API_KEY = os.environ.get('FINTERNET_API_KEY')
BASE_URL = 'https://api.finternet.com/v1'

def api_request(endpoint, method='GET', data=None):
    url = f'{BASE_URL}{endpoint}'
    headers = {
        'X-API-Key': API_KEY,
        'Content-Type': 'application/json',
    }
    
    if method == 'GET':
        response = requests.get(url, headers=headers)
    elif method == 'POST':
        response = requests.post(url, headers=headers, json=data)
    
    response.raise_for_status()
    return response.json()
```

### Create Payment Intent

```python
intent = api_request('/payment-intents', method='POST', data={
    'amount': '100.00',
    'currency': 'USDC',
    'type': 'CONSENTED_PULL',
    'settlementMethod': 'OFF_RAMP_MOCK',
    'settlementDestination': 'bank_account_123',
    'description': 'Order #12345',
    'metadata': {
        'orderId': 'ORD-123',
        'customerId': 'CUST-456',
    }
})

print(f'Payment Intent: {intent["id"]}')
print(f'Payment URL: {intent["data"]["paymentUrl"]}')
```

### Confirm Payment

```python
from web3 import Web3
from eth_account.messages import encode_defunct

# Get typed data
intent = api_request(f'/payment-intents/{intent_id}')
typed_data = intent['data']['typedData']

# Sign with wallet
w3 = Web3(Web3.HTTPProvider('https://sepolia.infura.io/v3/YOUR_KEY'))
account = w3.eth.account.from_key('YOUR_PRIVATE_KEY')

signature = account.sign_typed_data(
    domain=typed_data['domain'],
    types=typed_data['types'],
    message=typed_data['message']
)

# Confirm payment
confirmed = api_request(
    f'/payment-intents/{intent_id}/confirm',
    method='POST',
    data={
        'signature': signature.signature.hex(),
        'payerAddress': account.address
    }
)

print(f'Transaction hash: {confirmed["data"]["transactionHash"]}')
```

## cURL

### Create Payment Intent

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "type": "CONSENTED_PULL",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123"
  }'
```

### Retrieve Payment Intent

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123 \
  -H "X-API-Key: sk_test_your_key_here"
```

### Confirm Payment Intent

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123/confirm \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "signature": "0x1234...",
    "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318"
  }'
```

## Complete Example: E-commerce Checkout

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

// 1. Create payment intent when customer clicks "Pay"
const createCheckout = async (cartTotal: string, orderId: string) => {
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({
      amount: cartTotal,
      currency: 'USDC',
      type: 'CONSENTED_PULL',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'merchant_bank_account',
      description: `Order ${orderId}`,
      metadata: {
        orderId,
        customerEmail: 'customer@example.com',
      },
    }),
  });

  // Redirect to payment page
  window.location.href = intent.data.paymentUrl;
};

// 2. On payment page, handle wallet connection and payment
const handlePayment = async (intentId: string) => {
  // Get payment intent
  const intent = await apiRequest(`/payment-intents/${intentId}`);
  
  // Connect wallet
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  // Sign and confirm
  const signature = await signer.signTypedData(
    intent.data.typedData.domain,
    intent.data.typedData.types,
    intent.data.typedData.message
  );
  
  await apiRequest(`/payment-intents/${intentId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({
      signature,
      payerAddress: await signer.getAddress(),
    }),
  });
  
  // Poll for confirmation
  const pollInterval = setInterval(async () => {
    const updated = await apiRequest(`/payment-intents/${intentId}`);
    if (updated.data.status === 'SUCCEEDED') {
      clearInterval(pollInterval);
      // Redirect to success page
      window.location.href = '/payment-success';
    }
  }, 5000);
};
```

## Error Handling

```typescript
try {
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({...}),
  });
} catch (error: any) {
  if (error.error?.type === 'authentication_error') {
    console.error('Invalid API key');
  } else if (error.error?.type === 'invalid_request_error') {
    console.error('Invalid request:', error.error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Next Steps

- [Delivery vs Payment](delivery-vs-payment.md)
- [Time-Based Payouts](time-locked-release.md)
- [Milestone Payments](milestone-payments.md)
- [API Reference](api-reference/introduction.md)
