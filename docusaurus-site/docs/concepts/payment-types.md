# Payment Types

Finternet supports multiple payment types, each designed for different use cases. Choose the right type based on your business needs.

## Overview

| Type | Use Case | Escrow | Settlement Timing |
|------|----------|--------|-------------------|
| **Consented Pull** | Standard payments | No | Immediate after confirmation |
| **Delivery vs Payment** | Goods/services delivery | Yes | After delivery proof or time lock |

## Consented Pull

**Best for:** Standard payments where funds are released immediately after blockchain confirmation.

### Characteristics

- ✅ Simple payment flow
- ✅ Funds released immediately after confirmation
- ✅ No escrow required
- ✅ Fastest settlement

### Flow

```
1. Create payment intent
2. Payer signs and executes transaction
3. Transaction confirmed (5+ blocks)
4. Funds immediately available for settlement
5. Settlement processed
```

### Example

```bash
curl https://api.finternet.com/v1/payment-intents \
  -H "X-API-Key: sk_test_your_key" \
  -X POST \
  -d '{
    "amount": "100.00",
    "currency": "USDC",
    "type": "CONSENTED_PULL",
    "settlementMethod": "OFF_RAMP_MOCK",
    "settlementDestination": "bank_account_123"
  }'
```

### When to Use

- Digital products
- Services delivered immediately
- Subscription payments
- Donations
- Any payment where delivery is instant

## Delivery vs Payment (DvP)

**Best for:** Physical goods or services that require delivery verification before funds are released.

### Characteristics

- ✅ Funds held in escrow
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

## Comparison

### Consented Pull vs Delivery vs Payment

| Feature | Consented Pull | Delivery vs Payment |
|---------|----------------|---------------------|
| **Escrow** | No | Yes |
| **Release Timing** | Immediate | On delivery/time/milestone |
| **Dispute Support** | Limited | Full support |
| **Complexity** | Simple | More complex |
| **Use Cases** | Digital, instant | Physical, services |
| **Settlement Speed** | Fastest | Depends on release type |

## Choosing the Right Type

### Use Consented Pull if:
- ✅ Product/service is delivered instantly
- ✅ No delivery verification needed
- ✅ You want fastest settlement
- ✅ Simple payment flow

### Use Delivery vs Payment if:
- ✅ Physical goods need shipping
- ✅ Services require completion verification
- ✅ You need escrow protection
- ✅ You want milestone-based payments
- ✅ You need dispute resolution

## Next Steps

- 📖 Learn about [Delivery vs Payment](guides/delivery-vs-payment.md) in detail
- ⏱️ Explore [Time-Based Payouts](guides/time-based-payouts.md)
- 🎯 Read about [Milestone Payments](guides/milestone-payments.md)
- 📚 Check the [API Reference](../api-reference/payment-intents/create.md)
