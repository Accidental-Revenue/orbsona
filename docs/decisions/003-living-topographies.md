# ADR-003: Living Topographies

Date: 2026-08-02

Status: accepted

## Context

Orbsona v0.1 combined locally rendered relief backgrounds with motion presets supplied by a third-party package. That made the product useful, but its visual authorship was unclear and identity, material, and behavior were separate layers.

## Decision

Orbsona v0.2 uses an original deterministic height-field engine called Living Topographies.

- Morphology defines a stable terrain family.
- Material defines how the height field is shaded.
- Palette defines color.
- Seed defines a reproducible individual.
- Runtime state deforms the terrain through a shared behavior grammar.

The eight initial morphologies are Basin, Ridge, Archipelago, Fault, Cellular, Pleat, Current, and Chorus. The initial materials are Mineral, Glass, Ink, and Frost.

The renderer uses standard mathematical building blocks such as gradients, seeded value noise, Gaussian fields, distance fields, and finite-difference normals. The composition, parameterization, state grammar, and implementation are maintained in this repository. No visual preset library is used at runtime.

The Studio ambient signal field is also maintained locally. It uses a deterministic low-density point distribution and one slow signal front instead of the earlier demo background component.

## Compatibility

The identity document version advances from 1 to 2. Version 1 documents and raw browser drafts remain importable. The migration maps each prior background and animation to the closest v2 material and morphology. New files contain only v2 fields.

## Consequences

- Orbsona owns its visual language and can evolve it without upstream preset constraints.
- State changes remain recognizable because they alter one persistent surface.
- Morphology and material can evolve independently.
- A minor package release is required because the identity shape changes, even though the React component props remain stable.
