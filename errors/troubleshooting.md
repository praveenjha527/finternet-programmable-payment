# Troubleshooting

Common issues and solutions when integrating with the Finternet API.

## Authentication Issues

### Invalid API Key

**Error:**
```json
{
  "error": {
    "code": "forbidden",
    "message": "Invalid API key",
    "type": "authentication_error"
  }
}
```

**Solutions:**
1. Verify your API key is correct (no extra spaces or characters)
2. Check that you're using the correct environment key (`sk_test_` vs `sk_live_`)
3. Ensure the API key is included in the `X-API-Key` header
4. Verify the API key hasn't been revoked or rotated

### Missing API Key

**Error:**
```json
{
  "error": {
    "code": "authentication_required",
    "message": "API key is required",
    "type": "authentication_error"
  }
}
```

**Solutions:**
1. Add the `X-API-Key` header to your request
2. Check environment variables are loaded correctly
3. Verify API key is not empty or undefined

## Payment Intent Issues

### Invalid State Transition

**Error:**
```json
{
  "error": {
    "code": "invalid_state_transition",
    "message": "Cannot confirm payment intent in status: SUCCEEDED",
    "type": "invalid_request_error"
  }
}
```

**Solutions:**
1. Check the current payment intent status before attempting operations
2. Ensure you're following the correct state flow:
   - `INITIATED` → `PROCESSING` → `SUCCEEDED` → `SETTLED`
3. Don't try to confirm an already confirmed payment

### Signature Verification Failed

**Error:**
```json
{
  "error": {
    "code": "signature_verification_failed",
    "message": "Signature verification failed",
    "type": "invalid_request_error"
  }
}
```

**Solutions:**
1. Ensure you're using the correct `typedData` from the payment intent
2. Verify the signature is for the correct `payerAddress`
3. Check that you're using EIP-712 signing (not personal_sign)
4. Ensure the domain, types, and message match exactly
5. Verify the chain ID matches the network you're using

## Escrow Order Issues

### Invalid Order Status for Delivery Proof

**Error:**
```json
{
  "error": {
    "code": "invalid_status",
    "message": "Cannot submit delivery proof: order status is 2, must be Created (0)",
    "type": "invalid_request_error"
  }
}
```

**Solutions:**
1. Check the escrow order status before submitting delivery proof
2. Ensure the order is in `Created (0)` status
3. Verify the payment intent has been confirmed and funds are locked
4. Check the order lifecycle: `Created (0) → Delivered (2) → AwaitingSettlement (3) → Completed (4)`

### Delivery Proof Already Submitted

**Symptom:** Trying to submit delivery proof but order already has `actualDeliveryHash`

**Solutions:**
1. Check if delivery proof was already submitted
2. Retrieve the escrow order to see existing delivery proof
3. If proof needs to be updated, contact support

## Milestone Issues

### Previous Milestone Not Completed

**Error:**
```json
{
  "error": {
    "code": "invalid_request",
    "message": "Previous milestone (index 0) must be completed first",
    "type": "invalid_request_error"
  }
}
```

**Solutions:**
1. Complete milestones in sequential order (0, 1, 2, ...)
2. Check which milestones are already completed
3. Complete the previous milestone before moving to the next

### Milestone Amount Exceeds Order Total

**Error:**
```json
{
  "error": {
    "code": "invalid_request",
    "message": "Total milestone amounts exceed escrow order amount",
    "type": "invalid_request_error"
  }
}
```

**Solutions:**
1. Verify milestone amounts don't exceed the escrow order amount
2. Check that the sum of all milestone amounts equals the order amount
3. Adjust milestone amounts if needed

## Network Issues

### Connection Timeout

**Symptom:** Requests timeout or fail to connect

**Solutions:**
1. Check your internet connection
2. Verify the API base URL is correct: `https://api.finternet.com/v1`
3. Check for firewall or proxy issues
4. Try increasing request timeout
5. Implement retry logic with exponential backoff

### SSL Certificate Errors

**Symptom:** SSL/TLS certificate verification errors

