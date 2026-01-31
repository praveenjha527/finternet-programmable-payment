# Your First Payment

This guide walks you through creating and processing your first payment with Finternet, from creation to settlement.

## Overview

We'll create a simple payment intent, confirm it, and track it through the complete lifecycle. This example uses a **Conditional Payment** type, which is the simplest payment flow.

## Step 1: Create a Payment Intent

A payment intent represents a request to collect payment from a payer. Let's create one:

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "type": "CONDITIONAL",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123",
    "description": "Order #12345"
  }'
```

**Response:**
```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "INITIATED",
  "data": {
    "id": "intent_2xYz9AbC123",
    "object": "payment_intent",
    "status": "INITIATED",
  "amount": "100.00",
  "currency": "USDC",
  "type": "CONDITIONAL",
  "settlementMethod": "OFF_RAMP_MOCK",
  "settlementDestination": "bank_account_123",
  "paymentUrl": "https://pay.finternet.com/?intent=intent_2xYz9AbC123",
  "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
  "typedData": {
    "types": {
      "EIP712Domain": [...],
      "ConditionalPayment": [...]
    },
    "domain": {...},
    "message": {...}
  },
  "phases": [
    {
      "phase": "SIGNATURE_VERIFICATION",
      "status": "IN_PROGRESS"
    }
  ],
    "created": 1704067200,
    "updated": 1704067200
  },
  "created": 1704067200,
  "updated": 1704067200
}
```

### What Happened?

1. ✅ Payment intent created with status `INITIATED`
2. ✅ **Frontend payment URL generated** - Available in `data.paymentUrl`
3. ✅ EIP-712 typed data generated for signature
4. ✅ Contract address assigned

### Using the Payment URL

**Important:** The response includes a `paymentUrl` in the `data` object. This is the URL where your users should complete the payment.

```typescript
const response = await apiRequest('/payment-intents', {...});
const paymentUrl = response.data.paymentUrl;

// Redirect user to payment page
window.location.href = paymentUrl;
```

The payment URL format is: `https://pay.finternet.com/?intent={intentId}`

## Step 2: Redirect User to Payment Page

After creating the payment intent, redirect your user to the `paymentUrl`:

```typescript
// After creating payment intent
const intent = await createPaymentIntent({...});

// Redirect user to payment page
window.location.href = intent.data.paymentUrl;
// or open in new tab
window.open(intent.data.paymentUrl, '_blank');
```

## Step 3: Payer Completes Payment

The payer visits the `paymentUrl` and:
1. Connects their wallet (MetaMask, WalletConnect, etc.)
2. Reviews payment details
3. Signs the EIP-712 message
4. Executes the blockchain transaction

**Note:** This step happens on the frontend. The payer's wallet executes the transaction directly on the blockchain. The frontend will automatically call the API to update the transaction hash.

## Step 4: Confirm the Payment

Once the payer has executed the transaction, confirm it with the signature and transaction hash:

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123/confirm \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "signature": "0x1234567890abcdef...",
    "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318"
  }'
```

**Response:**
```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "PROCESSING",
  "transactionHash": "0xabc123def456...",
  "phases": [
    {
      "phase": "SIGNATURE_VERIFICATION",
      "status": "COMPLETED"
    },
    {
      "phase": "BLOCKCHAIN_CONFIRMATION",
      "status": "IN_PROGRESS"
    }
  ],
  "updated": 1704067250
}
```

### What Happened?

1. ✅ Signature verified
2. ✅ Transaction submitted to blockchain
3. ✅ Status updated to `PROCESSING`
4. ✅ Blockchain confirmation phase started

## Step 5: Check Payment Status

Poll the payment intent to track blockchain confirmation:

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123 \
  -H "X-API-Key: sk_test_your_key_here"
```

**After 5+ confirmations:**
```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "SUCCEEDED",
  "transactionHash": "0xabc123def456...",
  "settlementStatus": "IN_PROGRESS",
  "phases": [
    {
      "phase": "BLOCKCHAIN_CONFIRMATION",
      "status": "COMPLETED"
    },
    {
      "phase": "SETTLEMENT",
      "status": "IN_PROGRESS"
    }
  ],
  "updated": 1704067300
}
```

### What Happened?

1. ✅ Blockchain transaction confirmed (5+ blocks)
2. ✅ Status updated to `SUCCEEDED`
3. ✅ Settlement process initiated
4. ✅ Merchant account credited

## Step 6: Settlement Completes

Settlement happens automatically in the background. Check status again:

```bash
curl https://api.finternet.com/v1/payment-intents/intent_2xYz9AbC123 \
  -H "X-API-Key: sk_test_your_key_here"
```

**After settlement:**
```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "SETTLED",
  "settlementStatus": "COMPLETED",
  "phases": [
    {
      "phase": "SETTLEMENT",
      "status": "COMPLETED"
    }
  ],
  "updated": 1704067400
}
```

### What Happened?

1. ✅ Funds converted from crypto to fiat
2. ✅ Funds sent to merchant's bank account
3. ✅ Status updated to `SETTLED`
4. ✅ Payment complete!

## Complete Flow Diagram

```mermaid
flowchart TD
  A[Create Intent<br/>Get paymentUrl] -->|INITIATED| B[Redirect user to paymentUrl]
  B --> C[Payer signs transaction<br/>on frontend]
  C -->|PROCESSING| D[Confirm payment<br/>(auto or manual)]
  D -->|SUCCEEDED| E[Blockchain confirmations (5+)]
  E -->|SETTLED| F[Settlement completed]
```

## Next Steps

- 🔒 Learn about [Delivery vs Payment](guides/delivery-vs-payment.md) for conditional payment transactions
- ⏱️ Explore [Time-Based Payouts](guides/time-based-payouts.md) for scheduled releases
- 🎯 Check out [Milestone Payments](guides/milestone-payments.md) for project-based payments
- 📚 Read the [API Reference](api-reference/introduction.md) for complete details

## Common Questions

**Q: How long does settlement take?**  
A: Settlement typically completes within 10-30 seconds for mock settlements. Real bank settlements may take 1-3 business days.

**Q: What if the transaction fails?**  
A: If the blockchain transaction fails, the payment intent status will be `REQUIRES_ACTION` and you can retry.

**Q: Can I cancel a payment?**  
A: Yes, you can cancel a payment intent in `INITIATED` or `REQUIRES_SIGNATURE` status.

**Q: How do I handle errors?**  
A: Check the [Error Handling](errors/error-codes.md) guide for all error codes and how to handle them.
