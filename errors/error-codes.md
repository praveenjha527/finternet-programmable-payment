# Error Codes

This document lists all error codes returned by the Finternet API.

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "type": "error_type",
    "param": "parameter_name" // Optional
  }
}
```

## Error Types

| Type | Description |
|------|-------------|
| `authentication_error` | Authentication or authorization failed |
| `invalid_request_error` | Invalid request parameters or state |
| `api_error` | Internal API error |
| `rate_limit_error` | Rate limit exceeded |

## Authentication Errors

### `authentication_required`

**Status Code:** `401 Unauthorized`

API key is missing from the request.

```json
{
  "error": {
    "code": "authentication_required",
    "message": "API key is required",
    "type": "authentication_error"
  }
}
```

### `forbidden`

**Status Code:** `403 Forbidden`

Invalid API key or access denied.

```json
{
  "error": {
    "code": "forbidden",
    "message": "Invalid API key",
    "type": "authentication_error"
  }
}
```

## Invalid Request Errors

### `invalid_request`

**Status Code:** `400 Bad Request`

General invalid request error.

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The request is invalid",
    "type": "invalid_request_error",
    "param": "amount"
  }
}
```

### `invalid_state_transition`

**Status Code:** `400 Bad Request`

Invalid state transition in payment intent lifecycle.

```json
{
  "error": {
    "code": "invalid_state_transition",
    "message": "Cannot confirm payment intent in status: SUCCEEDED",
    "type": "invalid_request_error"
  }
}
```

### `signature_verification_failed`

**Status Code:** `400 Bad Request`

EIP-712 signature verification failed.

```json
{
  "error": {
    "code": "signature_verification_failed",
    "message": "Signature verification failed",
    "type": "invalid_request_error"
  }
}
```

### `invalid_status`

**Status Code:** `400 Bad Request`

Invalid order or payment status for the requested operation.

```json
{
  "error": {
    "code": "invalid_status",
    "message": "Cannot submit delivery proof: order status is 2, must be Created (0)",
    "type": "invalid_request_error"
  }
}
```

### `resource_missing`

**Status Code:** `404 Not Found`

Requested resource not found.

```json
{
  "error": {
    "code": "resource_missing",
    "message": "Payment intent not found: intent_2xYz9AbC123",
    "type": "invalid_request_error"
  }
}
```

## API Errors

### `contract_execution_failed`

**Status Code:** `500 Internal Server Error`

Blockchain contract execution failed.

```json
{
  "error": {
    "code": "contract_execution_failed",
    "message": "Failed to execute contract function",
    "type": "api_error"
  }
}
```

### `settlement_failed`

**Status Code:** `500 Internal Server Error`

Settlement processing failed.

```json
{
  "error": {
    "code": "settlement_failed",
    "message": "Settlement processing failed",
    "type": "api_error"
  }
}
```

## Rate Limit Errors

### `rate_limit_exceeded`

**Status Code:** `429 Too Many Requests`

Rate limit exceeded.

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Retry after 60 seconds.",
    "type": "rate_limit_error"
  }
}
```

## Handling Errors

### JavaScript/TypeScript

```typescript
try {
  const intent = await finternet.paymentIntents.create({...});
} catch (error) {
  switch (error.code) {
    case 'authentication_required':
      console.error('API key missing');
      break;
    case 'forbidden':
      console.error('Invalid API key');
      break;
    case 'invalid_request':
      console.error('Invalid request:', error.param);
      break;
    case 'rate_limit_exceeded':
      console.error('Rate limit exceeded, retry after:', error.retryAfter);
      break;
    default:
      console.error('Unexpected error:', error);
  }
}
```

### Python

```python
try:
    intent = finternet.payment_intents.create(...)
except FinternetError as e:
    if e.code == 'authentication_required':
        print('API key missing')
    elif e.code == 'forbidden':
        print('Invalid API key')
    elif e.code == 'invalid_request':
        print(f'Invalid request: {e.param}')
    elif e.code == 'rate_limit_exceeded':
        print(f'Rate limit exceeded, retry after: {e.retry_after}')
    else:
        print(f'Unexpected error: {e}')
```

## Error Code Reference

| Code | Status | Type | Description |
|------|--------|------|-------------|
| `authentication_required` | 401 | `authentication_error` | API key missing |
| `forbidden` | 403 | `authentication_error` | Invalid API key |
| `invalid_request` | 400 | `invalid_request_error` | Invalid request |
| `invalid_state_transition` | 400 | `invalid_request_error` | Invalid state transition |
| `signature_verification_failed` | 400 | `invalid_request_error` | Signature verification failed |
| `invalid_status` | 400 | `invalid_request_error` | Invalid status for operation |
| `resource_missing` | 404 | `invalid_request_error` | Resource not found |
| `contract_execution_failed` | 500 | `api_error` | Contract execution failed |
| `settlement_failed` | 500 | `api_error` | Settlement failed |
| `rate_limit_exceeded` | 429 | `rate_limit_error` | Rate limit exceeded |

## Related

- [Troubleshooting](troubleshooting.md)
- [API Reference](api-reference/introduction.md)
