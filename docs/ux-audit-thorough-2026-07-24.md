# Orbsona UX audit

Date: 2026-07-24
Mode: thorough, production build
Primary persona: a developer adding a recognizable live identity to an AI or voice-agent interface

## Outcome

The implemented product journey is coherent and usable:

1. Design one local browser draft in Studio.
2. Preview the same identity at common avatar sizes and semantic states.
3. Download the versioned `.orbsona.json` source of truth.
4. Exercise the runtime state and energy contract in Playground.
5. Install the public React renderer and map application events to semantic states.

The app does not imply accounts, a cloud library, hosted persistence, analytics, or provider-specific adapters. The browser draft is a convenience cache; the downloaded identity file is the portable asset.

## Pages reviewed

| Page | Purpose | Result |
| --- | --- | --- |
| Studio `/` | Create, preview, import, reset, and export an identity | Pass |
| Playground `/playground` | Validate eight runtime states and signal energy | Pass |
| Install `/install` | Package-manager commands and React integration | Pass, public v0.1.0 install flow |
| Documentation `/docs` | Product model, contract, API, boundaries, and license | Pass |
| Legacy install route `/package` | Redirect to current Install page | Pass |
| Unknown route | Helpful recovery to Studio | Pass |

## Core workflow evidence

- One working draft autosaves to browser storage and survives reload.
- Storage failures are caught and reported instead of being presented as successful saves.
- Empty agent names block export and display an actionable validation message.
- Imported identity JSON restores the name, background, effects, palette, animation, and seed.
- Invalid JSON and files over 128 KB are rejected without destroying the current draft.
- Starting a new draft requires confirmation; cancel preserves the draft and confirm returns to the Aster example.
- Randomize changes the appearance while preserving a valid identity.
- All six Studio preview states remain non-empty and correctly selected.
- All eight runtime states render in Playground.
- Signal energy visibly changes the renderer and updates the example component input.
- Preview size controls work at Fit, 256, 128, 64, and 32; 128 is the default.
- The Browser draft thumbnail is a live renderer, not a placeholder.

## Export and integration evidence

- JSON export produced a valid `orbsona.identity` version 1 document.
- Generated React code uses a safe `identity` import identifier even when the agent name contains spaces, digits, emoji, or non-ASCII characters.
- PNG export produced a valid, non-blank 128 × 128 PNG with transparent pixels outside the circular mask.
- WebM export produced a valid non-empty EBML/WebM recording.
- npm, pnpm, Yarn, and Bun tabs produce the correct command for the same scoped package.
- Copy actions write the selected command and integration example to the clipboard.
- `@accidental-revenue/orbsona@0.1.0` installs from the public registry in a clean consumer.
- The package root and `/react` entry points import successfully from that clean install.

## Production copy re-audit

- Studio, Playground, Install, and Documentation contain no release-candidate, future-publication, former-name, placeholder, or internal-launch language.
- Install and Documentation describe v0.1.0 in the present tense and link to the public npm package.
- The repository README and maintainer publishing guide describe the verified public release.
- All four package-manager commands point to `@accidental-revenue/orbsona`.
- Page titles, headings, navigation labels, licensing, local-first boundaries, and provider-neutral claims are consistent across the application.
- Desktop and mobile route sweeps found no horizontal overflow, console warnings, or failed application requests.

## Layout and interaction

- Desktop was inspected at 1440 × 960 and 1280 × 800.
- Compact and mobile layouts were inspected at 1024 × 768, 768 × 900, and 375 × 812.
- The application shell remains viewport-bound; long page and inspector content scrolls inside its panel.
- No horizontal overflow was found.
- The dense canvas grid fills the preview stage and the avatar remains circularly masked.
- Navigation, page title hierarchy, typography, control alignment, active states, hover treatment, and card boundaries are consistent across pages.

## Accessibility

- All visible buttons and links have accessible names.
- Form controls have associated labels.
- Current navigation uses `aria-current`; state and size selectors expose selected state.
- Dialog tabs expose selection and dialogs close with Escape.
- Keyboard focus is visible across navigation and controls.
- The live renderer exposes a semantic image label containing identity name and state.
- Reduced-motion preference removes active animation while retaining a rendered identity.
- Motion is treated as a supporting signal; the UI also provides textual state labels and descriptions.

## Runtime quality

Measured for 2.5 seconds in Chrome at 1440 × 960:

- 151 animation frames
- 16.63 ms average frame interval
- 17.70 ms 95th-percentile frame interval
- 17.80 ms maximum frame interval
- zero long tasks

The renderer caps device pixel ratio, pauses when hidden or offscreen, and uses restrained frame rates for idle and active states.

## Scenario tests

| Scenario | Expected recovery | Result |
| --- | --- | --- |
| First visit | A complete example explains the product immediately | Pass |
| Interrupted editing | Reload restores the local draft | Pass |
| Wrong import | Error appears and the current draft survives | Pass |
| Destructive reset | Confirmation offers a safe cancel path | Pass |
| Day-two return | Browser draft and live sidebar thumbnail restore | Pass |
| Integration handoff | Identity JSON and provider-neutral React contract are available | Pass, public npm package verified |

## Remaining UX risk

There is no automated end-to-end browser suite in the repository yet. This audit exercised the workflows directly in Chrome, but CI should eventually preserve these checks for future releases.

The mistakenly published former npm package was unpublished after explicit maintainer approval. It is no longer installable and Orbsona contains no former-name references.
