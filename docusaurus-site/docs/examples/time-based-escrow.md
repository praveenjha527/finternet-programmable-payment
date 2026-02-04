# Time-Based Escrow Payments

Complete example of implementing time-locked escrow payments that automatically release funds after a specified time period.

## Overview

Time-based escrow payments automatically release funds to the merchant after a predetermined time period, even without explicit delivery confirmation. This is ideal for:

- **Service contracts** with defined completion dates
- **Subscription services** with monthly/annual billing
- **Rental agreements** with automatic payment releases
- **Trust-building** for new merchant relationships
- **Recurring payments** with escrow protection

## Complete Flow

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
    throw new Error(`API Error: ${response.status}`);
  }

  return response.json();
}

// Step 1: Create Time-Locked Payment Intent
async function createTimeLockedPayment() {
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({
      amount: '2500.00',
      currency: 'USDC',
      type: 'DELIVERY_VS_PAYMENT',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_789',
      description: 'Web Development Services - 30-day project',
      metadata: {
        serviceType: 'web_development',
        projectDuration: '30_days',
        clientId: 'CLIENT-456',
        contractId: 'CONTRACT-789'
      },
      deliveryPeriod: 2592000, // 30 days in seconds
      autoRelease: true, // Auto-release after time period
      expectedDeliveryHash: '0x0000000000000000000000000000000000000000000000000000000000000000', // No specific delivery expected
      deliveryOracle: '0x0000000000000000000000000000000000000000' // No oracle needed
    }),
  });

  console.log('Time-locked payment created:', intent.id);
  console.log('Auto-release date:', new Date(Date.now() + 2592000 * 1000).toISOString());
  console.log('Payment URL:', intent.data.paymentUrl);
  
  return intent;
}

// Step 2: Monitor Time Lock Progress
async function monitorTimeLock(intentId: string) {
  const escrowOrder = await apiRequest(`/payment-intents/${intentId}/escrow`);
  
  const now = Date.now() / 1000;
  const deliveryDeadline = parseInt(escrowOrder.data.deliveryDeadline);
  const timeRemaining = deliveryDeadline - now;
  
  console.log('Time Lock Status:', {
    orderStatus: escrowOrder.data.orderStatus,
    deliveryDeadline: new Date(deliveryDeadline * 1000).toISOString(),
    timeRemaining: timeRemaining > 0 ? `${Math.round(timeRemaining / 3600)} hours` : 'Expired',
    autoReleaseEnabled: escrowOrder.data.autoReleaseOnProof,
    releaseType: escrowOrder.data.releaseType
  });

  return escrowOrder;
}

// Step 3: Optional Early Delivery Confirmation
async function submitEarlyDelivery(intentId: string, deliveryData: any) {
  // Even with time-lock, you can submit delivery proof early
  // Generate a simple hash for proof (in production, use proper hashing)
  const proofHash = '0x' + Buffer.from(JSON.stringify(deliveryData)).toString('hex').padStart(64, '0');

  const deliveryProof = await apiRequest(`/payment-intents/${intentId}/escrow/delivery-proof`, {
    method: 'POST',
    body: JSON.stringify({
      proofHash,
      proofURI: `https://project-delivery.example.com/${intentId}`,
      submittedBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f42318'
    }),
  });

  console.log('Early delivery submitted:', deliveryProof.id);
  console.log('Funds will be released immediately due to autoRelease=true');
  
  return deliveryProof;
}

// Step 4: Check Release Status
async function checkReleaseStatus(intentId: string) {
  const escrowOrder = await apiRequest(`/payment-intents/${intentId}/escrow`);
  
  console.log('Release Status:', {
    orderStatus: escrowOrder.data.orderStatus,
    settlementStatus: escrowOrder.data.settlementStatus,
    releasedAt: escrowOrder.data.releasedAt,
    settlementScheduledAt: escrowOrder.data.settlementScheduledAt
  });

  return escrowOrder;
}

