# Payment Types

Finternet supports programmable payments designed for secure transactions with conditional payment logic. Our payment system is built around Delivery vs Payment (DvP) to ensure both parties are protected.

## Overview

| Type | Use Case | Conditional Logic | Settlement Timing |
|------|----------|-------------------|-------------------|
| **Delivery vs Payment** | Goods/services delivery | Smart Module | After delivery proof or time lock |

## Conditional Payments (Smart Module)

Conditional payment logic in the Finternet provided Smart Module, creates a secure flow where the buyer’s funds are locked upfront, held safely while the required steps or checks are completed, and only released to the seller once all agreed conditions have been met.

### Characteristics

- ✅ Release on delivery proof
- ✅ Time based automatic release
- ✅ Milestone based release
- ✅ Recurring release based on ongoing conditions
- ✅ Release after verification checks
- ✅ Release triggered by buyer approval

## Delivery vs Payment (DvP)

**Best for:** Physical goods or services that require delivery verification before funds are released.

### Characteristics

- ✅ Funds held with conditional logic
- ✅ Release on delivery proof
- ✅ Time-based automatic release
- ✅ Milestone-based releases
- ✅ Dispute resolution support

### Release Types

DvP supports multiple release mechanisms:

#### 1. Delivery Proof Release

Funds released when merchant submits delivery proof:

```bash
# Create escrow order
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "type": "DELIVERY_VS_PAYMENT",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123",
    "metadata": {
      "releaseType": "DELIVERY_PROOF",
      "autoRelease": true
    }
  }'

# Submit delivery proof
curl https://api.finternet.com/v1/payment-intents/intent_xxx/escrow/delivery-proof \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "proofHash": "0x...",
    "proofURI": "https://example.com/proof",
    "submittedBy": "0x..."
  }'
```

#### 2. Time-Based Release

Funds automatically released after a specified time:

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "amount": "100.00",
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

#### 3. Milestone-Based Release

Funds released as project milestones are completed:

```bash
# Create milestone
curl https://api.finternet.com/v1/payment-intents/intent_xxx/escrow/milestones \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "milestoneIndex": 0,
    "amount": "50.00",
    "description": "Phase 1: Design"
  }'

# Complete milestone
curl https://api.finternet.com/v1/payment-intents/intent_xxx/escrow/milestones/milestone_xxx/complete \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "completedBy": "0x...",
    "completionProof": "proof_hash"
  }'
```

### Flow

```
1. Create payment intent (DvP type)
2. Payer signs and executes transaction
3. Transaction confirmed → Funds locked in escrow
4. Order status: Created (0)
5. Merchant submits delivery proof OR time expires OR milestone completed
6. Order status: Delivered (2) → AwaitingSettlement (3)
7. Settlement executed
8. Funds released to merchant
```

### When to Use

- Physical goods delivery
- Service contracts
- Project-based work
- Freelance services
- Any transaction requiring delivery verification


## Next Steps

- 📖 Learn about [Delivery vs Payment](guides/payment-flows/delivery-vs-payment.md) in detail
- ⏱️ Explore [Time-Based Payouts](guides/payment-flows/time-based-payouts.md)
- 🎯 Read about [Milestone Payments](guides/payment-flows/milestone-payments.md)
- 📚 Check the [API Reference](../api-reference/payment-intents/create.md)
