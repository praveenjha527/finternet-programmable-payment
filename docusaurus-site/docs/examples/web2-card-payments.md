# Web2 Card Payments

Complete example of implementing Web2 card-based payments that automatically convert to crypto and create escrow orders.

## Overview

The Web2 payment flow allows users to pay with traditional credit/debit cards while still benefiting from blockchain-based escrow protection. The system:

1. **Accepts card payments** via traditional payment processors
2. **Converts to stablecoins** through on-ramp services  
3. **Creates escrow orders** for delivery protection
4. **Settles to merchants** after delivery confirmation

This is ideal for:
- **E-commerce stores** wanting crypto benefits with familiar UX
- **Marketplace platforms** needing buyer protection
- **Service providers** requiring payment security
- **International transactions** with crypto settlement

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

// Step 1: Create Payment Intent for Card Payment
async function createCardPaymentIntent() {
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({
      amount: '299.99',
      currency: 'USD', // Fiat currency for card payment
      type: 'DELIVERY_VS_PAYMENT',
      settlementMethod: 'OFF_RAMP_MOCK',
      settlementDestination: 'bank_account_456',
      description: 'Premium Headphones - Order #HD-789',
      metadata: {
        productId: 'HEADPHONES-001',
        orderId: 'HD-789',
        customerId: 'CUST-123',
        shippingAddress: {
          street: '123 Main St',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'US'
        }
      },
      deliveryPeriod: 1209600, // 14 days for shipping
      autoRelease: true // Auto-release on delivery proof
    }),
  });

  console.log('Payment Intent Created:', intent.id);
  console.log('Payment URL:', intent.data.paymentUrl);
  
  return intent;
}

// Step 2: Process Card Payment (Public Endpoint)
async function processCardPayment(intentId: string, cardDetails: any) {
  // This would typically be called from your frontend
  const response = await fetch(`${BASE_URL}/payment-intents/public/${intentId}/payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      card: {
        cardNumber: cardDetails.cardNumber,
        expiry: cardDetails.expiry,
        cvv: cardDetails.cvv,
        name: cardDetails.name,
        addressLine1: cardDetails.billing.addressLine1,
        addressLine2: cardDetails.billing.addressLine2,
        city: cardDetails.billing.city,
        state: cardDetails.billing.state,
        zipCode: cardDetails.billing.zipCode,
        country: cardDetails.billing.country
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Payment failed: ${response.status}`);
  }

  const result = await response.json();
  console.log('Card payment processed:', result.data.fiatPaymentStatus);
  console.log('On-ramp status:', result.data.onRampStatus);
  console.log('Stablecoin amount:', result.data.stablecoinAmount, result.data.stablecoinCurrency);
  
  return result;
}

// Step 3: Monitor Payment Processing
async function monitorPaymentProgress(intentId: string) {
  const intent = await apiRequest(`/payment-intents/${intentId}`);
  
  console.log('Payment Status:', intent.data.status);
  console.log('Settlement Status:', intent.data.settlementStatus);
  
  // Check processing phases
  if (intent.data.phases) {
    console.log('Processing Phases:');
    intent.data.phases.forEach((phase: any) => {
      console.log(`  ${phase.phase}: ${phase.status}`);
    });
  }

  // Check Web2 specific fields
  if (intent.data.fiatPaymentStatus) {
    console.log('Fiat Payment:', intent.data.fiatPaymentStatus);
    console.log('Payment Processor:', intent.data.paymentProcessorType);
    console.log('Processor TX ID:', intent.data.paymentProcessorTxId);
  }

  if (intent.data.onRampStatus) {
    console.log('On-ramp Status:', intent.data.onRampStatus);
    console.log('On-ramp TX ID:', intent.data.onRampTxId);
    console.log('Converted Amount:', intent.data.stablecoinAmount, intent.data.stablecoinCurrency);
  }

  return intent;
}

// Step 4: Handle Delivery and Settlement
async function handleDelivery(intentId: string, trackingInfo: any) {
  // Submit delivery proof
  const deliveryProof = await apiRequest(`/payment-intents/${intentId}/escrow/delivery-proof`, {
    method: 'POST',
    body: JSON.stringify({
      proofHash: trackingInfo.deliveryHash,
      proofURI: `https://tracking.example.com/${trackingInfo.trackingNumber}`,
      submittedBy: '0x742d35Cc6634C0532925a3b844Bc9e7595f42318'
    }),
  });

  console.log('Delivery proof submitted:', deliveryProof.id);
  
  // Since autoRelease is true, funds will be automatically released
  // Monitor settlement
  setTimeout(async () => {
    const finalStatus = await monitorPaymentProgress(intentId);
    console.log('Final settlement status:', finalStatus.data.settlementStatus);
  }, 5000);

  return deliveryProof;
}

