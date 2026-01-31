# Webhooks

Webhooks allow Finternet to notify your application of payment events in real-time.

## Overview

Instead of polling the API for payment status updates, webhooks send HTTP POST requests to your server when events occur.

## Supported Events

### Payment Intent Events

- `payment_intent.created` - Payment intent created
- `payment_intent.status_changed` - Payment status changed
- `payment_intent.blockchain_tx_submitted` - Transaction submitted to blockchain
- `payment_intent.blockchain_tx_confirmed` - Transaction confirmed (5+ confirmations)
- `payment_intent.settlement_initiated` - Settlement process started
- `payment_intent.settlement_completed` - Settlement completed

### Escrow Events

- `escrow_order.created` - Escrow order created
- `delivery_proof.submitted` - Delivery proof submitted
- `dispute.raised` - Dispute raised
- `dispute.resolved` - Dispute resolved
- `time_lock.released` - Time lock expired and funds released
- `milestone.completed` - Milestone marked as completed

## Webhook Payload

All webhooks follow this structure:

```json
{
  "id": "evt_2xYz9AbC123",
  "object": "event",
  "type": "payment_intent.status_changed",
  "data": {
    "object": {
      "id": "intent_2xYz9AbC123",
      "object": "payment_intent",
      "status": "SUCCEEDED",
      // ... full payment intent object
    }
  },
  "created": 1704067200
}
```

## Setting Up Webhooks

### 1. Create Webhook Endpoint

Create an HTTP endpoint that accepts POST requests:

```typescript
// Express.js example
app.post('/webhooks/finternet', express.raw({ type: 'application/json' }), (req, res) => {
  const event = JSON.parse(req.body);
  
  // Verify webhook signature
  const signature = req.headers['finternet-signature'];
  if (!verifySignature(req.body, signature)) {
    return res.status(400).send('Invalid signature');
  }
  
  // Handle event
  handleWebhookEvent(event);
  
  res.json({ received: true });
});
```

### 2. Verify Webhook Signature

Always verify webhook signatures to ensure requests are from Finternet:

```typescript
import crypto from 'crypto';

function verifySignature(payload: string, signature: string): boolean {
  const secret = process.env.FINTERNET_WEBHOOK_SECRET;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 3. Handle Events

Process events based on type:

```typescript
function handleWebhookEvent(event: WebhookEvent) {
  switch (event.type) {
    case 'payment_intent.status_changed':
      handleStatusChange(event.data.object);
      break;
    case 'payment_intent.settlement_completed':
      handleSettlementComplete(event.data.object);
      break;
    case 'delivery_proof.submitted':
      handleDeliveryProof(event.data.object);
      break;
    // ... handle other events
  }
}

function handleStatusChange(paymentIntent: PaymentIntent) {
  if (paymentIntent.status === 'SUCCEEDED') {
    // Payment confirmed, update order status
    updateOrderStatus(paymentIntent.metadata.orderId, 'paid');
  }
}
```

## Event Types

### payment_intent.status_changed

Triggered when payment intent status changes.

```json
{
  "type": "payment_intent.status_changed",
  "data": {
    "object": {
      "id": "intent_2xYz9AbC123",
      "status": "SUCCEEDED",
      "previous_status": "PROCESSING"
    }
  }
}
```

### payment_intent.settlement_completed

Triggered when settlement is completed.

```json
{
  "type": "payment_intent.settlement_completed",
  "data": {
    "object": {
      "id": "intent_2xYz9AbC123",
      "status": "SETTLED",
      "settlementStatus": "COMPLETED"
    }
  }
}
```

### delivery_proof.submitted

Triggered when delivery proof is submitted.

```json
{
  "type": "delivery_proof.submitted",
  "data": {
    "object": {
      "id": "delivery_proof_xyz789",
      "escrowOrderId": "escrow_order_abc123",
      "proofHash": "0xabcdef..."
    }
  }
}
```

## Best Practices

### Idempotency

Handle duplicate events gracefully:

```typescript
const processedEvents = new Set<string>();

function handleWebhookEvent(event: WebhookEvent) {
  if (processedEvents.has(event.id)) {
    console.log('Event already processed:', event.id);
    return;
  }
  
  // Process event
  processEvent(event);
  
  // Mark as processed
  processedEvents.add(event.id);
}
```

### Retry Logic

Webhooks are retried if your endpoint returns non-2xx status:

- Retry after 1 minute
- Retry after 5 minutes
- Retry after 30 minutes
- Retry after 2 hours
- Retry after 6 hours

Always return 200 OK immediately, then process asynchronously:

```typescript
app.post('/webhooks/finternet', (req, res) => {
  // Return immediately
  res.json({ received: true });
  
  // Process asynchronously
  processWebhookAsync(req.body);
});
```

### Security

- Always verify webhook signatures
- Use HTTPS for webhook endpoints
- Validate event structure
- Don't trust event data blindly

## Testing Webhooks

Use Finternet CLI or dashboard to send test webhooks:

```bash
finternet webhooks trigger payment_intent.status_changed \
  --payment-intent intent_2xYz9AbC123
```

## Related

- [API Reference](api-reference/introduction.md)
- [Payment Intents](concepts/payment-intents.md)
- [Status Lifecycle](concepts/status-lifecycle.md)
