# unero-shared-schemas

The single source of truth for cross-service contracts on the Unero platform: event
schemas, the error-code registry, envelopes, provider-interface shapes, and reusable
OpenAPI components. Repo 2 in the Phase 1 build order — every downstream service depends
on these contracts (ADR-003, ADR-022, EVENT_CATALOG.md, ERROR_CATALOG.md).

Published as `@uneroplatform/shared-schemas` to GitHub Packages on version bump.

## Layout

```
schemas/
  common.schema.json            Money, Currency, Ulid, Uuid, ServiceName, Timestamp
  envelopes/                    event-envelope + error-envelope (canonical shapes)
  events/                       one payload schema per event_type (UserCreated, WalletCredited, ...)
  errors/                       error-code-registry.schema.json + error-codes.json (the registry)
  provider-interface/           normalized payout request/response (ADR-004/012)
openapi/components/             reusable OpenAPI 3.1 Money, Error, and error responses
examples/                       canonical valid instances, validated in CI
tools/validate.mjs              compiles every schema; validates every example + registry
```

## Contract rules (non-negotiable)

- **Events** carry the standard envelope (`schemas/envelopes/event-envelope.schema.json`);
  `event_type` is `<Noun><PastTenseVerb>`; consumers dedupe by `event_id`.
- **Errors** are `NAMESPACE_NNN`, stable across API versions; every code lives in
  `schemas/errors/error-codes.json` before any service returns it (AI_RULES Rule 5).
- **Money** is integer minor units, never a float (CODING_STANDARDS §8).
- A **breaking** event change is a **new event version**, never an in-place edit (see VERSIONING.md).

## Use

```bash
make install      # npm ci
make validate     # compile all schemas + validate examples + registry
make check        # validate + openapi lint
```

Consumers depend on a pinned package version; contract tests verify the pin against a
producer's live spec (ADR-022).