**Solutions:**
1. Ensure your system's CA certificates are up to date
2. Verify you're using HTTPS (not HTTP) for production
3. Check system clock is synchronized
4. For development, you can temporarily disable SSL verification (not recommended for production)

## Rate Limiting

### Rate Limit Exceeded

**Error:**
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Retry after 60 seconds.",
    "type": "rate_limit_error"
  }
}
```

**Solutions:**
1. Implement exponential backoff retry logic
2. Reduce request frequency
3. Cache responses when possible
4. Use webhooks instead of polling
5. Consider upgrading to higher rate limits (contact support)

## Settlement Issues

### Settlement Failed

**Symptom:** Payment confirmed but settlement status shows `FAILED`

**Solutions:**
1. Check settlement destination is valid
2. Verify settlement method is correct
3. Check merchant account status
4. Review settlement logs for details
5. Contact support if issue persists

### Settlement Not Initiated

**Symptom:** Payment is `SUCCEEDED` but settlement hasn't started

**Solutions:**
1. Wait a few moments (settlement is asynchronous)
2. Check if settlement job is queued
3. Verify `settlementMethod` is set correctly
4. Ensure `settlementDestination` is provided

## Blockchain Issues

### Transaction Not Confirmed

**Symptom:** Payment stuck in `PROCESSING` status

**Solutions:**
1. Check blockchain transaction status directly
2. Verify transaction hash is correct
3. Check network congestion (may take longer during high traffic)
4. Ensure transaction has enough gas
5. Wait for required confirmations (5+)

### Wrong Network

**Symptom:** Transactions failing or not appearing

**Solutions:**
1. Verify you're connected to the correct network (Sepolia for test)
2. Check chain ID matches the payment intent
3. Ensure your wallet is on the correct network
4. Verify contract addresses match the network

## Common Integration Mistakes

### 1. Not Handling Errors

**Problem:** Errors crash the application

**Solution:** Always wrap API calls in try-catch blocks

```typescript
try {
  const intent = await apiRequest('/payment-intents', {...});
} catch (error) {
  // Handle error gracefully
  console.error('Payment creation failed:', error);
}
```

### 2. Not Polling for Status Updates

**Problem:** Payment status not updated in UI

**Solution:** Implement polling or use webhooks

```typescript
const pollStatus = setInterval(async () => {
  const intent = await apiRequest(`/payment-intents/${intentId}`);
  if (intent.data.status === 'SUCCEEDED') {
    clearInterval(pollStatus);
    updateUI(intent);
  }
}, 5000);
```

### 3. Hardcoding API Keys

**Problem:** API keys exposed in code

**Solution:** Use environment variables

```typescript
const API_KEY = process.env.FINTERNET_API_KEY; // ✅ Good
const API_KEY = 'sk_test_123...'; // ❌ Bad
```

### 4. Not Validating Responses

**Problem:** Assuming responses are always successful

**Solution:** Always check response status

```typescript
const response = await fetch(endpoint, options);
if (!response.ok) {
  const error = await response.json();
  throw error;
}
```

## Debugging Tips

### Enable Logging

Log all API requests and responses during development:

```typescript
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  console.log('Request:', endpoint, options);
  const response = await fetch(endpoint, options);
  const data = await response.json();
  console.log('Response:', data);
  return data;
}
```

### Check Request Headers

Verify headers are set correctly:

```typescript
console.log('Headers:', {
  'X-API-Key': API_KEY,
  'Content-Type': 'application/json',
});
```

### Validate Request Body

Ensure request body matches API requirements:

```typescript
const body = {
  amount: '100.00',
  currency: 'USDC',
  // ... other fields
};
console.log('Request body:', JSON.stringify(body, null, 2));
```

## Getting Help

If you're still experiencing issues:

1. **Check Documentation**: Review relevant guides and API reference
2. **Review Error Messages**: Error codes provide specific information
3. **Check Logs**: Review application and API logs for details
4. **Contact Support**: 
   - Email: support@finternet.com
   - Include: Error message, API key (test key), request details, response

## Related

- [Error Codes](error-codes.md)
- [API Reference](api-reference/introduction.md)
- [Getting Started](getting-started/overview.md)
