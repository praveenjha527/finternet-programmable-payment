# Quickstart Examples

Get started with Finternet in minutes. These examples show common integration patterns using direct API calls.

:::note Sandbox Environment
🧪 **Development Environment**: All examples use the **sandbox environment** (`api.fmm.finternetlab.io`).

🚀 **Production API** will be available once deployed.
:::

## Prerequisites

- Node.js 18+ or Python 3.8+
- Finternet API key
- Basic understanding of REST APIs

## JavaScript/TypeScript

### Basic Setup

```typescript
const API_KEY = process.env.FINTERNET_API_KEY;
const BASE_URL = 'https://api.fmm.finternetlab.io/v1';

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
    type: 'CONDITIONAL',
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

### Complete Payment

```typescript
// Payment is handled via the payment URL
// User is redirected to intent.data.paymentUrl to complete payment
console.log('Redirect user to:', intent.data.paymentUrl);

// Payment processor handles card/bank transfer automatically
// No manual confirmation API call needed
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
BASE_URL = 'https://api.fmm.finternetlab.io/v1'

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
    'type': 'CONDITIONAL',
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

### Complete Payment

```python
# Payment is handled via the payment URL
# User is redirected to intent["data"]["paymentUrl"] to complete payment
print(f'Redirect user to: {intent["data"]["paymentUrl"]}')

# Payment processor handles card/bank transfer automatically
# No manual confirmation API call needed
```

## cURL

### Create Payment Intent

```bash
curl https://api.fmm.finternetlab.io/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "type": "CONDITIONAL",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123"
  }'
```

### Retrieve Payment Intent

```bash
curl https://api.fmm.finternetlab.io/v1/payment-intents/intent_2xYz9AbC123 \
  -H "X-API-Key: sk_test_your_key_here"
```

### Complete Payment

Payment is handled via the payment URL returned in the payment intent response. Users are redirected to this URL to complete payment with card/bank transfer.

```bash
# No manual confirmation needed - payment handled via payment URL
# Users complete payment at the paymentUrl returned in the payment intent
```

## Complete Example: E-commerce Checkout

```typescript
const API_KEY = process.env.FINTERNET_API_KEY;
const BASE_URL = 'https://api.fmm.finternetlab.io/v1';

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
      type: 'CONDITIONAL',
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

// 2. On payment page, handle payment processing
const handlePayment = async (intentId: string) => {
  // Get payment intent
  const intent = await apiRequest(`/payment-intents/${intentId}`);
  
  // For Web2 flow, payment is processed via card/bank transfer
  // No wallet connection or signing required
  
  // Payment is completed via payment URL - no manual confirmation needed
  // User is redirected to intent.data.paymentUrl to complete payment
  
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