// Complete Example Usage
async function runTimeLockedProject() {
  try {
    // 1. Create time-locked payment
    const intent = await createTimeLockedPayment();
    
    // 2. User completes payment
    console.log('Redirect user to:', intent.data.paymentUrl);
    
    // 3. Monitor progress over time
    console.log('\nMonitoring time lock...');
    await monitorTimeLock(intent.id);
    
    // 4. Simulate work progress and optional early delivery
    setTimeout(async () => {
      console.log('\nSubmitting early delivery...');
      await submitEarlyDelivery(intent.id, {
        projectFiles: ['website.zip', 'documentation.pdf'],
        completionDate: new Date().toISOString(),
        notes: 'Project completed ahead of schedule'
      });
      
      // Check final status
      setTimeout(async () => {
        await checkReleaseStatus(intent.id);
      }, 3000);
      
    }, 5000);
    
  } catch (error) {
    console.error('Error in time-locked project:', error);
  }
}

// Alternative: Subscription Payment Example
async function createSubscriptionPayment() {
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({
      amount: '99.99',
      currency: 'USDC',
      type: 'DELIVERY_VS_PAYMENT',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_subscription',
      description: 'Premium SaaS Subscription - Monthly',
      metadata: {
        subscriptionType: 'premium',
        billingCycle: 'monthly',
        userId: 'USER-123',
        planId: 'PLAN-PREMIUM'
      },
      deliveryPeriod: 2678400, // 31 days (monthly)
      autoRelease: true,
      expectedDeliveryHash: '0x0000000000000000000000000000000000000000000000000000000000000000'
    }),
  });

  console.log('Subscription payment created:', intent.id);
  console.log('Service period: 31 days');
  console.log('Auto-release date:', new Date(Date.now() + 2678400 * 1000).toISOString());
  
  return intent;
}

// Run examples
runTimeLockedProject();
```

## Python Example

```python
import requests
import time
from datetime import datetime, timedelta

API_KEY = 'sk_test_your_api_key'
BASE_URL = 'https://api.fmm.finternetlab.io/v1'

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

def create_consulting_contract():
    """Create time-locked payment for consulting services"""
    # 60-day consulting engagement
    delivery_period = 60 * 24 * 60 * 60  # 60 days in seconds
    
    intent_data = {
        'amount': '15000.00',
        'currency': 'USDC',
        'type': 'DELIVERY_VS_PAYMENT',
        'settlementMethod': 'OFF_RAMP_MOCK',
        'settlementDestination': 'bank_account_consulting',
        'description': 'Strategic Consulting Services - 60-day engagement',
        'metadata': {
            'serviceType': 'strategic_consulting',
            'duration': '60_days',
            'consultantId': 'CONSULTANT-789',
            'clientId': 'CLIENT-456',
            'scope': 'business_strategy_analysis'
        },
        'deliveryPeriod': delivery_period,
        'autoRelease': True,
        'expectedDeliveryHash': '0x0000000000000000000000000000000000000000000000000000000000000000'
    }
    
    intent = api_request('/payment-intents', 'POST', intent_data)
    
    release_date = datetime.now() + timedelta(seconds=delivery_period)
    print(f'Consulting contract created: {intent["id"]}')
    print(f'Auto-release date: {release_date.isoformat()}')
    
    return intent

def create_rental_payment():
    """Create time-locked payment for equipment rental"""
    # 7-day equipment rental
    rental_period = 7 * 24 * 60 * 60  # 7 days in seconds
    
    intent_data = {
        'amount': '500.00',
        'currency': 'USDC',
        'type': 'DELIVERY_VS_PAYMENT',
        'settlementMethod': 'OFF_RAMP_MOCK',
        'settlementDestination': 'bank_account_rental',
        'description': 'Camera Equipment Rental - 7 days',
        'metadata': {
            'rentalType': 'camera_equipment',
            'duration': '7_days',
            'equipmentId': 'CAM-SONY-001',
            'customerId': 'CUST-789'
        },
        'deliveryPeriod': rental_period,
        'autoRelease': True
    }
    
    intent = api_request('/payment-intents', 'POST', intent_data)
    
    return_date = datetime.now() + timedelta(seconds=rental_period)
    print(f'Rental payment created: {intent["id"]}')
    print(f'Equipment return deadline: {return_date.isoformat()}')
    
    return intent

