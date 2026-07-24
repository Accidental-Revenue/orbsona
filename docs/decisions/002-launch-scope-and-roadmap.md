# ADR-002: Launch scope and evidence-gated hosted roadmap

## Status

Accepted on 2026-07-24.

## Context

Orbsona can grow in several directions: more visual presets, a uniqueness system, a hosted registry, provider integrations, or a focused open-source renderer. The first public release needs a clear promise that the current product can keep.

The v0.1.1 launch review also found that v1 seed derivation is a compatibility contract. Catalog length and ordering must not be allowed to remap an identity after publication.

## Decision

Launch Orbsona as an open-source presence layer for AI agents:

- a portable, versioned identity document;
- a maintained React renderer for semantic runtime states;
- a local-first Studio and fallback asset exports;
- no uniqueness, authentication, registry, cloud, or provider-partnership claims.

The v1 seed derivation uses a dedicated frozen catalog independent of Studio menu ordering. Catalog growth that changes derivation will use a versioned v2 algorithm and migration path.

The first 90 days prioritize adoption, integration quality, compatibility, and measurable production use. A hosted or paid layer is explored only after the promotion criteria in `ROADMAP.md` are met. If built, it sells team coordination, governance, history, and managed delivery while leaving the renderer, schema, local Studio, and exports free.

## Alternatives considered

### Delay launch for a uniqueness or “agent DNA” system

Rejected. A seed can reproduce a visual identity, but it cannot prove global uniqueness, ownership, or authenticity. Making that promise now would require an authority and registry the product does not have.

### Build accounts and a hosted registry immediately

Rejected. There is no evidence yet that persistence or team coordination is the primary adoption constraint. It would add operational cost and weaken the local-first launch story.

### Add many more visual presets before launch

Rejected. Compact-size legibility, export correctness, compatibility, and integration clarity matter more than catalog breadth for the first release.

### Keep every future feature free and local forever

Not required. The MIT core remains free, while a future hosted workflow may be commercial if real usage demonstrates a coordination problem worth paying for.

## Consequences

- Public messaging stays narrow and credible.
- v1 identities remain stable even when Studio catalogs evolve.
- Roadmap decisions are tied to adoption evidence rather than novelty.
- A future paid product has a clear boundary that does not undermine the open-source package.
- Global uniqueness or verification would require a separate, explicit trust design and is not implied by Orbsona today.
