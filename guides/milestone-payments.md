# Milestone Payments

Milestone payments allow you to release funds incrementally as project phases are completed. This is ideal for long-term projects, freelance work, or any scenario where deliverables are completed in stages.

## How It Works

1. **Create Escrow Order**: Set `releaseType: "MILESTONE_LOCKED"`
2. **Define Milestones**: Create multiple milestones with specific amounts
3. **Complete Milestones**: Mark milestones as completed sequentially
4. **Automatic Release**: Funds are released as each milestone is completed

## Use Cases

- **Freelance Projects**: Release payment as features are delivered
- **Construction**: Pay for completed phases (foundation, framing, etc.)
- **Software Development**: Release funds for MVP, beta, and production
- **Consulting**: Pay for completed deliverables or time periods
- **Content Creation**: Pay for drafts, revisions, and final delivery

## Creating Milestones

### Example: 3-Milestone Project

```typescript
// Milestone 0: Project kickoff (30%)
await createMilestone({
  milestoneIndex: 0,
  description: 'Project kickoff and planning - 30%',
  amount: '300.00',
  percentage: 30,
});

// Milestone 1: Mid-point delivery (50%)
await createMilestone({
  milestoneIndex: 1,
  description: 'Core features completed - 50%',
  amount: '500.00',
  percentage: 50,
});

// Milestone 2: Final delivery (20%)
await createMilestone({
  milestoneIndex: 2,
  description: 'Final delivery and documentation - 20%',
  amount: '200.00',
  percentage: 20,
});
```

### Milestone Best Practices

1. **Sequential Indexing**: Always use 0, 1, 2, ... in order
2. **Clear Descriptions**: Make it obvious what completion means
3. **Reasonable Amounts**: Don't create too many tiny milestones
4. **Total Check**: Ensure milestone amounts don't exceed order total

## Completing Milestones

Milestones must be completed in order:

```typescript
// Step 1: Complete milestone 0
await completeMilestone(milestone0Id, {
  completedBy: merchantAddress,
  completionProof: proofHash,
});

// Step 2: Wait for release (automatic if autoReleaseOnProof is true)
// Check order status...

// Step 3: Complete milestone 1
await completeMilestone(milestone1Id, {
  completedBy: merchantAddress,
  completionProof: proofHash,
});
```

## Completion Proof

Provide verifiable proof of milestone completion:

```typescript
import { ethers } from 'ethers';

const completionData = {
  milestoneIndex: 0,
  completedAt: new Date().toISOString(),
  deliverables: [
    'Feature A implemented',
    'Feature B tested',
    'Documentation updated',
  ],
  signedBy: merchantAddress,
};

const proofHash = ethers.keccak256(
  ethers.toUtf8Bytes(JSON.stringify(completionData))
);
```

## Automatic Release

If `autoReleaseOnProof` is enabled:

1. Milestone marked as completed
2. Funds automatically released to merchant
3. Settlement scheduled for off-ramp
4. Next milestone becomes available

## Complete Example

```typescript
// 1. Create payment intent with milestone release type
const intent = await createPaymentIntent({
  amount: '1000.00',
  currency: 'USDC',
  type: 'DELIVERY_VS_PAYMENT',
  settlementMethod: 'OFF_RAMP_MOCK',
  settlementDestination: 'bank_account_123',
  metadata: {
    releaseType: 'MILESTONE_LOCKED',
    autoRelease: true,
  },
});

// 2. Create milestones
const milestones = [
  { milestoneIndex: 0, amount: '300.00', description: 'Kickoff - 30%' },
  { milestoneIndex: 1, amount: '500.00', description: 'Mid-point - 50%' },
  { milestoneIndex: 2, amount: '200.00', description: 'Final - 20%' },
];

for (const milestone of milestones) {
  await createMilestone(intent.id, milestone);
}

// 3. As project progresses, complete milestones
await completeMilestone(milestone0Id, {
  completedBy: merchantAddress,
  completionProof: generateProof('Milestone 0 deliverables'),
});

// Funds are automatically released!
```

## Status Tracking

Monitor milestone status:

```typescript
const escrowOrder = await getEscrowOrder(intentId);
const milestones = escrowOrder.milestones;

milestones.forEach((milestone) => {
  console.log(`Milestone ${milestone.milestoneIndex}: ${milestone.status}`);
  // PENDING, COMPLETED, or RELEASED
});
```

## Common Patterns

### 50/50 Split

```typescript
[
  { milestoneIndex: 0, amount: '500.00', description: '50% upfront' },
  { milestoneIndex: 1, amount: '500.00', description: '50% on completion' },
]
```

### 30/40/30 Pattern

```typescript
[
  { milestoneIndex: 0, amount: '300.00', description: '30% start' },
  { milestoneIndex: 1, amount: '400.00', description: '40% mid-point' },
  { milestoneIndex: 2, amount: '300.00', description: '30% final' },
]
```

### Equal Quarters

```typescript
[
  { milestoneIndex: 0, amount: '250.00', description: '25% - Phase 1' },
  { milestoneIndex: 1, amount: '250.00', description: '25% - Phase 2' },
  { milestoneIndex: 2, amount: '250.00', description: '25% - Phase 3' },
  { milestoneIndex: 3, amount: '250.00', description: '25% - Phase 4' },
]
```

## Error Handling

### Previous Milestone Not Completed

```typescript
try {
  await completeMilestone(milestone2Id, {...});
} catch (error) {
  if (error.code === 'invalid_request') {
    // Complete milestone 1 first
    await completeMilestone(milestone1Id, {...});
  }
}
```

### Milestone Already Released

```typescript
const milestone = await getMilestone(milestoneId);
if (milestone.status === 'RELEASED') {
  console.log('Milestone already released, funds sent');
}
```

## Related

- [Create Milestone](api-reference/milestones/create.md)
- [Complete Milestone](api-reference/milestones/complete.md)
- [Escrow Orders](concepts/escrow-orders.md)
- [Time-Based Payouts](time-based-payouts.md)
