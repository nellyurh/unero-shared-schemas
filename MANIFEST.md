Repository: unero-shared-schemas
Status: Complete
Build order: 2 of 6

Dependencies:
  - unero-platform-terraform  (done)

Provides:
  - Shared JSON Schemas (common value objects)
  - Event contracts (envelope + per-event payload schemas)
  - Error-code registry (NAMESPACE_NNN)
  - Provider-interface contracts (normalized payout req/resp)
  - OpenAPI 3.1 reusable components (Money, Error, error responses)

Consumers:
  - .github (validates against these in reusable CI)
  - config-service
  - feature-flag-service
  - identity-service
  - (every subsequent service)

Verified:
  - 11 schemas compile (ajv 2020)
  - error-codes.json validates against its registry schema
  - all examples validate against their envelopes + payload schemas

Commit:
  feat: initial shared schemas repository (events, errors, provider-interface, openapi components)
