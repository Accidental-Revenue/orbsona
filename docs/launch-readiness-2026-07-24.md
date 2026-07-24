# Orbsona launch readiness

Date: 2026-07-24
Candidate: website and `@accidental-revenue/orbsona` v0.1.0

## Verdict

The product code and package artifact are release-ready. Public launch is not complete because three external release gates remain:

1. npm publication requires the account's one-time browser authentication.
2. `orbsona.com` is registered but is not serving this application yet.
3. The local Git repository has no public remote, so the open-source Studio does not yet have a public source location.

Until the npm gate is complete, website and repository copy deliberately describe v0.1.0 as a release candidate rather than falsely claiming that it is live.

## Passed checks

### Brand and naming

- Working source, routes, metadata, exports, identity format, filenames, storage keys, documentation, package name, and package workspace use Orbsona.
- Canonical URLs, sitemap, robots metadata, Open Graph image, web manifest, and icon use `https://orbsona.com`.
- The generated identity format is `orbsona.identity`; the portable extension is `.orbsona.json`.
- No reference to the former product name remains in the working source outside Git history and external registry history.

### Application

- ESLint: pass
- TypeScript and optimized Next.js build: pass
- All application routes prerender as static content.
- Production route responses: pass
- Custom 404 and error recovery: pass
- Real-browser Studio, Playground, Install, and Documentation audit: pass
- Desktop, compact, mobile, keyboard, reduced-motion, and export testing: pass
- Browser console errors: none, excluding the intentionally requested 404 during not-found testing

### Package

- Package contract smoke test: pass
- Clean React 18 tarball consumer install and import: pass
- Root and `/react` exports: pass
- `publint`: pass with no package-structure errors
- Package artifact: 19 intended files
- Packed size: approximately 21 KB compressed and 97 KB unpacked
- Artifact contains only `LICENSE`, `README.md`, `package.json`, and `dist`
- Registry package name: available
- Authenticated npm account: recognized
- Publish attempt reached npm successfully and stopped only at the required one-time authentication step

The package is intentionally ESM-only. Modern Node ESM and bundler resolution pass; CommonJS consumers must use dynamic `import()`, and Node 10 subpath resolution is not supported. This matches the documented package boundary.

### Security and privacy

- Production dependency audit: zero vulnerabilities
- No environment or credential files found in the release tree
- No account, backend, cloud identity store, telemetry, analytics, or remote identity upload
- Identity files are size-limited and validated before import
- Production headers include HSTS, MIME sniffing protection, frame denial, strict referrer policy, restricted browser permissions, cross-origin opener isolation, and a restrictive same-origin Content Security Policy
- Framework disclosure header is disabled

### Performance

- No long tasks during the measured live Studio animation
- Stable approximately 60 Hz browser presentation with a 17.7 ms p95 frame interval
- Renderer work pauses when hidden or offscreen
- Canvas pixel density is bounded

## Release gates

### 1. Complete npm browser authentication

From the repository root:

```bash
npm publish --workspace @accidental-revenue/orbsona --access public
```

Then verify:

```bash
npm view @accidental-revenue/orbsona version
```

Install it in a clean temporary project and import both `@accidental-revenue/orbsona` and `@accidental-revenue/orbsona/react`. After verification, update the release-candidate wording in the website and README to “public.”

### 2. Publish the source repository

Create the intended public Git hosting location, add it as this repository's remote, and add `repository`, `bugs`, and source `homepage` metadata to the npm package before a follow-up release. A public source URL is the clearest proof behind the open-source claim and enables issues, contributions, release tags, and trusted publishing.

### 3. Deploy and connect the domain

Deploy the optimized application, attach `orbsona.com`, verify DNS and TLS, and then exercise the production domain:

- `/`
- `/playground`
- `/install`
- `/docs`
- `/robots.txt`
- `/sitemap.xml`
- `/opengraph-image`

Confirm canonical and social metadata resolve to the final HTTPS origin.

## Recommended immediately after launch

- Add browser workflow tests to CI for create/import/reset/PNG/JSON and page navigation.
- Add npm trusted publishing with provenance after the public source repository exists.
- Add a short changelog and release tags beginning with v0.1.0.
- Decide whether to deprecate or remove the former npm package. This is intentionally not done automatically because registry removal is destructive.
- Decide whether the public Git history should preserve development history or start from a clean launch snapshot. The current local history still records the earlier working name.

## Launch command checklist

```bash
npm run lint
npm run test:package
npm run build
npm audit --omit=dev --audit-level=high
npm pack --dry-run --workspace @accidental-revenue/orbsona
npm publish --workspace @accidental-revenue/orbsona --access public
```

All commands through the package dry run pass. The final publish command is waiting on one-time npm authentication.
