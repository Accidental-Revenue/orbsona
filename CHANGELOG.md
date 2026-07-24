# Changelog

All notable changes to Orbsona are documented here. The project follows semantic versioning for the public package.

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

[0.1.1]: https://github.com/Accidental-Revenue/orbsona/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/Accidental-Revenue/orbsona/releases/tag/v0.1.0
