# Error Handling Examples

Learn how to handle errors gracefully in your Finternet integration.

## Error Response Format

All errors follow this structure:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "type": "error_type",
    "param": "parameter_name"
  }
}
```

## Basic Error Handling

### JavaScript/TypeScript

```typescript
async function handleApiRequest(endpoint: string, options: RequestInit = {}) {
  try {
    const response = await fetch(endpoint, options);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'API request failed');
    }
    
    return await response.json();
  } catch (error: any) {
    // Handle different error types
    if (error.error) {
      switch (error.error.type) {
        case 'authentication_error':
          console.error('Authentication failed:', error.error.message);
          // Handle invalid API key
          break;
        case 'invalid_request_error':
          console.error('Invalid request:', error.error.message);
          // Handle validation errors
          break;
        case 'rate_limit_error':
          console.error('Rate limit exceeded:', error.error.message);
          // Implement retry logic
          break;
        default:
          console.error('Unknown error:', error);
      }
    } else {
      console.error('Network error:', error);
    }
    throw error;
  }
}
```

### Python

```python
import requests

def handle_api_request(endpoint, method='GET', data=None):
    try:
        url = f'https://api.finternet.com/v1{endpoint}'
        headers = {
            'X-API-Key': os.environ['FINTERNET_API_KEY'],
            'Content-Type': 'application/json',
        }
        
        if method == 'POST':
            response = requests.post(url, headers=headers, json=data)
        else:
            response = requests.get(url, headers=headers)
        
        response.raise_for_status()
        return response.json()
    
    except requests.exceptions.HTTPError as e:
        error = e.response.json()
        error_type = error.get('error', {}).get('type')
        
        if error_type == 'authentication_error':
            print('Authentication failed:', error['error']['message'])
        elif error_type == 'invalid_request_error':
            print('Invalid request:', error['error']['message'])
        elif error_type == 'rate_limit_error':
            print('Rate limit exceeded:', error['error']['message'])
        else:
            print('Unknown error:', error)
        
        raise
```

## Handling Specific Errors

### Authentication Errors

```typescript
try {
  const intent = await apiRequest('/payment-intents', {...});
} catch (error: any) {
  if (error.error?.code === 'authentication_required') {
    console.error('API key is missing');
    // Prompt user to add API key
  } else if (error.error?.code === 'forbidden') {
    console.error('Invalid API key');
    // Check API key configuration
  }
}
```

### Invalid Request Errors

```typescript
try {
  const intent = await apiRequest('/payment-intents', {
    method: 'POST',
    body: JSON.stringify({
      amount: '-100.00', // Invalid amount
      // ...
    }),
  });
} catch (error: any) {
  if (error.error?.code === 'invalid_request') {
    console.error('Invalid parameter:', error.error.param);
    console.error('Error message:', error.error.message);
    // Show user-friendly error message
  }
}
```

### Rate Limit Errors

```typescript
async function apiRequestWithRetry(endpoint: string, options: RequestInit = {}, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiRequest(endpoint, options);
    } catch (error: any) {
      if (error.error?.code === 'rate_limit_exceeded') {
        const retryAfter = error.error.retryAfter || Math.pow(2, attempt);
        console.log(`Rate limited. Retrying after ${retryAfter} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}
```

### State Transition Errors

```typescript
try {
  // Try to confirm an already confirmed payment
  await apiRequest(`/payment-intents/${intentId}/confirm`, {
    method: 'POST',
    body: JSON.stringify({...}),
  });
} catch (error: any) {
  if (error.error?.code === 'invalid_state_transition') {
    console.error('Invalid state transition:', error.error.message);
    // Check current payment status
    const intent = await apiRequest(`/payment-intents/${intentId}`);
    console.log('Current status:', intent.data.status);
  }
}
```

## Error Handling Best Practices

### 1. Always Check Response Status

```typescript
const response = await fetch(endpoint, options);

if (!response.ok) {
  const error = await response.json();
  // Handle error
}

const data = await response.json();
```

### 2. Provide User-Friendly Messages

```typescript
function getUserFriendlyError(error: any): string {
  const errorMessages: Record<string, string> = {
    'authentication_required': 'Please check your API key configuration',
    'forbidden': 'Invalid API key. Please verify your credentials',
    'invalid_request': 'Please check your input and try again',
    'rate_limit_exceeded': 'Too many requests. Please wait a moment',
    'resource_missing': 'The requested resource was not found',
  };

  return errorMessages[error.error?.code] || error.error?.message || 'An error occurred';
}
```

### 3. Log Errors for Debugging

```typescript
try {
  await apiRequest(endpoint, options);
} catch (error: any) {
  // Log full error for debugging
  console.error('API Error:', {
    code: error.error?.code,
    message: error.error?.message,
    type: error.error?.type,
    param: error.error?.param,
    status: error.status,
  });
  
  // Show user-friendly message
  showUserMessage(getUserFriendlyError(error));
}
```

### 4. Implement Retry Logic

```typescript
async function apiRequestWithRetry(
  endpoint: string,
  options: RequestInit = {},
  retries = 3
): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      return await apiRequest(endpoint, options);
    } catch (error: any) {
      // Don't retry on client errors (4xx)
      if (error.status >= 400 && error.status < 500 && error.status !== 429) {
        throw error;
      }
      
      // Retry on server errors (5xx) or rate limits (429)
      if (i < retries - 1) {
        const delay = error.error?.retryAfter || Math.pow(2, i) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
}
```

## Complete Error Handling Example

```typescript
class FinternetClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.finternet.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw { ...error, status: response.status };
      }

      return await response.json();
    } catch (error: any) {
      // Network errors
      if (error instanceof TypeError) {
        throw {
          error: {
            code: 'network_error',
            message: 'Network request failed. Please check your connection.',
            type: 'network_error',
          },
        };
      }

      // API errors
      if (error.error) {
        this.handleApiError(error);
      }

      throw error;
    }
  }

  private handleApiError(error: any): void {
    const errorCode = error.error?.code;
    const errorType = error.error?.type;

    switch (errorType) {
      case 'authentication_error':
        if (errorCode === 'authentication_required') {
          throw new Error('API key is required');
        } else if (errorCode === 'forbidden') {
          throw new Error('Invalid API key');
        }
        break;

      case 'invalid_request_error':
        if (errorCode === 'invalid_state_transition') {
          throw new Error(`Invalid state transition: ${error.error.message}`);
        } else if (errorCode === 'signature_verification_failed') {
          throw new Error('Signature verification failed');
        }
        break;

      case 'rate_limit_error':
        const retryAfter = error.error?.retryAfter || 60;
        throw new Error(`Rate limit exceeded. Retry after ${retryAfter} seconds`);
    }
  }

  async createPaymentIntent(data: any): Promise<any> {
    return this.request('/payment-intents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}
```

## Related

- [Error Codes](errors/error-codes.md)
- [Troubleshooting](errors/troubleshooting.md)
- [API Reference](api-reference/introduction.md)
