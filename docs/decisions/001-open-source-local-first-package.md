# ADR-001: Open-source, local-first, provider-neutral product

## Status

Accepted

## Date

2026-07-24

## Context

Orbsona needs a coherent version 0.1 product model before its first public release. The Studio currently has no account system, backend, database, hosted identity library, or provider adapter packages. Its durable artifact is a versioned identity JSON file, and the React renderer accepts a small semantic runtime-state contract.

Presenting identity libraries, cloud persistence, or provider SDKs as shipped product capabilities would misrepresent the implementation. Publishing a public package also requires an explicit repository-level license and a clear ownership model for user-created identities.

## Decision

- Release the repository and `@accidental-revenue/orbsona` under the MIT License.
- Keep Studio local-first, with one convenience draft stored in the user's browser.
- Treat the downloaded `.orbsona.json` file as the portable source of truth.
- Keep the renderer provider-neutral. Applications map their own voice, agent, and tool events to `AgentState`.
- Do not claim first-party ElevenLabs, OpenAI, or other provider adapters in version 0.1.
- Publish provider-specific recipes only when each recipe has a maintained integration test.
- Show the npm command as unavailable until the package is actually published.

## Alternatives considered

### Hosted identity library

Rejected for version 0.1. It would require authentication, a database, privacy terms, operational ownership, and a synchronization model that the current product does not have.

### First-party provider adapters

Rejected for version 0.1. Provider SDKs change independently and would create maintenance obligations beyond the stable renderer contract. Generic semantic states are sufficient for the initial package.

### Static image export as the primary product

Rejected. PNG and WebM are useful fallbacks, but they cannot express live agent state. The identity file plus runtime renderer remains the primary output.

## Consequences

- Users own and version their identity configuration with their application code.
- The Studio can remain useful without collecting user data or operating a backend.
- The public documentation must distinguish shipped capabilities from future recipes.
- The npm installation action must be enabled only after the registry release succeeds.
- A hosted service or provider adapter would require a new ADR and an explicit product boundary.
