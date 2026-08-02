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

The renderer accepts a stable identity and a live semantic state. Identity controls recognition; state and signal levels control behavior.

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

Provider events should be mapped into these states at the application boundary. This keeps the avatar independent from any single voice or agent SDK.

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
    "morphology": "basin",
    "material": "mineral",
    "palette": {
      "id": "ion",
      "name": "Ion",
      "colors": ["#77c8ff", "#214bb4", "#e0f7ff"]
    },
    "seed": 2718
  }
}
```

Use `parseIdentityJson` at import boundaries. It returns a discriminated result instead of throwing for invalid files. PNG and WebM are fallback assets; the identity document is the source of truth for live runtimes.

Version 2 separates shape from surface. `morphology` selects one of eight original terrain generators. `material` selects Mineral, Glass, Ink, or Frost shading. Version 1 files remain importable and are migrated to the closest v2 combination by `parseIdentityJson`.

## Rendering behavior

- Respects `prefers-reduced-motion`.
- Caps canvas pixel density at 2x.
- Uses bounded topology resolutions tuned for legibility from 20 to 512 CSS pixels.
- Pauses work when the avatar or browser tab is not visible.
- Masks the complete composition to a circular export boundary.
- Deforms the same topology for every runtime state. Listening gathers, thinking divides, speaking sends pressure, working creates flow, success aligns, and error fractures.
- Exposes a semantic `role="img"` label containing identity and state.

The topology generation, material renderer, state grammar, and seed mapping are implemented in Orbsona. The runtime has no visual-preset dependency.

## Local development

From the repository root:

```bash
npm run test:package
npm run build
```

Maintainer release instructions live in `docs/npm-publishing.md` in the Orbsona repository.