// Complete Example Usage
async function runCardPaymentFlow() {
  try {
    // 1. Create payment intent for card payment
    const intent = await createCardPaymentIntent();
    
    // 2. Simulate card payment (this would be done on frontend)
    const cardDetails = {
      cardNumber: '4242424242424242', // Test card
      expiry: '12/25',
      cvv: '123',
      name: 'John Doe',
      billing: {
        addressLine1: '123 Billing St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'US'
      }
    };

    const paymentResult = await processCardPayment(intent.id, cardDetails);
    
    // 3. Monitor payment processing
    console.log('\\nMonitoring payment processing...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    await monitorPaymentProgress(intent.id);
    
    // 4. Simulate delivery after some time
    setTimeout(async () => {
      console.log('\\nProcessing delivery...');
      const trackingInfo = {
        trackingNumber: 'TRK123456789',
        deliveryHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
      };
      
      await handleDelivery(intent.id, trackingInfo);
    }, 5000);
    
  } catch (error) {
    console.error('Error in card payment flow:', error);
  }
}

// Run the example
runCardPaymentFlow();
```

## Frontend Integration Example

```typescript
// Frontend component for card payment form
import React, { useState } from 'react';

interface CardPaymentFormProps {
  intentId: string;
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: any) => void;
}

export const CardPaymentForm: React.FC<CardPaymentFormProps> = ({
  intentId,
  onPaymentSuccess,
  onPaymentError
}) => {
  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'US'
  });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const response = await fetch(
        `https://api.fmm.finternetlab.io/v1/payment-intents/public/${intentId}/payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            card: cardData
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Payment failed');
      }

      const result = await response.json();
      onPaymentSuccess(result);
    } catch (error) {
      onPaymentError(error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-payment-form">
      <div className="form-group">
        <label>Card Number</label>
        <input
          type="text"
          value={cardData.cardNumber}
          onChange={(e) => setCardData({...cardData, cardNumber: e.target.value})}
          placeholder="4242 4242 4242 4242"
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Expiry</label>
          <input
            type="text"
            value={cardData.expiry}
            onChange={(e) => setCardData({...cardData, expiry: e.target.value})}
            placeholder="MM/YY"
            required
          />
        </div>
        <div className="form-group">
          <label>CVV</label>
          <input
            type="text"
            value={cardData.cvv}
            onChange={(e) => setCardData({...cardData, cvv: e.target.value})}
            placeholder="123"
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Cardholder Name</label>
        <input
          type="text"
          value={cardData.name}
          onChange={(e) => setCardData({...cardData, name: e.target.value})}
          placeholder="John Doe"
          required
        />
      </div>

      {/* Billing Address Fields */}
      <div className="form-group">
        <label>Address</label>
        <input
          type="text"
          value={cardData.addressLine1}
          onChange={(e) => setCardData({...cardData, addressLine1: e.target.value})}
          placeholder="123 Main St"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            value={cardData.city}
            onChange={(e) => setCardData({...cardData, city: e.target.value})}
            placeholder="New York"
          />
        </div>
        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            value={cardData.state}
            onChange={(e) => setCardData({...cardData, state: e.target.value})}
            placeholder="NY"
          />
        </div>
        <div className="form-group">
          <label>ZIP Code</label>
          <input
            type="text"
            value={cardData.zipCode}
            onChange={(e) => setCardData({...cardData, zipCode: e.target.value})}
            placeholder="10001"
          />
        </div>
      </div>

      <button type="submit" disabled={processing}>
        {processing ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};
```

## Python Example

```python
import requests
import time

API_KEY = 'sk_test_your_api_key'
BASE_URL = 'https://api.fmm.finternetlab.io/v1'

def api_request(endpoint, method='GET', data=None, public=False):
    url = f'{BASE_URL}{endpoint}'
    headers = {'Content-Type': 'application/json'}
    
    if not public:
        headers['X-API-Key'] = API_KEY
    
    if method == 'POST':
        response = requests.post(url, headers=headers, json=data)
    else:
        response = requests.get(url, headers=headers)
    
    response.raise_for_status()
    return response.json()

def create_ecommerce_payment():
    """Create payment intent for e-commerce order"""
    intent_data = {
        'amount': '149.99',
        'currency': 'USD',
        'type': 'DELIVERY_VS_PAYMENT',
        'settlementMethod': 'OFF_RAMP_MOCK',
        'settlementDestination': 'bank_account_789',
        'description': 'Wireless Bluetooth Speaker - Order #SPK-456',
        'metadata': {
            'productSku': 'SPK-BT-001',
            'orderId': 'SPK-456',
            'customerId': 'CUST-789',
            'category': 'electronics',
            'weight': '1.2kg'
        },
        'deliveryPeriod': 604800,  # 7 days
        'autoRelease': True
    }
    
    intent = api_request('/payment-intents', 'POST', intent_data)
    print(f'E-commerce order created: {intent["id"]}')
    return intent

def process_customer_payment(intent_id, customer_card):
    """Process customer's card payment"""
    payment_data = {
        'card': {
            'cardNumber': customer_card['number'],
            'expiry': customer_card['expiry'],
            'cvv': customer_card['cvv'],
            'name': customer_card['name'],
            'addressLine1': customer_card['billing']['address'],
            'city': customer_card['billing']['city'],
            'state': customer_card['billing']['state'],
            'zipCode': customer_card['billing']['zip'],
            'country': customer_card['billing']['country']
        }
    }
    
    # Use public endpoint (no API key required)
    result = api_request(
        f'/payment-intents/public/{intent_id}/payment',
        'POST',
        payment_data,
        public=True
    )
    
    print(f'Card payment status: {result["data"]["fiatPaymentStatus"]}')
    print(f'On-ramp conversion: {result["data"]["onRampStatus"]}')
    return result

def track_order_fulfillment(intent_id):
    """Track order through fulfillment"""
    print('\\nTracking order fulfillment...')
    
    # Check payment status
    intent = api_request(f'/payment-intents/{intent_id}')
    print(f'Payment Status: {intent["data"]["status"]}')
    
    if intent['data'].get('fiatPaymentStatus'):
        print(f'Card Payment: {intent["data"]["fiatPaymentStatus"]}')
        print(f'Crypto Conversion: {intent["data"]["onRampStatus"]}')
        print(f'Stablecoin Amount: {intent["data"]["stablecoinAmount"]} {intent["data"]["stablecoinCurrency"]}')
    
    return intent

def ship_and_deliver(intent_id, shipping_info):
    """Handle shipping and delivery confirmation"""
    print(f'\\nShipping order with tracking: {shipping_info["tracking_number"]}')
    
    # Simulate shipping time
    time.sleep(2)
    
    # Submit delivery proof
    delivery_data = {
        'proofHash': shipping_info['delivery_hash'],
        'proofURI': f'https://shipping.example.com/track/{shipping_info["tracking_number"]}',
        'submittedBy': '0x742d35Cc6634C0532925a3b844Bc9e7595f42318'
    }
    
    proof = api_request(
        f'/payment-intents/{intent_id}/escrow/delivery-proof',
        'POST',
        delivery_data
    )
    
    print(f'Delivery confirmed: {proof["id"]}')
    
    # Check final settlement
    time.sleep(3)
    final_status = api_request(f'/payment-intents/{intent_id}')
    print(f'Final Status: {final_status["data"]["status"]}')
    print(f'Settlement: {final_status["data"]["settlementStatus"]}')
    
    return proof

# Example usage
if __name__ == '__main__':
    # Create e-commerce order
    intent = create_ecommerce_payment()
    
    # Customer pays with card
    customer_card = {
        'number': '4242424242424242',
        'expiry': '12/25',
        'cvv': '123',
        'name': 'Jane Smith',
        'billing': {
            'address': '456 Customer Ave',
            'city': 'Los Angeles',
            'state': 'CA',
            'zip': '90210',
            'country': 'US'
        }
    }
    
    payment_result = process_customer_payment(intent['id'], customer_card)
    
    # Track fulfillment
    track_order_fulfillment(intent['id'])
    
    # Ship and deliver
    shipping_info = {
        'tracking_number': 'SHIP789012345',
        'delivery_hash': '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef'
    }
    
    ship_and_deliver(intent['id'], shipping_info)
    
    print('\\nE-commerce order completed successfully!')
```

## Key Features

### **Seamless UX**
- **Familiar payment flow**: Users pay with cards like any e-commerce site
- **No crypto knowledge required**: Backend handles all crypto conversions
- **Instant confirmation**: Immediate payment confirmation for better UX
- **Mobile optimized**: Works on all devices and payment methods

### **Automatic Conversion**
- **Fiat to crypto**: Automatic conversion from USD/EUR to USDC
- **Real-time rates**: Current exchange rates applied
- **Fee transparency**: Clear breakdown of conversion fees
- **Multiple currencies**: Support for various fiat currencies

### **Escrow Protection**
- **Buyer protection**: Funds held until delivery confirmation
- **Seller security**: Guaranteed payment upon delivery
- **Dispute resolution**: Built-in dispute handling
- **Automatic settlement**: Funds released automatically on delivery

## Best Practices

### **Payment Security**
1. **PCI compliance**: Ensure your frontend meets PCI DSS requirements
2. **HTTPS only**: Always use HTTPS for payment forms
3. **Input validation**: Validate all card data on frontend and backend
4. **Error handling**: Provide clear error messages for payment failures

### **User Experience**
1. **Progress indicators**: Show payment processing status
2. **Mobile optimization**: Ensure forms work well on mobile devices
3. **Auto-formatting**: Format card numbers and expiry dates automatically
4. **Save preferences**: Allow users to save billing information securely

### **Integration**
1. **Webhook handling**: Set up webhooks for payment status updates
2. **Retry logic**: Implement retry mechanisms for failed payments
3. **Monitoring**: Monitor payment success rates and failure reasons
4. **Testing**: Use test cards for development and staging

## Related Endpoints

- [Process Payment](../api-reference/payment-intents/process-payment)
- [Get Public Payment Intent](../api-reference/payment-intents/get-public)
- [Submit Delivery Proof](../api-reference/conditional-payments/submit-delivery-proof)
- [Payment Types Guide](../concepts/payment-types)
