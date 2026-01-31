# Changelog

All notable changes to the Finternet Payment Gateway API will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Planned
- Webhook signature verification
- Additional settlement methods
- Enhanced dispute resolution features

## [1.1.0] - 2026-01-31

### Changed
- **BREAKING**: Deprecated `CONSENTED_PULL` payment type in favor of enhanced security model
- Streamlined payment architecture to focus exclusively on `DELIVERY_VS_PAYMENT` with escrow protection
- Updated all API examples and documentation to use `DELIVERY_VS_PAYMENT` type
- Enhanced EIP-712 typed data structures from `ConsentedPull` to `DeliveryVsPayment`
- Improved payment flow documentation with focus on buyer protection and security

### Removed
- `CONSENTED_PULL` payment type references from all documentation
- Comparison tables between payment types (now single unified approach)
- Legacy payment flow examples without escrow protection

### Documentation
- Restructured payment types guide to emphasize security-first approach
- Updated API reference with consistent `DELIVERY_VS_PAYMENT` examples
- Simplified getting started guide with unified payment model
- Enhanced payment flows documentation with escrow benefits
- Updated status lifecycle documentation for escrow-only model

## [1.0.0] - 2024-01-01

### Added
- Initial API release
- Payment intent creation and management
- Delivery vs Payment (DvP) escrow orders
- Time-locked payment releases
- Milestone-based payments
- Delivery proof submission
- Dispute resolution system
- Off-ramp settlement processing
- Complete audit trail logging
- EIP-712 signature verification
- Multi-tenant merchant support
- API key authentication

### API Endpoints
- `POST /v1/payment-intents` - Create payment intent
- `GET /v1/payment-intents/:id` - Retrieve payment intent
- `GET /v1/payment-intents/public/:id` - Public payment intent retrieval
- `POST /v1/payment-intents/:id/confirm` - Confirm payment intent
- `POST /v1/payment-intents/public/:id/transaction-hash` - Update transaction hash
- `GET /v1/payment-intents/:id/escrow` - Get escrow order
- `POST /v1/payment-intents/:id/escrow/delivery-proof` - Submit delivery proof
- `POST /v1/payment-intents/:id/escrow/dispute` - Raise dispute
- `POST /v1/payment-intents/:id/escrow/milestones` - Create milestone
- `POST /v1/payment-intents/:id/escrow/milestones/:milestoneId/complete` - Complete milestone

### Payment Types
- `DELIVERY_VS_PAYMENT` - Escrow-based payment with delivery verification

### Settlement Methods
- `OFF_RAMP_MOCK` - Mock settlement for testing
- `OFF_RAMP_TO_RTP` - Real-Time Payment settlement
- `OFF_RAMP_TO_BANK` - Bank transfer settlement

### Release Types
- `DELIVERY_PROOF` - Release on delivery proof submission
- `TIME_LOCKED` - Release after time period
- `MILESTONE_LOCKED` - Incremental milestone-based release
- `AUTO_RELEASE` - Automatic release on delivery proof

## Version History

### API Versioning

The API uses URL-based versioning:
- Current version: `v1`
- Version included in all API URLs: `/v1/...`

### Backward Compatibility

- Breaking changes will result in a new API version
- Previous versions will be maintained for at least 6 months
- Deprecation notices will be provided 3 months in advance

## Deprecations

No deprecations at this time.


## Related

- [API Reference](api-reference/introduction.md)
- [Getting Started](getting-started/overview.md)
- [Error Codes](errors/error-codes.md)