def monitor_time_progress(intent_id):
    """Monitor time-based escrow progress"""
    escrow = api_request(f'/payment-intents/{intent_id}/escrow')
    
    delivery_deadline = int(escrow['data']['deliveryDeadline'])
    current_time = time.time()
    time_remaining = delivery_deadline - current_time
    
    print(f'\\nTime Lock Status for {intent_id}:')
    print(f'Order Status: {escrow["data"]["orderStatus"]}')
    print(f'Release Type: {escrow["data"]["releaseType"]}')
    print(f'Delivery Deadline: {datetime.fromtimestamp(delivery_deadline).isoformat()}')
    
    if time_remaining > 0:
        hours_remaining = int(time_remaining / 3600)
        print(f'Time Remaining: {hours_remaining} hours')
    else:
        print('Time lock has expired - funds should be released')
    
    return escrow

def submit_service_completion(intent_id, completion_data):
    """Submit service completion proof (optional for time-locked)"""
    import hashlib
    import json
    
    # Generate completion proof
    proof_data = {
        'completedAt': datetime.now().isoformat(),
        'deliverables': completion_data['deliverables'],
        'notes': completion_data.get('notes', ''),
        'clientApproval': completion_data.get('approved', False)
    }
    
    proof_hash = hashlib.sha256(
        json.dumps(proof_data, sort_keys=True).encode()
    ).hexdigest()
    
    delivery_request = {
        'proofHash': f'0x{proof_hash}',
        'proofURI': f'https://service-delivery.example.com/{intent_id}',
        'submittedBy': '0x742d35Cc6634C0532925a3b844Bc9e7595f42318'
    }
    
    result = api_request(
        f'/payment-intents/{intent_id}/escrow/delivery-proof',
        'POST',
        delivery_request
    )
    
    print(f'Service completion submitted: {result["id"]}')
    print('Funds will be released immediately due to autoRelease=true')
    
    return result

def track_multiple_contracts():
    """Track multiple time-locked contracts"""
    contracts = []
    
    # Create different types of time-locked payments
    consulting = create_consulting_contract()
    contracts.append(('Consulting', consulting['id']))
    
    time.sleep(1)
    
    rental = create_rental_payment()
    contracts.append(('Rental', rental['id']))
    
    # Monitor all contracts
    print('\\n' + '='*50)
    print('MONITORING ALL TIME-LOCKED CONTRACTS')
    print('='*50)
    
    for contract_type, intent_id in contracts:
        print(f'\\n--- {contract_type} Contract ---')
        monitor_time_progress(intent_id)
    
    return contracts

# Example usage
if __name__ == '__main__':
    # Track multiple time-locked contracts
    contracts = track_multiple_contracts()
    
    # Simulate early completion for consulting contract
    consulting_id = contracts[0][1]
    
    print('\\n' + '='*50)
    print('SIMULATING EARLY COMPLETION')
    print('='*50)
    
    completion_data = {
        'deliverables': [
            'strategic_analysis.pdf',
            'recommendations.docx',
            'implementation_plan.xlsx'
        ],
        'notes': 'Consulting engagement completed ahead of schedule',
        'approved': True
    }
    
    submit_service_completion(consulting_id, completion_data)
    
    # Check final status
    time.sleep(2)
    print('\\nFinal status check:')
    monitor_time_progress(consulting_id)
