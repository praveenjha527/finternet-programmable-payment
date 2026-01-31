# Dispute Resolution

Disputes allow buyers or merchants to pause fund release when there's a disagreement about delivery, quality, or other aspects of the transaction.

## When to Raise a Dispute

### Buyer Disputes

- **Item not received**: Tracking shows delivered but item not received
- **Item damaged**: Product arrived damaged or defective
- **Not as described**: Item doesn't match the description
- **Wrong item**: Different item received than ordered

### Merchant Disputes

- **False non-delivery claim**: Buyer claims non-delivery but tracking confirms delivery
- **Fraudulent claim**: Suspected fraudulent dispute
- **Delivery proof rejected**: Buyer rejects valid delivery proof

## Raising a Dispute

```typescript
await raiseDispute(intentId, {
  reason: 'Item not delivered as described. Package was damaged upon arrival.',
  raisedBy: buyerAddress,
  disputeWindow: '604800', // 7 days
});
```

### Dispute Window

The dispute window determines how long the dispute can remain open:

- **1 day**: `86400` - Quick resolution for digital goods
- **3 days**: `259200` - Standard for most transactions
- **7 days**: `604800` - Default, good for physical goods
- **14 days**: `1209600` - Complex disputes
- **30 days**: `2592000` - High-value items

## Dispute Process

### 1. Dispute Raised

- Order status changes to `DISPUTED`
- Fund release is paused
- Dispute window starts counting down
- Timeout job is scheduled

### 2. Resolution Period

During the dispute window:
- Both parties can provide evidence
- Admin or oracle can review
- Manual resolution possible
- Automatic timeout if not resolved

### 3. Resolution Outcomes

- **MERCHANT_WON**: Merchant receives full payment
- **BUYER_WON**: Buyer receives full refund
- **PARTIAL_REFUND**: Partial refund to buyer, remainder to merchant

### 4. Automatic Timeout

If dispute window expires without resolution:
- Default action is taken (configurable)
- Usually favors buyer for consumer protection
- Funds are released or refunded accordingly

## Dispute Status

Check dispute status:

```typescript
const escrowOrder = await getEscrowOrder(intentId);

if (escrowOrder.orderStatus === 'DISPUTED') {
  console.log('Dispute raised at:', escrowOrder.disputeRaisedAt);
  console.log('Dispute reason:', escrowOrder.disputeReason);
  console.log('Raised by:', escrowOrder.disputeRaisedBy);
  console.log('Dispute window:', escrowOrder.disputeWindow);
}
```

## Best Practices

### For Buyers

- **Raise promptly**: Don't wait until deadline to dispute
- **Provide details**: Include photos, tracking info, descriptions
- **Be specific**: Clear reason helps resolution
- **Document everything**: Keep receipts, photos, communications

### For Merchants

- **Respond quickly**: Address disputes promptly
- **Provide evidence**: Shipping confirmations, tracking, delivery proof
- **Professional communication**: Clear, factual responses
- **Prevent disputes**: Accurate descriptions, good packaging, reliable shipping

### Dispute Reasons

**Good reasons:**
- ✅ "Item not delivered. Tracking shows delivered but package not received at address."
- ✅ "Item damaged upon arrival. Photos attached showing damage."
- ✅ "Item not as described. Received different model than ordered."

**Poor reasons:**
- ❌ "Bad" (too vague)
- ❌ "Didn't like it" (not a valid dispute reason)
- ❌ "Changed my mind" (not covered by dispute system)

## Code Examples

### Raise Dispute

```typescript
const dispute = await raiseDispute(intentId, {
  reason: 'Item not delivered. Tracking shows delivered on Jan 15, but package not received. Checked with neighbors and building management.',
  raisedBy: buyerAddress,
  disputeWindow: '604800', // 7 days
});

console.log('Dispute raised:', dispute.status);
```

### Check Dispute Status

```typescript
const order = await getEscrowOrder(intentId);

if (order.orderStatus === 'DISPUTED') {
  const disputeInfo = {
    raisedAt: new Date(parseInt(order.disputeRaisedAt) * 1000),
    reason: order.disputeReason,
    raisedBy: order.disputeRaisedBy,
    window: parseInt(order.disputeWindow),
  };

  const timeRemaining = disputeInfo.window - 
    (Math.floor(Date.now() / 1000) - parseInt(order.disputeRaisedAt));

  console.log(`Dispute: ${disputeInfo.reason}`);
  console.log(`Time remaining: ${timeRemaining} seconds`);
}
```

## Dispute Resolution Timeline

```
T+0:    Dispute raised
        Order status → DISPUTED
        Fund release paused

T+1d:   Evidence collection period
        Both parties provide documentation

T+3d:   Review period
        Admin/oracle reviews evidence

T+7d:   Dispute window expires
        Automatic resolution if not resolved
        Funds released or refunded
```

## Error Handling

### Dispute Already Raised

```typescript
try {
  await raiseDispute(intentId, {...});
} catch (error) {
  if (error.code === 'invalid_request') {
    console.log('Dispute already raised for this order');
    // Check existing dispute
    const order = await getEscrowOrder(intentId);
  }
}
```

### Invalid Order Status

```typescript
const order = await getEscrowOrder(intentId);

if (order.orderStatus === 'COMPLETED') {
  console.log('Cannot raise dispute: order already completed');
  // Disputes can only be raised before completion
}
```

## Related

- [Raise Dispute](api-reference/escrow-orders/raise-dispute.md)
- [Get Escrow Order](api-reference/escrow-orders/get.md)
- [Delivery vs Payment](delivery-vs-payment.md)
- [Escrow Orders](concepts/escrow-orders.md)
