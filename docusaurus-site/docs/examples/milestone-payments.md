# Milestone Payments Example

Complete example of implementing milestone-based payments with incremental fund releases.

## Overview

This example shows how to create milestones, complete them sequentially, and automatically release funds as each milestone is finished.

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

// 1. Create payment intent with milestone release type
const createMilestonePayment = async (amount: string, projectId: string) => {
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({
      amount,
      currency: 'USDC',
      type: 'DELIVERY_VS_PAYMENT',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_123',
      description: `Project ${projectId}`,
      metadata: {
        projectId,
        releaseType: 'MILESTONE_LOCKED',
        autoRelease: true,
      },
    }),
  });

  return intent;
};

// 2. Create milestones
const createMilestone = async (
  intentId: string,
  milestoneIndex: number,
  amount: string,
  description: string,
  percentage?: number
) => {
  return apiRequest(`/payment-intents/${intentId}/escrow/milestones`, {
    method: 'POST',
    body: JSON.stringify({
      milestoneIndex,
      amount,
      description,
      percentage,
    }),
  });
};

// 3. Complete milestone
const completeMilestone = async (
  intentId: string,
  milestoneId: string,
  completedBy: string,
  completionProof?: string
) => {
  return apiRequest(
    `/payment-intents/${intentId}/escrow/milestones/${milestoneId}/complete`,
    {
      method: 'POST',
      body: JSON.stringify({
        completedBy,
        completionProof,
      }),
    }
  );
};

// Complete example: 3-milestone project
const runMilestoneFlow = async () => {
  // Step 1: Create payment intent
  const intent = await createMilestonePayment('1000.00', 'PROJ-123');
  console.log('Payment intent created:', intent.id);

  // Step 2: Create milestones (30/50/20 split)
  const milestones = [
    { index: 0, amount: '300.00', description: 'Project kickoff - 30%', percentage: 30 },
    { index: 1, amount: '500.00', description: 'Core features - 50%', percentage: 50 },
    { index: 2, amount: '200.00', description: 'Final delivery - 20%', percentage: 20 },
  ];

  const createdMilestones = [];
  for (const milestone of milestones) {
    const created = await createMilestone(
      intent.id,
      milestone.index,
      milestone.amount,
      milestone.description,
      milestone.percentage
    );
    createdMilestones.push(created);
    console.log(`Milestone ${milestone.index} created:`, created.id);
  }

  // Step 3: Complete milestones sequentially
  // Milestone 0
  await completeMilestone(
    intent.id,
    createdMilestones[0].id,
    '0x742d35Cc6634C0532925a3b844Bc9e7595f42318',
    'proof_hash_0'
  );
  console.log('Milestone 0 completed, funds released');

  // Wait a bit, then complete milestone 1
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await completeMilestone(
    intent.id,
    createdMilestones[1].id,
    '0x742d35Cc6634C0532925a3b844Bc9e7595f42318',
    'proof_hash_1'
  );
  console.log('Milestone 1 completed, funds released');

  // Complete milestone 2
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  await completeMilestone(
    intent.id,
    createdMilestones[2].id,
    '0x742d35Cc6634C0532925a3b844Bc9e7595f42318',
    'proof_hash_2'
  );
  console.log('Milestone 2 completed, all funds released');
};
```

## Python Example

```python
import requests
import os
import time

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

# Create milestone payment
intent = api_request('/payment-intents', method='POST', data={
    'amount': '1000.00',
    'currency': 'USDC',
    'type': 'DELIVERY_VS_PAYMENT',
    'settlementMethod': 'OFF_RAMP_MOCK',
    'settlementDestination': 'bank_account_123',
    'metadata': {
        'releaseType': 'MILESTONE_LOCKED',
        'autoRelease': True,
    }
})

# Create milestones
milestones_data = [
    {'milestoneIndex': 0, 'amount': '300.00', 'description': 'Kickoff - 30%', 'percentage': 30},
    {'milestoneIndex': 1, 'amount': '500.00', 'description': 'Core - 50%', 'percentage': 50},
    {'milestoneIndex': 2, 'amount': '200.00', 'description': 'Final - 20%', 'percentage': 20},
]

created_milestones = []
for milestone in milestones_data:
    created = api_request(
        f'/payment-intents/{intent["id"]}/escrow/milestones',
        method='POST',
        data=milestone
    )
    created_milestones.append(created)
    print(f"Milestone {milestone['milestoneIndex']} created: {created['id']}")

# Complete milestones
for i, milestone in enumerate(created_milestones):
    api_request(
        f'/payment-intents/{intent["id"]}/escrow/milestones/{milestone["id"]}/complete',
        method='POST',
        data={
            'completedBy': '0x742d35Cc6634C0532925a3b844Bc9e7595f42318',
            'completionProof': f'proof_hash_{i}',
        }
    )
    print(f'Milestone {i} completed')
    time.sleep(2)
```

## Related

- [Milestone Payments Guide](guides/milestone-payments.md)
- [Create Milestone](api-reference/milestones/create.md)
- [Complete Milestone](api-reference/milestones/complete.md)
