# @accidental-revenue/orbsona

Stateful, canvas-rendered visual identities for AI and voice agents.

## Install

```bash
npm install @accidental-revenue/orbsona
# or: pnpm add @accidental-revenue/orbsona
# or: yarn add @accidental-revenue/orbsona
# or: bun add @accidental-revenue/orbsona
```

The package is ESM-only and expects React 18 or newer.

## Render an identity

```tsx
import { AgentAvatar } from "@accidental-revenue/orbsona/react";
import aster from "./aster.orbsona.json";

export function AgentPresence({ state, voiceLevel }) {
  return (
    <AgentAvatar
      identity={aster.identity}
      state={state}
      energy={voiceLevel}
      size={64}
    />
  );
}
```

The stable identity controls recognition. Semantic state and signal levels control live behavior.

### React props

| Prop | Type | Purpose |
| --- | --- | --- |
| `identity` | `AvatarIdentity` | Required visual identity configuration |
| `state` | `AgentState` | Required semantic runtime state |
| `size` | `number \| string` | Width and height of the rendered avatar |
| `energy` | `number` | General signal level, normally from 0 to 1 |
| `inputLevel` | `number` | Optional listening or microphone level |
| `outputLevel` | `number` | Optional speaking or audio-output level |
| `className` | `string` | Class name applied to the canvas wrapper |
| `style` | `CSSProperties` | Inline styles applied to the canvas wrapper |

When `inputLevel` and `outputLevel` are omitted, `energy` drives both.

## Runtime states

| State | Use it when the agent is |
| --- | --- |
| `idle` | Available and waiting |
| `connecting` | Establishing a live session |
| `listening` | Receiving user input |
| `thinking` | Reasoning before responding |
| `speaking` | Returning voice output |
| `working` | Calling a tool or completing a task |
| `success` | Briefly acknowledging completion |
| `error` | Waiting for attention or recovery |

Map provider events into these states at the application boundary. The renderer does not claim first-party adapters or partnerships with voice and agent providers.

## Identity contract

```ts
import {
  createIdentityDocument,
  parseIdentityJson,
  serializeIdentity,
  type OrbsonaIdentityDocument,
} from "@accidental-revenue/orbsona";
```

An Orbsona identity is a portable, versioned JSON document:

```json
{
  "format": "orbsona.identity",
  "version": 2,
  "identity": {
    "name": "Aster",
    "background": "relief",
    "rotateBackground": false,
    "grain": false,
    "animation": "phyllotaxis",
    "palette": {
      "id": "ion",
      "name": "Ion",
      "colors": ["#77c8ff", "#214bb4", "#e0f7ff"]
    },
    "seed": 2718
  }
}
```

`background`, its optional finish controls, and `palette` define the body of the orb. `animation` defines its foreground motion system. `seed` makes the individual reproducible. Version 1 identities remain importable and preserve their layered appearance.

The published `identityFromSeed` helper preserves the original v1 mapping. Use `identityFromSeedV2` when generating from the expanded catalog that includes Phyllotaxis and Radiolaria. This explicit split prevents a package update from silently remapping an existing numeric seed.

Use `parseIdentityJson` at import boundaries. It returns a discriminated result instead of throwing for invalid files. PNG and WebM are fallback assets; the identity document is the source of truth for live runtimes.

## Motion systems

Orbsona-authored presets include Phyllotaxis, a golden-angle growth field inspired by seed heads, and Radiolaria, a rotating spherical lattice inspired by microscopic silica skeletons. The package also restores the motion collection from [`thinking-orbs`](https://github.com/Jakubantalik/thinking-orbs), used under its MIT license.

The two sources are identified in the exported animation catalog. Full attribution is shipped in `THIRD_PARTY_NOTICES.md` and retained in source distributions.

## Rendering behavior

- Respects `prefers-reduced-motion`.
- Caps canvas pixel density at 2x.
- Uses compact density at 20–32 pixels and the full preset at larger sizes.
- Pauses work when the avatar or browser tab is not visible.
- Masks background, foreground motion, glow, and state effects to one circular boundary.
- Keeps relief and foreground motion independently configurable.
- Exposes a semantic `role="img"` label containing identity and state.

## Local development

From the repository root:

```bash
npm run test:package
npm run build
```

Maintainer release instructions live in `docs/npm-publishing.md` in the Orbsona repository.
