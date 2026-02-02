---
sidebar_position: 4
---

# Process Payment (Web2 Flow)

Processes a payment with card details for Web2 payment flow. This endpoint handles fiat card payments, converts them to stablecoins via on-ramp, and creates escrow orders.

## Endpoint

```
POST /payment-intents/public/{intentId}/payment
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
  "card": {
    "cardNumber": "4242424242424242",
    "expiry": "12/25",
    "cvv": "123",
    "name": "John Doe",
    "addressLine1": "123 Main St",
    "addressLine2": "Apt 4B",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "US"
  }
}
```

## Card Details Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `cardNumber` | string | Yes | Card number (13-19 digits, spaces allowed) |
| `expiry` | string | Yes | Card expiry in MM/YY format |
| `cvv` | string | Yes | Card CVV (3-4 digits) |
| `name` | string | Yes | Cardholder name |
| `addressLine1` | string | No | Billing address line 1 |
| `addressLine2` | string | No | Billing address line 2 |
| `city` | string | No | City |
| `state` | string | No | State (2 characters for US) |
| `zipCode` | string | No | ZIP/Postal code |
| `country` | string | No | Country code (ISO 3166-1 alpha-2, 2 characters) |

## Response (200 OK)

Returns the updated payment intent with Web2 payment processing details.

```json
{
  "id": "intent_abc123xyz789",
  "object": "payment_intent",
  "status": "PROCESSING",
  "data": {
    "id": "intent_abc123xyz789",
    "object": "payment_intent",
    "status": "PROCESSING",
    "amount": "299.99",
    "currency": "USD",
    "type": "DELIVERY_VS_PAYMENT",
    "description": "Premium Headphones - Order #HD-789",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_456",
    "settlementStatus": "PENDING",
    "contractAddress": "0x319d975A5AAf7E5F5a6ae2CAbE5Ed418fE17E132",
    "chainId": 11155111,
    "fiatPaymentStatus": "succeeded",
    "paymentProcessorType": "mocked_stripe",
    "paymentProcessorTxId": "ch_abc123",
    "onRampStatus": "completed",
    "onRampTxId": "or_xyz789",
    "stablecoinAmount": "299.99",
    "stablecoinCurrency": "USDC",
    "phases": [
      {
        "phase": "SIGNATURE_VERIFICATION",
        "status": "COMPLETED"
      },
      {
        "phase": "ESCROW_LOCKED",
        "status": "IN_PROGRESS"
      }
    ],
    "metadata": {
      "productId": "HEADPHONES-001",
      "orderId": "HD-789",
      "customerId": "CUST-123"
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

## Payment Processing Flow

### 1. Card Payment Processing
- Card details are validated and processed via payment processor
- Payment is charged to the customer's card
- `fiatPaymentStatus` indicates success/failure

### 2. On-Ramp Conversion
- Fiat payment is converted to stablecoins via on-ramp service
- `onRampStatus` tracks conversion progress
- `stablecoinAmount` shows converted crypto amount

### 3. Escrow Creation
- Converted stablecoins are locked in escrow contract
- Escrow order is created for delivery protection
- Payment intent status updates to `PROCESSING`

## Response Fields

### Web2 Specific Fields

| Field | Type | Description |
|-------|------|-------------|
| `fiatPaymentStatus` | string | Status of fiat card payment (`pending`, `succeeded`, `failed`) |
| `paymentProcessorType` | string | Payment processor used (`mocked_stripe`, `stripe`, etc.) |
| `paymentProcessorTxId` | string | Transaction ID from payment processor |
| `onRampStatus` | string | On-ramp conversion status (`pending`, `completed`, `failed`) |
| `onRampTxId` | string | Transaction ID from on-ramp service |
| `stablecoinAmount` | string | Amount converted to stablecoins |
| `stablecoinCurrency` | string | Stablecoin currency (e.g., `USDC`) |

## Error Responses

### Invalid Card Details (400)

```json
{
  "object": "error",
  "type": "invalid_request_error",
  "code": "invalid_card",
  "message": "Your card number is invalid.",
  "param": "cardNumber"
}
```

### Payment Failed (400)

```json
{
  "object": "error",
  "type": "invalid_request_error",
  "code": "payment_failed",
  "message": "Your card was declined.",
  "param": "card"
}
```

### On-Ramp Failed (500)

```json
{
  "object": "error",
  "type": "invalid_request_error",
  "code": "on_ramp_failed",
  "message": "Failed to convert fiat to stablecoin. Please try again."
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

## Code Examples

### JavaScript/TypeScript

```typescript
async function processCardPayment(intentId: string, cardDetails: any) {
  const response = await fetch(
    `https://api.fmm.finternetlab.io/v1/payment-intents/public/${intentId}/payment`,
    {
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
          city: cardDetails.billing.city,
          state: cardDetails.billing.state,
          zipCode: cardDetails.billing.zipCode,
          country: cardDetails.billing.country
        }
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Payment failed: ${response.status}`);
  }

  const result = await response.json();
  console.log('Payment processed:', result.data.fiatPaymentStatus);
  console.log('On-ramp status:', result.data.onRampStatus);
  
  return result;
}
```

### Python

```python
import requests

def process_card_payment(intent_id, card_details):
    url = f'https://api.fmm.finternetlab.io/v1/payment-intents/public/{intent_id}/payment'
    
    payload = {
        'card': {
            'cardNumber': card_details['number'],
            'expiry': card_details['expiry'],
            'cvv': card_details['cvv'],
            'name': card_details['name'],
            'addressLine1': card_details['billing']['address'],
            'city': card_details['billing']['city'],
            'state': card_details['billing']['state'],
            'zipCode': card_details['billing']['zip'],
            'country': card_details['billing']['country']
        }
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    result = response.json()
    print(f'Payment status: {result["data"]["fiatPaymentStatus"]}')
    print(f'On-ramp status: {result["data"]["onRampStatus"]}')
    
    return result
```

### cURL

```bash
curl https://api.fmm.finternetlab.io/v1/payment-intents/public/intent_abc123xyz789/payment \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "card": {
      "cardNumber": "4242424242424242",
      "expiry": "12/25",
      "cvv": "123",
      "name": "John Doe",
      "addressLine1": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US"
    }
  }'
```

## Testing

### Test Card Numbers

| Card Number | Description |
|-------------|-------------|
| `4242424242424242` | Visa - Always succeeds |
| `4000000000000002` | Visa - Always declined |
| `4000000000009995` | Visa - Always fails with insufficient funds |
| `5555555555554444` | Mastercard - Always succeeds |

### Test Scenarios

1. **Successful Payment**: Use `4242424242424242` with any future expiry
2. **Declined Card**: Use `4000000000000002` to test decline handling
3. **Invalid Card**: Use invalid card number to test validation
4. **Expired Card**: Use past expiry date to test expiry validation

## Security Notes

- **PCI Compliance**: This endpoint must be used in PCI-compliant environments
- **HTTPS Required**: Always use HTTPS for card data transmission
- **No Storage**: Card details are not stored by the API
- **Tokenization**: Consider using payment processor tokenization for recurring payments

## Related Endpoints

- [Create Payment Intent](create.md)
- [Get Public Payment Intent](get-public.md)
- [Update Transaction Hash](update-transaction-hash.md)
- [Web2 Card Payments Guide](../../examples/web2-card-payments.md)
