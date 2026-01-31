# EIP-712 Signatures

Use EIP-712 structured data signatures to authorize conditional payments.

## Why EIP-712

EIP-712 provides a consistent format for signing structured data, allowing wallets to display clear intent and reducing phishing risk.

## Typical Flow

1. Create a payment intent and receive `typedData`.
2. Ask the payer to sign the typed data using their wallet.
3. Submit the signature to the confirm endpoint.

## Example (JavaScript)

```typescript
const signature = await wallet.signTypedData(typedData.domain, typedData.types, typedData.message);
await apiRequest('/payment-intents/confirm', {
  signature,
  payerAddress,
});
```

## Next Steps

- 📖 Review [Confirm Payment Intent](../api-reference/payment-intents/confirm.md)
