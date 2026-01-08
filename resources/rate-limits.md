# Rate Limits

Finternet API enforces rate limits to ensure fair usage and system stability.

## Rate Limit Overview

Rate limits are applied per API key and are measured in requests per time window.

### Test Keys

- **100 requests per minute**
- **1,000 requests per hour**

### Live Keys

- **1,000 requests per minute**
- **10,000 requests per hour**

## Rate Limit Headers

Every API response includes rate limit information in the headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067260
```

### Header Fields

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum number of requests allowed in the current window |
| `X-RateLimit-Remaining` | Number of requests remaining in the current window |
| `X-RateLimit-Reset` | Unix timestamp when the rate limit window resets |

## Rate Limit Exceeded

When you exceed the rate limit, the API returns:

**Status Code:** `429 Too Many Requests`

```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Retry after 60 seconds.",
    "type": "rate_limit_error",
    "retryAfter": 60
  }
}
```

## Handling Rate Limits

### Exponential Backoff

Implement exponential backoff when you receive a 429 response:

```typescript
async function apiRequestWithRetry(endpoint: string, options: RequestInit = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const response = await fetch(endpoint, options);
    
    if (response.status === 429) {
      const error = await response.json();
      const retryAfter = error.error?.retryAfter || Math.pow(2, i);
      
      console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      continue;
    }
    
    return response.json();
  }
  
  throw new Error('Max retries exceeded');
}
```

### Python Example

```python
import time
import requests

def api_request_with_retry(url, headers, data=None, retries=3):
    for i in range(retries):
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 429:
            error = response.json()
            retry_after = error.get('error', {}).get('retryAfter', 2 ** i)
            
            print(f'Rate limited. Retrying after {retry_after} seconds...')
            time.sleep(retry_after)
            continue
        
        response.raise_for_status()
        return response.json()
    
    raise Exception('Max retries exceeded')
```

## Best Practices

### Monitor Rate Limit Headers

Always check rate limit headers to avoid hitting limits:

```typescript
const response = await fetch(endpoint, options);
const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0');

if (remaining < 10) {
  console.warn('Rate limit low, consider slowing down requests');
}
```

### Implement Request Queuing

For high-volume applications, implement request queuing:

```typescript
class RateLimitedQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private requestsPerMinute = 100;
  private requestsThisMinute = 0;
  private minuteStart = Date.now();

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      // Reset counter if a new minute started
      if (Date.now() - this.minuteStart >= 60000) {
        this.requestsThisMinute = 0;
        this.minuteStart = Date.now();
      }

      // Wait if we've hit the limit
      if (this.requestsThisMinute >= this.requestsPerMinute) {
        const waitTime = 60000 - (Date.now() - this.minuteStart);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        this.requestsThisMinute = 0;
        this.minuteStart = Date.now();
      }

      const request = this.queue.shift();
      if (request) {
        await request();
        this.requestsThisMinute++;
      }
    }

    this.processing = false;
  }
}
```

### Cache Responses

Cache responses when possible to reduce API calls:

```typescript
const cache = new Map<string, { data: any; expires: number }>();

async function getPaymentIntentCached(intentId: string) {
  const cached = cache.get(intentId);
  if (cached && cached.expires > Date.now()) {
    return cached.data;
  }

  const intent = await apiRequest(`/payment-intents/${intentId}`);
  cache.set(intentId, {
    data: intent,
    expires: Date.now() + 30000, // Cache for 30 seconds
  });

  return intent;
}
```

## Rate Limit by Endpoint

Some endpoints may have different rate limits:

| Endpoint | Test Key Limit | Live Key Limit |
|----------|----------------|----------------|
| `GET /payment-intents/:id` | 100/min | 1,000/min |
| `POST /payment-intents` | 50/min | 500/min |
| `POST /payment-intents/:id/confirm` | 30/min | 300/min |

## Increasing Rate Limits

For higher rate limits, contact support:

- **Email**: support@finternet.com
- **Include**: Your use case, expected request volume, and API key

## Related

- [Error Codes](errors/error-codes.md)
- [API Reference](api-reference/introduction.md)
- [Webhooks](webhooks.md) - Use webhooks to reduce polling
