# Versioning

## Package
`@uneroplatform/shared-schemas` follows SemVer. The version in `package.json` gates
publication; CI publishes to GitHub Packages on a version bump on `main`.

- **patch** — clarification, description, new example. No shape change.
- **minor** — additive: a new event schema, a new optional field, a new error code.
- **major** — a breaking change to an existing shared shape (envelope, Money, Error).

## Events
Event schemas are **append-only per version**. A breaking change to `WalletCredited`
does not edit `events/WalletCredited.schema.json`; it adds `events/WalletCredited.v2.schema.json`
and the producer emits `event_version: 2`. Producers may emit both during migration;
consumers migrate on their own cadence. This preserves replay and audit (ADR-003).

## Error codes
Codes are stable and never change meaning. A code is added to `error-codes.json`; it is
removed only after a full sunset (Volume 4). Removing or repurposing a code is a major bump.

## OpenAPI components
A change to `Money` or `Error` ripples to every service spec — treat as major unless purely
additive-optional.
