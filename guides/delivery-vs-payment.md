# Delivery vs Payment (DvP)

Delivery vs Payment (DvP) is an escrow-based payment system that ensures funds are only released when delivery is confirmed. This protects both buyers and merchants by creating a trustless payment mechanism.

## How It Works

1. **Buyer Pays**: Funds are locked in an escrow smart contract
2. **Merchant Ships**: Order is marked as shipped
3. **Delivery Proof**: Merchant submits proof of delivery
4. **Automatic Release**: Funds are released to merchant (if auto-release enabled)
5. **Settlement**: Funds converted to fiat and sent to merchant's bank

## Order Lifecycle

```
Created (0) → Delivered (2) → AwaitingSettlement (3) → Completed (4)
```

### Status Flow

1. **Created (0)**: Order created, funds locked in escrow
2. **Delivered (2)**: Delivery proof submitted, order marked as delivered
3. **AwaitingSettlement (3)**: Funds released to merchant's contract balance
4. **Completed (4)**: Settlement executed, funds sent to merchant's bank

## Creating a DvP Payment

```typescript
const intent = await createPaymentIntent({
  amount: '1000.00',
  currency: 'USDC',
  type: 'DELIVERY_VS_PAYMENT',
  settlementMethod: 'OFF_RAMP_MOCK',
  settlementDestination: 'bank_account_123',
  metadata: {
    deliveryPeriod: 2592000, // 30 days
    autoRelease: true, // Auto-release on delivery proof
    expectedDeliveryHash: '0x0000...', // Optional
  },
});
```

## Submitting Delivery Proof

Once the item is delivered, submit proof:

```typescript
import { ethers } from 'ethers';

// Generate delivery proof hash
const deliveryData = {
  trackingNumber: 'TRACK123456',
  deliveredAt: new Date().toISOString(),
  recipient: 'John Doe',
  signature: 'signed_receipt',
};

const proofHash = ethers.keccak256(
  ethers.toUtf8Bytes(JSON.stringify(deliveryData))
);

// Submit delivery proof
await submitDeliveryProof(intentId, {
  proofHash,
  proofURI: 'https://example.com/delivery-proofs/12345',
  submittedBy: merchantAddress,
});
```

## Auto-Release Behavior

### With Auto-Release (`autoReleaseOnProof: true`)

1. Delivery proof submitted
2. Contract automatically releases funds
3. Order status → `AwaitingSettlement`
4. Settlement job automatically scheduled
5. Funds sent to merchant's bank

### Without Auto-Release (`autoReleaseOnProof: false`)

1. Delivery proof submitted
2. Order status → `Delivered`
3. Manual release required
4. Settlement scheduled after manual release

## Delivery Proof Requirements

### Valid Proof Hash

- Must be a `bytes32` hash (64 hex characters)
- Should hash verifiable delivery data
- Can include tracking numbers, signatures, timestamps

### Proof URI

Optional URI where proof can be accessed:
- IPFS hash: `ipfs://Qm...`
- HTTP URL: `https://example.com/proofs/12345`
- Storage service: `s3://bucket/proof.pdf`

## Complete Flow Example

```typescript
// 1. Create payment intent
const intent = await createPaymentIntent({
  amount: '500.00',
  currency: 'USDC',
  type: 'DELIVERY_VS_PAYMENT',
  settlementMethod: 'OFF_RAMP_MOCK',
  settlementDestination: 'bank_account_123',
  metadata: {
    deliveryPeriod: 2592000, // 30 days
    autoRelease: true,
  },
});

// 2. Buyer confirms payment (frontend)
// ... wallet connection and transaction execution ...

// 3. Confirm payment intent
await confirmPaymentIntent(intent.id, {
  signature: eip712Signature,
  payerAddress: buyerAddress,
});

// 4. Wait for blockchain confirmation
// Poll getPaymentIntent() until status is SUCCEEDED

// 5. Merchant ships item
// ... shipping process ...

// 6. Submit delivery proof
const deliveryProof = await submitDeliveryProof(intent.id, {
  proofHash: generateDeliveryProofHash(),
  proofURI: 'https://example.com/delivery-proofs/12345',
  submittedBy: merchantAddress,
});

// 7. Funds automatically released (if autoReleaseOnProof is true)
// Settlement automatically scheduled
// Funds sent to merchant's bank account
```

## Status Tracking

Monitor the order status throughout the process:

```typescript
const escrowOrder = await getEscrowOrder(intentId);

console.log('Order Status:', escrowOrder.orderStatus);
// PENDING → SHIPPED → DELIVERED → COMPLETED

console.log('Settlement Status:', escrowOrder.settlementStatus);
// NONE → SCHEDULED → EXECUTED → CONFIRMED
```

## Dispute Handling

If there's an issue with delivery:

```typescript
await raiseDispute(intentId, {
  reason: 'Item not delivered as described',
  raisedBy: buyerAddress,
  disputeWindow: '604800', // 7 days
});
```

Disputes pause fund release until resolved. See [Dispute Resolution](dispute-resolution.md) for details.

## Best Practices

### Delivery Proof

- **Hash verifiable data**: Include tracking numbers, timestamps, signatures
- **Store proof externally**: Use IPFS or cloud storage for proof documents
- **Submit promptly**: Submit proof as soon as delivery is confirmed
- **Include metadata**: Add context like recipient name, delivery address

### Auto-Release

- **Enable for trusted merchants**: Use auto-release for established relationships
- **Disable for high-value items**: Manual review for expensive purchases
- **Consider buyer protection**: Balance merchant convenience with buyer security

### Delivery Period

- **Set realistic deadlines**: Account for shipping time and potential delays
- **Consider item type**: Digital goods need less time than physical shipping
- **International shipping**: Add buffer for cross-border deliveries

## Error Handling

### Invalid Order Status

```typescript
try {
  await submitDeliveryProof(intentId, {...});
} catch (error) {
  if (error.code === 'invalid_status') {
    // Order must be in Created (0) status
    // Check order status first
    const order = await getEscrowOrder(intentId);
    console.log('Current status:', order.orderStatus);
  }
}
```

### Delivery Proof Already Submitted

```typescript
const order = await getEscrowOrder(intentId);
if (order.actualDeliveryHash) {
  console.log('Delivery proof already submitted');
  // Check delivery proof details
}
```

## Related

- [Submit Delivery Proof](api-reference/escrow-orders/submit-delivery-proof.md)
- [Get Escrow Order](api-reference/escrow-orders/get.md)
- [Raise Dispute](api-reference/escrow-orders/raise-dispute.md)
- [Escrow Orders](concepts/escrow-orders.md)
