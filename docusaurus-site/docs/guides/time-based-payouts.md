# Time-Based Payouts

Time-based payouts automatically release funds from escrow after a specified time period. This is ideal for subscriptions, retainers, or any scenario where funds should be released on a schedule.

## Overview

Time-based payouts use the **TIME_LOCKED** release type. When you create a payment intent with this release type, funds are automatically released to the merchant after the specified time lock expires.

## How It Works

```
1. Create payment intent with TIME_LOCKED release type
2. Payer executes transaction → Funds locked in escrow
3. System schedules automatic release job
4. Time lock expires → Funds automatically released
5. Settlement processed → Funds sent to merchant
```

## Creating a Time-Locked Payment

### Step 1: Create Payment Intent

Include `releaseType: "TIME_LOCKED"` and `timeLockUntil` in metadata:

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "amount": "1000.00",
    "currency": "USDC",
    "type": "DELIVERY_VS_PAYMENT",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123",
    "metadata": {
      "releaseType": "TIME_LOCKED",
      "timeLockUntil": "1735689600"
    }
  }'
```

### Step 2: Calculate Time Lock

`timeLockUntil` is a Unix timestamp (seconds since epoch). Calculate it:

**JavaScript/TypeScript:**
```typescript
// 30 days from now
const timeLockUntil = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);

// Or use a specific date
const releaseDate = new Date('2024-12-31');
const timeLockUntil = Math.floor(releaseDate.getTime() / 1000);
```

**Python:**
```python
import time
from datetime import datetime, timedelta

# 30 days from now
time_lock_until = int(time.time()) + (30 * 24 * 60 * 60)

# Or use a specific date
release_date = datetime(2024, 12, 31)
time_lock_until = int(release_date.timestamp())
```

### Step 3: Payment Confirmation

Once the payer confirms the payment, the time lock is active:

```bash
curl https://api.finternet.com/v1/payment-intents/intent_xxx/confirm \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "signature": "0x...",
    "payerAddress": "0x..."
  }'
```

## Automatic Release

When the time lock expires:

1. ✅ System automatically detects expiration
2. ✅ Verifies order status allows release
3. ✅ Executes settlement on-chain
4. ✅ Processes off-ramp settlement
5. ✅ Updates payment intent status to `SETTLED`

**No action required from you!** The system handles everything automatically.

## Order Status Requirements

For time-locked release to execute, the escrow order must be in one of these statuses:

- ✅ `DELIVERED` - Order has been delivered
- ✅ `SHIPPED` - Order has been shipped

If the order is still in `PENDING` or `CREATED` status, the release will wait until the order progresses.

## Example: Subscription Payment

Create a monthly subscription with automatic release:

```typescript
// Create payment intent for monthly subscription
const now = Math.floor(Date.now() / 1000);
const oneMonthFromNow = now + (30 * 24 * 60 * 60); // 30 days

const intent = await fetch('https://api.finternet.com/v1/payment-intents', {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.FINTERNET_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: '100.00',
    currency: 'USDC',
    type: 'DELIVERY_VS_PAYMENT',
    settlementMethod: 'OFF_RAMP_MOCK',
    settlementDestination: 'bank_account_123',
    metadata: {
      releaseType: 'TIME_LOCKED',
      timeLockUntil: oneMonthFromNow.toString(),
      subscriptionId: 'sub_123',
      billingPeriod: 'monthly',
    },
  }),
});
```

## Example: Retainer Payment

Release funds after project completion period:

```typescript
// Retainer: Release after 90 days
const now = Math.floor(Date.now() / 1000);
const ninetyDaysFromNow = now + (90 * 24 * 60 * 60);

const intent = await fetch('https://api.finternet.com/v1/payment-intents', {
  method: 'POST',
  headers: {
    'X-API-Key': process.env.FINTERNET_API_KEY,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    amount: '5000.00',
    currency: 'USDC',
    type: 'DELIVERY_VS_PAYMENT',
    settlementMethod: 'OFF_RAMP_MOCK',
    settlementDestination: 'bank_account_123',
    metadata: {
      releaseType: 'TIME_LOCKED',
      timeLockUntil: ninetyDaysFromNow.toString(),
      projectId: 'proj_456',
      retainerType: 'project_completion',
    },
  }),
});
```

## Checking Time Lock Status

Query the escrow order to see time lock details:

```bash
curl https://api.finternet.com/v1/payment-intents/intent_xxx/escrow \
  -H "X-API-Key: sk_test_your_key"
```

**Response:**
```json
{
  "id": "escrow_xxx",
  "object": "escrow_order",
  "releaseType": "TIME_LOCKED",
  "timeLockUntil": "1735689600",
  "orderStatus": "DELIVERED",
  "settlementStatus": "NONE"
}
```

## Time Lock Expiration

### Before Expiration

If you check before the time lock expires:

```json
{
  "orderStatus": "DELIVERED",
  "settlementStatus": "NONE",
  "releasedAt": null
}
```

### After Expiration

After the time lock expires and release executes:

```json
{
  "orderStatus": "COMPLETED",
  "settlementStatus": "EXECUTED",
  "releasedAt": "1735689600"
}
```

## Best Practices

### ✅ Do

- Calculate time locks accurately
- Use Unix timestamps (seconds, not milliseconds)
- Test with short time locks first (e.g., 1 minute)
- Monitor order status before time lock expires
- Handle time zone conversions correctly

### ❌ Don't

- Use past timestamps (will release immediately)
- Set time locks too short (may cause issues)
- Forget to account for time zones
- Rely solely on time locks (consider delivery proof for goods)

## Common Use Cases

### 1. Subscription Services
Release monthly subscription payments automatically after the billing period.

### 2. Retainers
Hold retainer funds and release after project completion period.

### 3. Escrow Services
Provide escrow services with automatic release after a grace period.

### 4. Milestone Payments
Combine with milestone payments for project-based work.

## Troubleshooting

### Time Lock Not Releasing

**Check:**
1. Order status is `DELIVERED` or `SHIPPED`
2. Time lock timestamp is in the past
3. Payment intent status allows release
4. Settlement destination is valid

### Immediate Release

If funds release immediately, check:
- `timeLockUntil` timestamp is in the past
- Time zone conversion is correct
- Timestamp format is Unix seconds (not milliseconds)

## Next Steps

- 📖 Learn about [Delivery vs Payment](delivery-vs-payment.md)
- 🎯 Explore [Milestone Payments](milestone-payments.md)
- 📚 Check the [API Reference](api-reference/escrow-orders.md)
