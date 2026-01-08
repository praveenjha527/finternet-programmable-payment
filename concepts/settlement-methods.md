# Settlement Methods

Settlement methods determine how funds are converted from blockchain tokens to fiat currency and delivered to merchants.

## Available Methods

### OFF_RAMP_MOCK

Mock settlement for testing and development. Simulates bank gateway processing with configurable delays.

**Use Case:** Development, testing, demos

```typescript
{
  settlementMethod: 'OFF_RAMP_MOCK',
  settlementDestination: 'test_account_123',
}
```

**Behavior:**
- Simulates bank processing delay (default: 10 seconds)
- Generates mock transaction ID
- Updates payment intent status to `SETTLED`
- No actual funds transferred

### OFF_RAMP_TO_RTP

Real-Time Payment (RTP) settlement. Funds sent via RTP network for instant settlement.

**Use Case:** Production, real-time payments

```typescript
{
  settlementMethod: 'OFF_RAMP_TO_RTP',
  settlementDestination: 'rtp_account_123',
}
```

**Behavior:**
- Funds sent via RTP network
- Near-instant settlement
- Requires RTP account setup

### OFF_RAMP_TO_BANK

Traditional bank transfer settlement. Funds sent via ACH or wire transfer.

**Use Case:** Production, traditional banking

```typescript
{
  settlementMethod: 'OFF_RAMP_TO_BANK',
  settlementDestination: 'bank_account_123',
}
```

**Behavior:**
- Funds sent via bank transfer
- 1-3 business days processing
- Requires bank account verification

## Settlement Flow

### 1. Payment Confirmed

When payment is confirmed on blockchain:
- Payment intent status → `SUCCEEDED`
- Settlement status → `IN_PROGRESS`
- Settlement job enqueued

### 2. Settlement Processing

Background job processes settlement:
- Validates settlement method
- Executes off-ramp conversion
- Sends funds to destination
- Updates payment intent

### 3. Settlement Confirmed

After successful settlement:
- Payment intent status → `SETTLED`
- Settlement status → `COMPLETED`
- Funds available in merchant account

## Settlement Destination

The `settlementDestination` field identifies where funds should be sent:

- **Bank Account**: Account number or IBAN
- **RTP Account**: RTP network identifier
- **Test Account**: Mock account for testing

## Settlement Status

| Status | Description |
|--------|-------------|
| `PENDING` | Settlement not yet started |
| `IN_PROGRESS` | Settlement processing |
| `COMPLETED` | Settlement successful |
| `FAILED` | Settlement failed |

## Code Examples

### Create Payment with Settlement

```typescript
const intent = await createPaymentIntent({
  amount: '1000.00',
  currency: 'USDC',
  type: 'CONSENTED_PULL',
  settlementMethod: 'OFF_RAMP_MOCK',
  settlementDestination: 'bank_account_123',
});
```

### Check Settlement Status

```typescript
const intent = await getPaymentIntent(intentId);

console.log('Settlement Status:', intent.data.settlementStatus);
console.log('Payment Status:', intent.data.status);

if (intent.data.settlementStatus === 'COMPLETED') {
  console.log('Funds settled successfully!');
}
```

## Error Handling

### Settlement Failed

```typescript
const intent = await getPaymentIntent(intentId);

if (intent.data.settlementStatus === 'FAILED') {
  console.error('Settlement failed');
  // Retry or handle manually
}
```

## Best Practices

### Testing

- Use `OFF_RAMP_MOCK` for development
- Test all settlement flows before production
- Verify settlement destination format

### Production

- Use `OFF_RAMP_TO_RTP` for instant settlement
- Use `OFF_RAMP_TO_BANK` for traditional banking
- Verify bank account details before going live

### Monitoring

- Monitor settlement status
- Set up alerts for failed settlements
- Track settlement times

## Related

- [Payment Intents](payment-intents.md)
- [Status Lifecycle](status-lifecycle.md)
- [API Reference](api-reference/introduction.md)
