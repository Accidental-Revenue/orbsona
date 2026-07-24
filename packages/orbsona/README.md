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
  "version": 1,
  "identity": {
    "name": "Aster",
    "background": "relief",
    "rotateBackground": false,
    "grain": false,
    "animation": "field",
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

`rotateBackground` enables a slow circular relief rotation. `grain` adds a deterministic granular finish without adding per-frame noise work. Both fields are optional and default to `false` when omitted.

## Rendering behavior

- Respects `prefers-reduced-motion`.
- Caps canvas pixel density at 2x.
- Uses a compact-density preset below 40 CSS pixels so small avatars remain legible.
- Pauses work when the avatar or browser tab is not visible.
- Masks the complete composition to a circular export boundary.
- Makes `energy` visible across every runtime state while preserving stronger input and output reactions in listening and speaking.
- Exposes a semantic `role="img"` label containing identity and state.

The motion primitives are built on the MIT-licensed [`thinking-orbs`](https://github.com/Jakubantalik/thinking-orbs) package by Jakub Antalik.

## Local development

From the repository root:

```bash
npm run test:package
npm run build
```

Maintainer release instructions live in `docs/npm-publishing.md` in the Orbsona repository.
