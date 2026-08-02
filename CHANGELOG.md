# Changelog

All notable changes to Orbsona are documented here. The project follows semantic versioning for the public package.

## [Unreleased]

### Changed

- Restore the layered relief and foreground animations used by existing identities.
- Add Orbsona-authored Phyllotaxis and Radiolaria systems derived from biological geometry.
- Add four deterministic relief backgrounds with optional slow rotation and grain.
- Move the portable identity contract to version 2 while retaining the layered `background` and `animation` model.
- Restore `thinking-orbs` as an MIT-licensed, attributed runtime dependency.
- Render live avatars at the browser display cadence and keep ambient decoration on a separate low-cost schedule.
- Preserve a clear 128 pixel Studio preview at compact desktop and mobile viewport heights.

### Compatibility

- Continue accepting version 1 identity files and browser drafts through deterministic migration.
- Preserve the React component props and all eight semantic runtime states.

### Security and quality

- Add deterministic nature-geometry, migration, masking, and launch-regression tests.
- Bound seed-derived geometry caches and normalize non-finite signal input before it reaches the renderer.
- Canonicalize parsed identity documents and return defensive copies of nested palette data.
- Add clean-consumer, real-frame-cadence, accessibility, compact-layout, performance, security-header, and release-contract gates.
- Require exact install-script approvals in CI and Vercel, plus an unpublished, matching Git tag before the trusted-publishing workflow can release.
- Add third-party notices to the repository and published package.
- Resolve the dependency audit to zero known vulnerabilities.

## [0.1.1] - 2026-07-24

### Fixed

- Render small 20–32 pixel avatars with a compact motion density instead of reusing the 64 pixel preset.
- Export a non-blank 512 × 512 PNG independently of the selected Studio preview size or display pixel ratio.
- Preserve deterministic identity generation by isolating and exhaustively pinning the v1 seed-to-preset contract.

### Added

- Expose the numeric identity seed in Studio so an identity can be reproduced deliberately.
- Add package-level launch regression tests.
- Add Chromium, Firefox, and WebKit browser journeys for seed persistence and PNG, JSON, and WebM export.
- Add canonical Chromium visual baselines at 32, 64, and 256 pixels.
- Add a GitHub Actions launch gate for lint, package tests, build, and critical Chromium journeys.

## [0.1.0] - 2026-07-24

- First public release of the identity contract, React renderer, local-first Studio, Playground, Install, and Documentation.

[Unreleased]: https://github.com/Accidental-Revenue/orbsona/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/Accidental-Revenue/orbsona/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Accidental-Revenue/orbsona/releases/tag/v0.1.0
