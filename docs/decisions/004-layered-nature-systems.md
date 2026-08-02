# ADR-004: Layered nature systems

Date: 2026-08-02

Status: accepted

Supersedes: ADR-003

## Context

Orbsona v0.1 established a strong visual language by composing deterministic relief with an animated foreground. An unreleased v0.2 experiment replaced that language with a single height-field renderer. The experiment reduced visual depth, removed well-liked motion, and made the product less useful at actual avatar sizes.

The earlier foreground presets come from `thinking-orbs`, an MIT-licensed package by Jakub Antalik. Reuse is permitted when the copyright and license notice are retained. Orbsona also needs a recognizably original direction that can grow without disguising the source of third-party work.

## Decision

Orbsona keeps the layered identity architecture:

- background defines one of four deterministic relief families;
- rotation and grain optionally alter the background finish;
- palette defines color;
- animation defines the foreground motion system;
- seed defines a reproducible individual;
- semantic runtime state modifies pace, energy, glow, and a restrained state overlay;
- one final circular mask clips the entire composition.

The initial Orbsona-authored nature systems are Phyllotaxis and Radiolaria. Phyllotaxis uses a golden-angle distribution and growth wave derived from the geometry of seed heads. Radiolaria uses a seeded spherical lattice inspired by the silica skeletons of microscopic radiolarians. They are interpretations implemented in this repository, not reproductions of another avatar product.

Field, Orbit, Globe, Wave, and Solve use the public preset API from `thinking-orbs`. The dependency, repository, copyright, and full MIT license are retained in `THIRD_PARTY_NOTICES.md` at both repository and package roots. The animation catalog exposes the source of each preset instead of implying common authorship.

## Compatibility

Version 1 identity documents preserve their exact background, animation, palette, finish controls, and seed. The short-lived unreleased topology preview remains importable only so browser drafts are not lost; it migrates deterministically to the layered contract.

## Release gate

A new motion system is not shipped solely because it is novel. It must:

1. remain legible at 32 and 64 CSS pixels;
2. look intentional at the Studio's 128-pixel default preview;
3. respond visibly but smoothly to runtime state and energy;
4. stay completely inside the circular export mask;
5. meet the browser frame budget and reduced-motion contract;
6. have documented authorship and license provenance.

## Consequences

- Existing visual quality is restored instead of discarded.
- Orbsona can develop a distinct biology-derived family one system at a time.
- Third-party work remains clearly licensed and attributed.
- The renderer has a runtime dependency, so supply-chain and license checks remain part of every release.
- Background and motion can be combined independently, producing more identities without multiplying opaque presets.
