# Orbsona launch readiness

Date: 2026-07-24
Release: website and `@accidental-revenue/orbsona` v0.1.1

## Verdict

Orbsona is ready for a focused public launch as an open-source presence layer for AI agents. The canonical website is `https://orbsona.com`, the source repository is `https://github.com/Accidental-Revenue/orbsona`, and the package is `@accidental-revenue/orbsona`.

The launch claim is deliberately narrow: Orbsona provides portable visual identities and a live, state-aware React renderer. It does not claim identity uniqueness, authentication, a global registry, cloud persistence, or first-party provider integrations.

## Launch-blocker patch

The v0.1.1 patch closes the three renderer risks identified in the final review:

- Small 20–32 pixel avatars use a compact-density preset and remain recognizable.
- PNG export renders through a dedicated 512 × 512 canvas, independent of preview size and display density.
- Seed-to-preset derivation is isolated from the Studio catalogs and contract-tested across the complete 120-combination v1 cycle.

Studio now exposes the numeric identity seed, persists it with the local browser draft, and lets users deliberately reproduce or regenerate an identity.

## Automated evidence

### Application and package

- ESLint: pass
- Optimized Next.js build: pass
- Package build and contract tests: pass
- Compact-rendering launch regression tests: pass
- Production dependency audit: zero vulnerabilities
- Package dry run contains only the intended distributable files

### Browser journeys

The launch-critical flow passes in Chromium, Firefox, and WebKit:

- edit and persist the identity seed;
- render the Studio identity;
- export a non-blank 512 × 512 PNG;
- download and parse the portable `.orbsona.json` identity;
- download WebM where the browser supports recording, or show an explicit support message.

Canonical Chromium visual baselines cover 32, 64, and 256 pixel idle avatars. GitHub Actions runs lint, package tests, the production build, and critical Chromium journeys on every pull request and push to `main`.

### Security and privacy

- No account, backend, hosted identity store, remote upload, telemetry, or analytics
- Browser draft stored only in local storage
- Identity files validated and size-limited at import
- Bounded canvas pixel density and offscreen/hidden rendering pause
- Restrictive production security headers and no framework disclosure header

## Public product boundary

The identity JSON is the source of truth. The React renderer turns it into live semantic states. PNG and WebM are fallback assets for places that cannot run the component.

The current release includes:

- four relief-style backgrounds;
- two optional background effects;
- five palettes;
- six motion presets;
- eight semantic runtime states;
- deterministic numeric seeds;
- local import, reset, and autosave;
- npm, pnpm, Yarn, and Bun installation from the same npm artifact.

## Release procedure

```bash
npm run lint
npm run test:package
npm run build
npm run test:browser
npm audit --omit=dev --audit-level=high
npm pack --dry-run --workspace @accidental-revenue/orbsona
npm view @accidental-revenue/orbsona version
```

After publication, verify `https://orbsona.com`, `/playground`, `/install`, `/docs`, the public npm version, and a clean consumer install.

## Accepted post-launch work

The following are roadmap items, not launch blockers:

- expand visual variety without weakening compact-size legibility;
- improve framework integration examples and runtime adapters;
- add shareable identity links only when the privacy and permanence model is explicit;
- explore opt-in provenance or a registry without making uniqueness claims the renderer cannot enforce;
- add paid hosted coordination only after open-source adoption demonstrates demand.

The prioritized roadmap is maintained in `ROADMAP.md`.
