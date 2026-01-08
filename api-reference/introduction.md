# API Reference

Welcome to the Finternet Payment Gateway API reference. This section provides detailed documentation for all API endpoints, request parameters, and response formats.

## Base URL

All API requests should be made to:

```
https://api.finternet.com/v1
```

For testing and development, use:

```
http://localhost:3000/api/v1
```

## Authentication

All API requests require authentication using an API key. Include your API key in the request header:

```
X-API-Key: sk_test_your_key_here
```

See [Authentication](getting-started/authentication.md) for detailed information.

## Request Format

### Content-Type

All POST and PUT requests must include:

```
Content-Type: application/json
```

### Request Body

Request bodies should be JSON objects:

```json
{
  "amount": "100.00",
  "currency": "USDC",
  "type": "DELIVERY_VS_PAYMENT"
}
```

## Response Format

All API responses follow a consistent structure:

```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "SUCCEEDED",
  "data": {
    // Resource-specific data
  },
  "created": 1704067200,
  "updated": 1704067200
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the resource |
| `object` | string | Type of object (e.g., `payment_intent`) |
| `status` | string | Current status of the resource |
| `data` | object | Resource-specific data |
| `created` | integer | Unix timestamp of creation |
| `updated` | integer | Unix timestamp of last update |

## HTTP Status Codes

The API uses standard HTTP status codes:

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Missing or invalid API key |
| `403` | Forbidden - Access denied |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error |
| `503` | Service Unavailable |

## Error Responses

When an error occurs, the API returns an error object:

```json
{
  "error": {
    "code": "invalid_request",
    "message": "The amount must be greater than 0",
    "type": "invalid_request_error",
    "param": "amount"
  }
}
```

### Error Object Fields

| Field | Type | Description |
|-------|------|-------------|
| `code` | string | Machine-readable error code |
| `message` | string | Human-readable error message |
| `type` | string | Error type (e.g., `invalid_request_error`) |
| `param` | string | (Optional) Parameter that caused the error |

See [Error Codes](errors/error-codes.md) for a complete list of error codes.

## Rate Limits

API requests are subject to rate limits:

- **Test keys**: 100 requests per minute
- **Live keys**: 1000 requests per minute

Rate limit information is included in response headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067260
```

See [Rate Limits](resources/rate-limits.md) for more information.

## Pagination

List endpoints support pagination using `limit` and `starting_after` parameters:

```
GET /v1/payment-intents?limit=10&starting_after=intent_123
```

## Versioning

The API is versioned. The current version is `v1`. Include the version in the URL:

```
https://api.finternet.com/v1/payment-intents
```

## Idempotency

POST requests support idempotency keys to prevent duplicate operations:

```
Idempotency-Key: unique-key-here
```

If you retry a request with the same idempotency key within 24 hours, you'll receive the same response.

## Webhooks

Finternet can send webhooks to notify you of payment events. See [Webhooks](resources/webhooks.md) for setup and event types.

## Next Steps

- Browse [Payment Intents API](payment-intents/create.md)
- Explore [Escrow Orders API](escrow-orders/get.md)
- Check out [Code Examples](examples/quickstart.md)
