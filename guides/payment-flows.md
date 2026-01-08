# Payment Flows

This guide explains the different payment flows available in Finternet and when to use each one.

## Payment Types Overview

Finternet supports two main payment types:

1. **CONSENTED_PULL** - Standard payment with payer consent
2. **DELIVERY_VS_PAYMENT** - Escrow-based payment with delivery verification

## CONSENTED_PULL Flow

Simple payment flow for immediate transactions.

### When to Use

- Digital goods and services
- Immediate delivery
- Trusted merchant relationships
- Subscription payments
- One-time payments

### Flow Diagram

```
1. Create Payment Intent
   ↓
2. Buyer Signs & Confirms
   ↓
3. Blockchain Transaction
   ↓
4. Payment Confirmed (5+ confirmations)
   ↓
5. Settlement Initiated
   ↓
6. Funds Sent to Merchant
```

### Code Example

```typescript
// Create payment intent
const intent = await createPaymentIntent({
  amount: '100.00',
  currency: 'USDC',
  type: 'CONSENTED_PULL',
  settlementMethod: 'OFF_RAMP_MOCK',
  settlementDestination: 'bank_account_123',
});

// Buyer confirms payment
await confirmPaymentIntent(intent.id, {
  signature: eip712Signature,
  payerAddress: buyerAddress,
});

// Payment is confirmed and settled automatically
```

## DELIVERY_VS_PAYMENT Flow

Escrow-based payment with delivery verification.

### When to Use

- Physical goods
- High-value transactions
- New merchant relationships
- Custom delivery requirements
- Milestone-based projects

### Flow Diagram

```
1. Create Payment Intent (DvP)
   ↓
2. Escrow Order Created
   ↓
3. Buyer Pays (Funds Locked)
   ↓
4. Merchant Ships Item
   ↓
5. Delivery Proof Submitted
   ↓
6. Funds Released (Auto or Manual)
   ↓
7. Settlement Executed
```

### Release Types

#### Delivery Proof Release

```typescript
{
  releaseType: 'DELIVERY_PROOF',
  autoReleaseOnProof: true,
}
```

Funds released when delivery proof is submitted.

#### Time-Locked Release

```typescript
{
  releaseType: 'TIME_LOCKED',
  timeLockUntil: '1735689600',
}
```

Funds released after specified time period.

#### Milestone-Based Release

```typescript
{
  releaseType: 'MILESTONE_LOCKED',
}
```

Funds released incrementally as milestones are completed.

## Complete Flow Comparison

| Aspect | CONSENTED_PULL | DELIVERY_VS_PAYMENT |
|--------|----------------|---------------------|
| **Speed** | Immediate | Delayed (until delivery) |
| **Security** | Standard | Enhanced (escrow) |
| **Use Case** | Digital goods | Physical goods |
| **Buyer Protection** | Limited | High |
| **Merchant Risk** | Low | Low (funds locked) |
| **Settlement** | Immediate | After delivery proof |

## Choosing the Right Flow

### Use CONSENTED_PULL When:

- ✅ Selling digital products
- ✅ Providing immediate services
- ✅ Have established trust with buyers
- ✅ Need instant settlement
- ✅ Low-value transactions

### Use DELIVERY_VS_PAYMENT When:

- ✅ Selling physical goods
- ✅ High-value transactions
- ✅ New merchant relationships
- ✅ Need buyer protection
- ✅ Custom delivery requirements

## Hybrid Approaches

You can combine payment types for different scenarios:

### Subscription with Escrow

```typescript
// First payment: DvP for trust building
const firstPayment = await createPaymentIntent({
  type: 'DELIVERY_VS_PAYMENT',
  // ...
});

// Subsequent payments: Consented Pull for speed
const recurringPayment = await createPaymentIntent({
  type: 'CONSENTED_PULL',
  // ...
});
```

## Related

- [Delivery vs Payment](delivery-vs-payment.md)
- [Time-Based Payouts](time-based-payouts.md)
- [Milestone Payments](milestone-payments.md)
- [Payment Types](concepts/payment-types.md)
