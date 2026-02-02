# Overview

Welcome to Finternet! This guide will help you integrate programmable payments into your application in just a few minutes.

## What You'll Build

By the end of this guide, you'll have:
- ✅ Build intelligent, programmable payment flows
- ✅ Create real-time, event-driven app experiences
- ✅ Integrate payments directly into your application logic
- ✅ Implement automated, rule-based workflows
- ✅ Apply AI tools to support real product development

## Prerequisites

Before you begin, make sure you have:
- A Finternet account with API keys
- Basic understanding of REST APIs
- A development environment set up

## Step 1: Get Your API Keys

API keys authenticate your requests to the Finternet API. Each key is scoped to a specific merchant account.

### API Key Format

Finternet API keys follow this pattern:
```
sk_{environment}_{unique_id}
```

**Environments:**
- `test` - For testing and development
- `live` - For production transactions
- `hackathon` - For hackathon participants

**Example:**
```
sk_test_51AbC123XyZ789...
```

### Step 1: Get Your API Key

To start using Finternet, you'll need an API key:

1. Sign up at [Finternet Dashboard](https://dashboard.finternet.com)
2. Navigate to **Settings** → **API Keys**
3. Copy your **Secret Key** (starts with `sk_`)

:::warning Sandbox Environment
🧪 **Current Environment**: This documentation uses the **sandbox environment** (`api.fmm.finternetlab.io`).

🚀 **Production API** will be available once deployed.
:::

> ⚠️ **Security Note**: Never expose your secret keys in client-side code or commit them to version control. Use environment variables or secure secret management.

## Step 2: Make Your First API Call

Let's create a simple payment intent to verify your setup:

```bash
curl https://api.fmm.finternetlab.io/v1/payment-intents \
  -u sk_test_your_key_here: \
  -d amount="100.00" \
  -d currency="USDC" \
  -d type="CONDITIONAL" \
  -d settlementMethod="OFF_RAMP_MOCK" \
  -d settlementDestination="bank_account_123"
```

**Response:**
```json
{
  "id": "intent_2xYz9AbC123",
  "object": "payment_intent",
  "status": "INITIATED",
  "data": {
    "id": "intent_2xYz9AbC123",
    "status": "INITIATED",
  "amount": "100.00",
  "currency": "USDC",
  "type": "CONDITIONAL",
  "paymentUrl": "https://pay.fmm.finternetlab.io/?intent=intent_2xYz9AbC123",
    "contractAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318",
    "typedData": { ... },
    "phases": [ ... ],
    "created": 1704067200,
    "updated": 1704067200
  },
  "created": 1704067200,
  "updated": 1704067200
}
```

> **💡 Important:** The response includes `data.paymentUrl` - this is the URL where users complete payment. Redirect them to this URL after creating the payment intent.

## Step 3: Redirect User to Payment Page

After creating the payment intent, redirect your user to the payment URL:

```typescript
const response = await apiRequest('/payment-intents', {...});
const paymentUrl = response.data.paymentUrl;

// Redirect user to payment page
window.location.href = paymentUrl;
```

## Step 4: Understand the Payment Flow

Every payment goes through these stages:

1. **INITIATED** - Payment intent created, awaiting payer action
2. **PROCESSING** - Transaction submitted to blockchain
3. **SUCCEEDED** - Blockchain transaction confirmed (5+ confirmations)
4. **SETTLED** - Funds converted to fiat and sent to merchant account
5. **FINAL** - Payment fully completed

## Step 5: Confirm the Payment

Once a payer signs and executes the transaction on the frontend, the payment is automatically confirmed. You can also manually confirm it:

```bash
curl https://api.fmm.finternetlab.io/v1/payment-intents/intent_2xYz9AbC123/confirm \
  -H "X-API-Key: sk_test_your_key_here" \
  -H "Content-Type: application/json" \
  -X POST \
  -d '{
    "signature": "0x1234...",
    "payerAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f42318"
  }'
```

## Step 6: Check Payment Status

Poll the payment intent to track its progress:

```bash
curl https://api.fmm.finternetlab.io/v1/payment-intents/intent_2xYz9AbC123 \
  -u sk_test_your_key_here:
```

## Next Steps

- 📖 Read about [Payment Types](concepts/payment-types.md) to understand different payment options
- 🔐 Learn about [Authentication](getting-started/authentication.md) in detail
- 💻 Check out [Code Examples](examples/quickstart.md) for ready-to-use snippets
- 📚 Explore the [API Reference](api-reference/introduction.md) for complete documentation

## Need Help?

- 📧 Email: support@finternet.com
- 💬 Discord: [Join our community](https://discord.gg/finternet)
- 📖 Documentation: Browse the full docs

---

**Ready to build?** Continue to [Your First Payment](your-first-payment.md) for a complete walkthrough.