```

## Subscription Service Example

```typescript
// Recurring subscription with time-based auto-renewal
class SubscriptionManager {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.fmm.finternetlab.io/v1';
  }

  async createMonthlySubscription(userId: string, planId: string) {
    const subscriptionData = {
      amount: this.getPlanAmount(planId),
      currency: 'USDC',
      type: 'DELIVERY_VS_PAYMENT',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_saas',
      description: `${planId} Subscription - Monthly`,
      metadata: {
        userId,
        planId,
        subscriptionType: 'monthly',
        billingCycle: 'monthly',
        features: this.getPlanFeatures(planId)
      },
      deliveryPeriod: 2678400, // 31 days
      autoRelease: true
    };

    const intent = await this.apiRequest('/payment-intents', 'POST', subscriptionData);
    
    // Store subscription info
    await this.storeSubscription(userId, intent.id, planId);
    
    return intent;
  }

  async createAnnualSubscription(userId: string, planId: string) {
    const subscriptionData = {
      amount: this.getAnnualPlanAmount(planId),
      currency: 'USDC',
      type: 'DELIVERY_VS_PAYMENT',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_saas',
      description: `${planId} Subscription - Annual (20% discount)`,
      metadata: {
        userId,
        planId,
        subscriptionType: 'annual',
        billingCycle: 'annual',
        discount: '20%',
        features: this.getPlanFeatures(planId)
      },
      deliveryPeriod: 31536000, // 365 days
      autoRelease: true
    };

    const intent = await this.apiRequest('/payment-intents', 'POST', subscriptionData);
    
    await this.storeSubscription(userId, intent.id, planId);
    
    return intent;
  }

  private async apiRequest(endpoint: string, method: string = 'GET', data?: any) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'X-API-Key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  private getPlanAmount(planId: string): string {
    const plans = {
      'basic': '9.99',
      'premium': '29.99',
      'enterprise': '99.99'
    };
    return plans[planId] || '9.99';
  }

  private getAnnualPlanAmount(planId: string): string {
    const monthlyAmount = parseFloat(this.getPlanAmount(planId));
    const annualAmount = monthlyAmount * 12 * 0.8; // 20% discount
    return annualAmount.toFixed(2);
  }

  private getPlanFeatures(planId: string): string[] {
    const features = {
      'basic': ['5GB Storage', 'Email Support'],
      'premium': ['50GB Storage', 'Priority Support', 'Advanced Analytics'],
      'enterprise': ['Unlimited Storage', '24/7 Support', 'Custom Integrations']
    };
    return features[planId] || features['basic'];
  }

  private async storeSubscription(userId: string, intentId: string, planId: string) {
    // Store subscription details in your database
    console.log(`Stored subscription: User ${userId}, Intent ${intentId}, Plan ${planId}`);
  }
}

// Usage
const subscriptionManager = new SubscriptionManager(process.env.FINTERNET_API_KEY!);

// Create monthly subscription
subscriptionManager.createMonthlySubscription('user_123', 'premium')
  .then(intent => {
    console.log('Monthly subscription created:', intent.id);
    console.log('Payment URL:', intent.data.paymentUrl);
  });
```

## Key Features

### **Automatic Release**
- **Time-based triggers**: Funds automatically release after specified period
- **No manual intervention**: No need for delivery confirmation
- **Predictable timeline**: Clear expectations for payment release
- **Escrow protection**: Buyer still protected during the time period

### **Flexible Time Periods**
- **Short-term**: Hours or days for quick services
- **Medium-term**: Weeks for project work
- **Long-term**: Months for subscriptions or contracts
- **Custom periods**: Any duration based on service needs

### **Early Completion**
- **Optional delivery proof**: Can submit completion proof early
- **Immediate release**: Funds released immediately on proof submission
- **Quality assurance**: Proof of work even with time locks
- **Client satisfaction**: Early delivery demonstrates commitment

## Best Practices

### **Time Period Selection**
1. **Service duration + buffer**: Add 20-30% buffer to expected completion time
2. **Industry standards**: Follow common practices for your industry
3. **Client expectations**: Align with client's payment preferences
4. **Risk assessment**: Longer periods for higher-risk services

### **Service Delivery**
1. **Progress updates**: Regular communication during service period
2. **Milestone tracking**: Break long services into checkpoints
3. **Documentation**: Maintain records of work completed
4. **Client approval**: Seek approval even with automatic release

### **Risk Management**
1. **Dispute windows**: Allow time for dispute resolution
2. **Quality standards**: Maintain high service quality
3. **Communication**: Keep clients informed throughout process
4. **Backup plans**: Have contingencies for service delays

## Related Endpoints

- [Create Payment Intent](../api-reference/payment-intents/create.md)
- [Get Escrow Order](../api-reference/conditional-payments/get.md)
- [Submit Delivery Proof](../api-reference/conditional-payments/submit-delivery-proof.md)
- [Time-Based Payouts Guide](../guides/payment-flows/time-based-payouts.md)
