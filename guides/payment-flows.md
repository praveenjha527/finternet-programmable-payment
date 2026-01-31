# Payment Flows

This guide explains the different payment flows available in Finternet and when to use each one.

## Payment Types Overview

Finternet supports programmable payments with escrow protection:

1. **DELIVERY_VS_PAYMENT** - Escrow-based payment with delivery verification

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

## Benefits of DELIVERY_VS_PAYMENT

- ✅ Enhanced security with escrow protection
- ✅ Buyer protection through fund locking
- ✅ Flexible release mechanisms
- ✅ Dispute resolution support
- ✅ Suitable for all transaction types

## Related

- [Delivery vs Payment](delivery-vs-payment.md)
- [Time-Based Payouts](time-based-payouts.md)
- [Milestone Payments](milestone-payments.md)
- [Payment Types](concepts/payment-types.md)
