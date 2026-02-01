# Time-Locked Release Example

Complete example of implementing time-based payouts with automatic fund release.

## Overview

Time-locked releases automatically release funds after a specified time period. Perfect for:
- Subscription payments
- Recurring services
- Delayed payouts
- Trust-building mechanisms

## Complete Flow

```typescript
import { ethers } from 'ethers';

const API_KEY = process.env.FINTERNET_API_KEY;
const BASE_URL = 'https://sandbox.pg.api.finternetlab.io/v1';

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

// 1. Create payment intent with time-locked release
const createTimeLockedPayment = async (
  amount: string,
  lockDurationDays: number
) => {
  const lockUntil = Math.floor(Date.now() / 1000) + (lockDurationDays * 24 * 60 * 60);
  
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      currency: 'USDC',
      type: 'DELIVERY_VS_PAYMENT',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_123',
      metadata: {
        releaseType: 'TIME_LOCKED',
        timeLockUntil: lockUntil.toString(),
        deliveryPeriod: lockDurationDays * 24 * 60 * 60,
      },
    }),
  });

  return intent;
};

// 2. Confirm payment (buyer pays)
const confirmPayment = async (intentId: string) => {
  const intent = await apiRequest(`/payment-intents/${intentId}`);
  const typedData = intent.data.typedData;

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  
  const signature = await signer.signTypedData(
    typedData.domain,
    typedData.types,
    typedData.message
  );

  await apiRequest(`/payment-intents/${intentId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({
      signature,
      payerAddress: await signer.getAddress(),
    }),
  });
};

// 3. Monitor time lock status
const monitorTimeLock = async (intentId: string) => {
  const conditionalPayment = await apiRequest(`/payment-intents/${intentId}/conditional-payment`);
  const timeLockUntil = parseInt(conditionalPayment.data.timeLockUntil);
  const now = Math.floor(Date.now() / 1000);
  
  if (now < timeLockUntil) {
    const remaining = timeLockUntil - now;
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    
    console.log(`Time lock expires in ${days} days, ${hours} hours`);
    return false; // Not yet expired
  }
  
  return true; // Expired
};

// 4. Check if funds were released
const checkReleaseStatus = async (intentId: string) => {
  const conditionalPayment = await apiRequest(`/payment-intents/${intentId}/conditional-payment`);
  
  if (conditionalPayment.data.releasedAt) {
    const releasedAt = new Date(parseInt(conditionalPayment.data.releasedAt) * 1000);
    console.log(`Funds released at: ${releasedAt.toISOString()}`);
    return true;
  }
  
  return false;
};

// Complete example
const runTimeLockedPayment = async () => {
  // Create payment with 30-day time lock
  const intent = await createTimeLockedPayment('1000.00', 30);
  console.log('Payment intent created:', intent.id);
  
  // Confirm payment
  await confirmPayment(intent.id);
  console.log('Payment confirmed');
  
  // Monitor time lock
  const checkInterval = setInterval(async () => {
    const expired = await monitorTimeLock(intent.id);
    
    if (expired) {
      clearInterval(checkInterval);
      
      // Check if released
      const released = await checkReleaseStatus(intent.id);
      if (released) {
        console.log('Funds automatically released!');
      } else {
        console.log('Waiting for automatic release...');
      }
    }
  }, 3600000); // Check every hour
};
```

## Python Example

```python
import requests
import os
import time
from datetime import datetime, timedelta

API_KEY = os.environ['FINTERNET_API_KEY']
BASE_URL = 'https://sandbox.pg.api.finternetlab.io/v1'

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
    
    if not response.ok:
        error = response.json()
        raise Exception(error.get('error', {}).get('message', 'API request failed'))
    
    return response.json()

# Create time-locked payment
def create_time_locked_payment(amount, lock_duration_days):
    lock_until = int(time.time()) + (lock_duration_days * 24 * 60 * 60)
    
    intent = api_request('/payment-intents', 'POST', {
        'amount': amount,
        'currency': 'USDC',
        'type': 'DELIVERY_VS_PAYMENT',
        'settlementMethod': 'OFF_RAMP_MOCK',
        'settlementDestination': 'bank_account_123',
        'metadata': {
            'releaseType': 'TIME_LOCKED',
            'timeLockUntil': str(lock_until),
            'deliveryPeriod': lock_duration_days * 24 * 60 * 60,
        }
    })
    
    return intent

# Monitor time lock
def monitor_time_lock(intent_id):
    conditional_payment = api_request(f'/payment-intents/{intent_id}/conditional-payment')
    time_lock_until = int(conditional_payment['data']['timeLockUntil'])
    now = int(time.time())
    
    if now < time_lock_until:
        remaining = time_lock_until - now
        days = remaining // 86400
        hours = (remaining % 86400) // 3600
        
        print(f'Time lock expires in {days} days, {hours} hours')
        return False
    
    return True

# Run example
intent = create_time_locked_payment('1000.00', 30)
print(f'Payment intent created: {intent["id"]}')

# Monitor until release
while True:
    if monitor_time_lock(intent["id"]):
        conditional_payment = api_request(f'/payment-intents/{intent["id"]}/conditional-payment')
        if conditional_payment['data'].get('releasedAt'):
            released_at = datetime.fromtimestamp(int(conditional_payment['data']['releasedAt']))
            print(f'Funds released at: {released_at}')
            break
    
    time.sleep(3600)  # Check every hour
```

## Use Cases

### Subscription Service

```typescript
// Monthly subscription with 30-day time lock
const subscription = await createTimeLockedPayment('99.00', 30);
// Funds released after 30 days automatically
```

### Escrow for Services

```typescript
// Service payment with 7-day time lock for quality assurance
const servicePayment = await createTimeLockedPayment('500.00', 7);
// Funds released after 7 days if no disputes
```

### Delayed Payout

```typescript
// Delayed payout for contractor
const contractorPayout = await createTimeLockedPayment('2000.00', 14);
// Funds released after 14 days
```

## Related

- [Time-Based Payouts](../guides/payment-flows/time-based-payouts.md)
- [Conditional Payments](../concepts/conditional-payments.md)
- [API Reference](api-reference/introduction.md)
