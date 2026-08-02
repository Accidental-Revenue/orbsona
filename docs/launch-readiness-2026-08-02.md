# Orbsona 0.2.0 launch-readiness audit

Date: 2026-08-02  
Scope: public website, browser-local Studio, React package, release automation, dependency supply chain, and npm/Vercel launch sequence.

## Audit-time candidate status

At the time of this audit, the local 0.2.0 candidate passed every code-controlled release gate but had not yet been published or promoted to production. npm `latest` was 0.1.1 and version 0.2.0 did not exist in the registry. This report intentionally preserves that pre-promotion evidence; current release status is authoritative in npm, GitHub, and Vercel.

Production promotion remains intentionally gated on:

1. the npm trusted-publisher setting matching `.github/workflows/release.yml`;
2. a green CI and Vercel preview for the committed candidate;
3. publishing the exact `v0.2.0` tag before deploying the v2 website.

## Release-blocking findings closed

- Removed the renderer's 24/30 FPS cap and verified real pixel changes at browser display cadence.
- Bounded seed-derived geometry caches to prevent unbounded growth in long-lived applications.
- Normalized non-finite runtime signal values before motion calculations.
- Canonicalized parsed identity documents and defensively copied nested palette values.
- Restored the missing mobile Playground preview and prevented the 128 pixel Studio avatar from overlapping its state control at compact heights.
- Made scrollable code examples keyboard focusable and resolved the automated WCAG A/AA findings.
- Removed stale publication claims from the maintainer guide and made the npm registry the version source of truth.
- Restricted npm publication to an unpublished version on the exact matching Git tag.
- Declared exact install-script approvals and pinned strict npm 11.17.0 installation in CI, Vercel, and the release workflow.

## Verification evidence

### Clean repository gates

- `npm ci --strict-allow-scripts`: pass, 368 packages installed, zero vulnerabilities.
- `npm run lint`: pass.
- `npm run test:package`: pass.
- `npm run test:release`: pass.
- `npm run build`: pass; all 12 Next.js routes prerendered.
- `npm audit --audit-level=low`: zero vulnerabilities.
- `npm audit signatures`: 367 verified registry signatures and 86 verified attestations.
- `npm approve-scripts --allow-scripts-pending --json`: no pending scripts.
- `gitleaks git --redact`: 48 commits scanned, no leaks.

### Browser and product gates

The production build passed 83 tests across Chromium, Firefox, and WebKit. The 28 reported skips are deliberate canonical-browser gates for Chromium-only visual snapshots, clipboard permissions, Core Web Vitals, and canvas cadence timing.

Covered journeys include:

- all public routes, canonical links, legacy redirect, 404, security headers, sitemap, robots, manifest, icon, and Open Graph image;
- real browser draft persistence and reset confirmation;
- valid v1 migration, invalid import rejection, and v2 JSON round trip;
- all backgrounds, all motion systems, rotate and grain finishes, runtime states, and signal energy;
- fixed, non-blank 512 × 512 PNG and WebM/fallback behavior;
- final circular mask, reduced-motion pose, and display-cadence pixel changes;
- zero console warnings/errors on public routes;
- automated WCAG A/AA checks;
- 390 × 844 and 390 × 667 compact-layout geometry;
- LCP, CLS, long-task, DOM-interactive, and initial-JavaScript budgets.

### Published-artifact simulation

`npm pack` produced a 29.7 KB tarball containing only `dist`, package metadata, README, license, and third-party notices. The tarball installed into an empty consumer project with React 18.3.1; root imports, `/react` imports, identity serialization/parsing, TypeScript-facing exports, and server rendering passed.

## Dependency and licensing review

- `thinking-orbs` remains pinned to 0.1.1 with matching registry integrity, MIT license, source attribution, and a full license notice in the published package.
- No runtime dependency was added for accessibility or testing.
- Unused `motion` was removed from the website.
- Available dependency updates were reviewed but not mixed into the release candidate without a security or compatibility reason; the audited lockfile is the release input.

## Required launch order

1. Commit the audited candidate and obtain green GitHub CI and Vercel preview checks.
2. Confirm npm trusted publishing for repository `Accidental-Revenue/orbsona` and workflow `release.yml`.
3. Create and push `v0.2.0` at the audited commit.
4. Run **Publish package** from `v0.2.0` and verify `npm view @accidental-revenue/orbsona@0.2.0 version` returns `0.2.0`.
5. Merge/deploy the website only after the package is live, then verify `https://orbsona.com`, the custom-domain redirect, public headers, and install command against production.

This order prevents the v2 Studio and documentation from being public while npm still serves the v1 renderer.

The canonical host redirect is an external Vercel project-domain setting: `www.orbsona.com` targets `orbsona.com` with status 308. It must be verified against the live domain after every domain migration; an application redirect in `vercel.json` does not replace that custom-domain setting.
