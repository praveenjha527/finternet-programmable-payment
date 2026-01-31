# Status & Lifecycle

Payment intents progress through a well-defined lifecycle with specific statuses. Understanding these statuses is crucial for building reliable integrations.

## Payment Intent Statuses

### INITIATED
**Description:** Payment intent has been created and is awaiting payer action.

**What happens:**
- Payment intent created via API
- EIP-712 typed data generated
- Payment URL created
- Payer can visit URL and complete payment

**Next status:** `REQUIRES_SIGNATURE` or `PROCESSING`

---

### REQUIRES_SIGNATURE
**Description:** Payment intent is waiting for payer signature.

**What happens:**
- Payer must sign the EIP-712 message
- Signature verification pending

**Next status:** `PROCESSING`

---

### PROCESSING
**Description:** Transaction has been submitted to the blockchain and is awaiting confirmation.

**What happens:**
- Signature verified
- Transaction submitted to blockchain
- Waiting for 5+ block confirmations
- Funds are not yet available

**Next status:** `SUCCEEDED` or `REQUIRES_ACTION`

---

### SUCCEEDED
**Description:** Blockchain transaction has been confirmed (5+ blocks).

**What happens:**
- Transaction confirmed on blockchain
- Funds are locked (for DvP) or available (for Consented Pull)
- Settlement process initiated
- Merchant account credited

**Next status:** `SETTLED` or `REQUIRES_ACTION`

---

### SETTLED
**Description:** Funds have been converted to fiat and sent to merchant account.

**What happens:**
- Settlement processed
- Funds converted from crypto to fiat
- Funds sent to merchant's bank account
- Payment complete

**Next status:** `FINAL` (optional)

---

### FINAL
**Description:** Payment is fully completed and no further actions are possible.

**What happens:**
- All phases completed
- All funds settled
- Payment closed

**Next status:** None (terminal state)

---

### CANCELED
**Description:** Payment intent has been canceled.

**What happens:**
- Payment canceled by merchant or system
- No funds transferred
- Cannot be reactivated

**Next status:** None (terminal state)

---

### REQUIRES_ACTION
**Description:** Payment requires manual intervention or retry.

**What happens:**
- Error occurred during processing
- Manual review may be needed
- Can be retried in some cases

**Next status:** Depends on the issue

## Status Transition Diagram

```
                    ┌─────────────┐
                    │  INITIATED  │
                    └──────┬──────┘
                           │
                           ▼
              ┌────────────────────────┐
              │ REQUIRES_SIGNATURE     │ (optional)
              └──────────┬─────────────┘
                         │
                         ▼
              ┌────────────────────────┐
              │    PROCESSING          │
              └──────────┬─────────────┘
                         │
            ┌────────────┴────────────┐
            │                         │
            ▼                         ▼
    ┌───────────────┐         ┌───────────────┐
    │   SUCCEEDED   │         │REQUIRES_ACTION│
    └───────┬───────┘         └───────────────┘
            │
            ▼
    ┌───────────────┐
    │    SETTLED    │
    └───────┬───────┘
            │
            ▼
    ┌───────────────┐
    │     FINAL     │ (optional)
    └───────────────┘

    ┌───────────────┐
    │   CANCELED    │ (can occur from any state)
    └───────────────┘
```

## Settlement Statuses

Separate from payment intent status, settlement has its own status:

| Status | Description |
|--------|-------------|
| `PENDING` | Settlement not yet started |
| `IN_PROGRESS` | Settlement processing |
| `COMPLETED` | Settlement successful |
| `FAILED` | Settlement failed |

## Phase Statuses

Each phase in the payment lifecycle has a status:

| Status | Description |
|--------|-------------|
| `IN_PROGRESS` | Phase is currently active |
| `COMPLETED` | Phase completed successfully |
| `FAILED` | Phase failed |

## Valid Transitions

### Allowed Transitions

```
INITIATED → REQUIRES_SIGNATURE → PROCESSING → SUCCEEDED → SETTLED → FINAL
INITIATED → PROCESSING → SUCCEEDED → SETTLED
Any state → CANCELED (if allowed)
Any state → REQUIRES_ACTION (on error)
```

### Invalid Transitions

These transitions will return `400 Bad Request` with error code `invalid_state_transition`:

- `SUCCEEDED` → `PROCESSING` ❌
- `SETTLED` → `SUCCEEDED` ❌
- `CANCELED` → `PROCESSING` ❌
- `FINAL` → any other status ❌

## Checking Status

### Polling

Poll the payment intent endpoint to check status:

```bash
curl https://api.finternet.com/v1/payment-intents/intent_xxx \
  -H "X-API-Key: sk_test_your_key"
```

### Recommended Polling Intervals

| Status | Polling Interval |
|--------|------------------|
| `INITIATED` | Every 5-10 seconds |
| `PROCESSING` | Every 2-5 seconds |
| `SUCCEEDED` | Every 10-30 seconds |
| `SETTLED` | Once (final check) |

### Webhooks (Recommended)

Instead of polling, use webhooks to receive status updates in real-time. See [Webhooks](resources/webhooks.md) for details.

## Status Examples

### Successful Payment Flow

```json
// Step 1: Created
{
  "status": "INITIATED",
  "phases": [
    { "phase": "SIGNATURE_VERIFICATION", "status": "IN_PROGRESS" }
  ]
}

// Step 2: Confirmed
{
  "status": "PROCESSING",
  "phases": [
    { "phase": "SIGNATURE_VERIFICATION", "status": "COMPLETED" },
    { "phase": "BLOCKCHAIN_CONFIRMATION", "status": "IN_PROGRESS" }
  ]
}

// Step 3: Confirmed on blockchain
{
  "status": "SUCCEEDED",
  "settlementStatus": "IN_PROGRESS",
  "phases": [
    { "phase": "BLOCKCHAIN_CONFIRMATION", "status": "COMPLETED" },
    { "phase": "SETTLEMENT", "status": "IN_PROGRESS" }
  ]
}

// Step 4: Settled
{
  "status": "SETTLED",
  "settlementStatus": "COMPLETED",
  "phases": [
    { "phase": "SETTLEMENT", "status": "COMPLETED" }
  ]
}
```

## Error States

### REQUIRES_ACTION

This status indicates an error that may require intervention:

**Common causes:**
- Blockchain transaction failed
- Settlement processing error
- Invalid signature
- Network issues

**What to do:**
1. Check the `phases` array for failed phases
2. Review error messages in metadata
3. Retry if applicable
4. Contact support if issue persists

## Best Practices

1. **Always check status** before taking action
2. **Handle all statuses** in your code
3. **Use webhooks** instead of aggressive polling
4. **Log status changes** for debugging
5. **Handle errors gracefully** with retry logic

## Next Steps

- 📖 Read about [Payment Intents](payment-intents.md)
- 🔄 Learn about [Webhooks](resources/webhooks.md)
- 📚 Check the [API Reference](api-reference/payment-intents.md)
