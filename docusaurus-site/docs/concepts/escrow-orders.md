# Escrow Orders

Escrow orders are the foundation of Delivery vs Payment (DvP) transactions. They lock funds in a smart contract until delivery conditions are met.

## What is an Escrow Order?

An escrow order is a smart contract-based agreement that:
- Locks buyer funds in a secure contract
- Releases funds only when delivery conditions are met
- Provides dispute resolution mechanisms
- Supports multiple release types (delivery proof, time-locked, milestones)

## Order Lifecycle

```
Created (0) → Delivered (2) → AwaitingSettlement (3) → Completed (4)
```

### Status Flow

1. **Created (0)**: Order created, funds locked in escrow
2. **Delivered (2)**: Delivery proof submitted, order marked as delivered
3. **AwaitingSettlement (3)**: Funds released to merchant's contract balance
4. **Completed (4)**: Settlement executed, funds sent to merchant's bank

## Release Types

### Delivery Proof (`DELIVERY_PROOF`)

Funds released when delivery proof is submitted:

```typescript
{
  releaseType: 'DELIVERY_PROOF',
  autoReleaseOnProof: true, // Auto-release on proof submission
}
```

### Time-Locked (`TIME_LOCKED`)

Funds released after a specific time:

```typescript
{
  releaseType: 'TIME_LOCKED',
  timeLockUntil: '1735689600', // Unix timestamp
}
```

### Milestone-Based (`MILESTONE_LOCKED`)

Funds released incrementally as milestones are completed:

```typescript
{
  releaseType: 'MILESTONE_LOCKED',
  // Milestones created separately
}
```

### Auto-Release (`AUTO_RELEASE`)

Automatic release when delivery proof is submitted:

```typescript
{
  releaseType: 'AUTO_RELEASE',
  autoReleaseOnProof: true,
}
```

## Order Status

| Status | Description |
|--------|-------------|
| `PENDING` | Order created, awaiting payment confirmation |
| `SHIPPED` | Order marked as shipped |
| `DELIVERED` | Delivery proof submitted |
| `COMPLETED` | Funds released and settlement completed |
| `CANCELLED` | Order cancelled |
| `DISPUTED` | Dispute raised, fund release paused |

## Settlement Status

| Status | Description |
|--------|-------------|
| `NONE` | No settlement initiated |
| `SCHEDULED` | Settlement job scheduled |
| `EXECUTED` | Settlement executed on-chain |
| `CONFIRMED` | Settlement confirmed with fiat transaction |
| `CANCELLED` | Settlement cancelled |

## Key Fields

### Delivery Information

- **deliveryPeriod**: Time window for delivery (seconds)
- **deliveryDeadline**: Unix timestamp deadline
- **expectedDeliveryHash**: Expected proof hash (optional)
- **actualDeliveryHash**: Actual proof hash (after submission)

### Release Configuration

- **releaseType**: How funds are released
- **autoReleaseOnProof**: Whether to auto-release on proof
- **timeLockUntil**: Timestamp for time-locked release

### Dispute Management

- **disputeWindow**: Time window for disputes (seconds)
- **disputeRaisedAt**: When dispute was raised
- **disputeReason**: Reason for dispute
- **disputeRaisedBy**: Address that raised dispute

## Creating Escrow Orders

Escrow orders are automatically created when you create a payment intent with type `DELIVERY_VS_PAYMENT`:

```typescript
const intent = await createPaymentIntent({
  amount: '1000.00',
  currency: 'USDC',
  type: 'DELIVERY_VS_PAYMENT', // Triggers escrow order creation
  settlementMethod: 'OFF_RAMP_MOCK',
  settlementDestination: 'bank_account_123',
  metadata: {
    deliveryPeriod: 2592000, // 30 days
    releaseType: 'DELIVERY_PROOF',
    autoRelease: true,
  },
});

// Escrow order is automatically created
const escrowOrder = await getEscrowOrder(intent.id);
```

## Retrieving Escrow Orders

```typescript
const escrowOrder = await getEscrowOrder(intentId);

console.log('Order ID:', escrowOrder.data.orderId);
console.log('Status:', escrowOrder.data.orderStatus);
console.log('Release Type:', escrowOrder.data.releaseType);
```

## Best Practices

### Delivery Period

- Set realistic deadlines based on shipping method
- Account for international shipping delays
- Consider item type (digital vs physical)

### Auto-Release

- Enable for trusted merchants and repeat customers
- Disable for high-value or high-risk transactions
- Balance convenience with buyer protection

### Dispute Window

- 7 days for most physical goods
- 1-3 days for digital goods
- 14-30 days for high-value items

## Related

- [Delivery vs Payment](guides/delivery-vs-payment.md)
- [Time-Based Payouts](guides/time-based-payouts.md)
- [Milestone Payments](guides/milestone-payments.md)
- [Dispute Resolution](guides/dispute-resolution.md)
