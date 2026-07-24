# Orbsona

Orbsona is a studio and runtime for stateful AI agent identities. It separates a stable visual identity from live semantic states so the same agent remains recognizable while listening, reasoning, speaking, using tools, succeeding, or recovering from an error.

The repository contains two products that are developed together:

- A fixed-height Next.js studio for designing one browser-saved draft, importing identity files, and exporting live-ready identities.
- The `@accidental-revenue/orbsona` package with the versioned identity contract and canvas-based React renderer.

The renderer is published on npm as [`@accidental-revenue/orbsona`](https://www.npmjs.com/package/@accidental-revenue/orbsona). Release and registry verification are documented in [`docs/npm-publishing.md`](docs/npm-publishing.md).

Source, issues, and releases live at [`Accidental-Revenue/orbsona`](https://github.com/Accidental-Revenue/orbsona).

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

```bash
npm run lint
npm run test:package
npm run build
npm run test:browser
```

## Product surfaces

- Studio with deterministic background, optional rotation and grain, palette, animation, and seed controls
- One autosaved browser draft with explicit import and reset controls
- Runtime playground for eight semantic states and live signal energy
- Provider-neutral React package contract with no first-party provider adapters
- Documentation for the identity file and runtime contract
- Live component usage as the primary output
- PNG poster and WebM preview as fallback assets
- Fixed 512 × 512 PNG export, independent of the selected preview size

## Runtime model

- Four relief-style backgrounds
- Two composable background effects: slow rotation and deterministic grain
- Five curated palettes
- Six motion presets
- Eight runtime states: idle, connecting, listening, thinking, speaking, working, success, and error
- Deterministic generation from a numeric identity seed
- Fixed-height native studio shell with no document scrolling
- Reduced-motion support, visibility pausing, and bounded canvas pixel density

## Package workspace

Install the public package with the package manager already used by your application:

```bash
npm install @accidental-revenue/orbsona
# pnpm add @accidental-revenue/orbsona
# yarn add @accidental-revenue/orbsona
# bun add @accidental-revenue/orbsona
```

```tsx
import { AgentAvatar } from "@accidental-revenue/orbsona/react";

<AgentAvatar identity={identity} state="listening" size={64} />;
```

Package source and API documentation live in [`packages/orbsona`](packages/orbsona). The verified npm release workflow lives in [`docs/npm-publishing.md`](docs/npm-publishing.md).

The renderer uses a bounded 2D canvas pipeline with motion primitives from `thinking-orbs`. The product UI shares the typographic, color, spacing, and Aceternity-inspired interaction system used by the Accidental Revenue portfolio while keeping a distinct application layout.

## Open source

Orbsona is released under the [MIT License](LICENSE). The Studio is local-first: it keeps one draft in browser storage and does not require an account, backend, hosted identity library, or analytics service.

The open-source product boundary is recorded in [ADR-001](docs/decisions/001-open-source-local-first-package.md). The launch scope and evidence-gated hosted strategy are recorded in [ADR-002](docs/decisions/002-launch-scope-and-roadmap.md).

Release history is recorded in the [changelog](CHANGELOG.md). The maintained product direction lives in the [roadmap](ROADMAP.md).
