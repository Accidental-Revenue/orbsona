import {
  IconAccessible,
  IconCode,
  IconDatabaseOff,
  IconFileCode,
  IconLicense,
  IconMessages,
  IconPackage,
  IconRoute,
} from "@tabler/icons-react";
import type { Metadata } from "next";
import { ORBSONA_IDENTITY_FORMAT, ORBSONA_IDENTITY_VERSION, runtimeStates } from "@accidental-revenue/orbsona";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Documentation",
  description: "Understand the Orbsona identity format, runtime states, React API, and local-first ownership model.",
  alternates: {
    canonical: "/docs",
  },
};

const identityExample = `{
  "format": "${ORBSONA_IDENTITY_FORMAT}",
  "version": ${ORBSONA_IDENTITY_VERSION},
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
}`;

const principles = [
  {
    icon: IconMessages,
    title: "Communicate state",
    body: "A voice agent has long silent intervals. Motion shows whether it is listening, reasoning, speaking, using a tool, or waiting for help.",
  },
  {
    icon: IconRoute,
    title: "Preserve continuity",
    body: "The same visual identity can follow an agent across a call screen, support widget, dashboard, and embedded workflow.",
  },
  {
    icon: IconAccessible,
    title: "Support, do not replace, language",
    body: "Animation is an ambient signal. Product UI still needs labels, announcements, and explicit error messages for accessibility.",
  },
];

const projectFacts = [
  {
    icon: IconLicense,
    title: "MIT licensed",
    body: "The Studio and renderer are open source. You can use, modify, distribute, and ship them under the MIT License.",
  },
  {
    icon: IconDatabaseOff,
    title: "Local-first",
    body: "Studio saves one working draft in browser storage. There is no Orbsona account, database, cloud sync, or analytics service.",
  },
  {
    icon: IconCode,
    title: "Provider-neutral",
    body: "The package exposes semantic states. It does not bundle or claim first-party adapters for voice or agent providers.",
  },
];

const installCommands = [
  ["npm", "npm install @accidental-revenue/orbsona"],
  ["pnpm", "pnpm add @accidental-revenue/orbsona"],
  ["Yarn", "yarn add @accidental-revenue/orbsona"],
  ["Bun", "bun add @accidental-revenue/orbsona"],
];

const componentProps = [
  ["identity", "AvatarIdentity", "The stable visual configuration."],
  ["state", "AgentState", "The agent's current semantic state."],
  ["size", "number | string", "Rendered width and height."],
  ["energy", "number", "General signal level from 0 to 1."],
  ["inputLevel", "number", "Optional microphone or listening level."],
  ["outputLevel", "number", "Optional speech-output level."],
  ["className", "string", "Class name applied to the canvas wrapper."],
  ["style", "CSSProperties", "Inline styles applied to the canvas wrapper."],
];

export default function DocumentationPage() {
  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-neutral-900/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]">
      <header className="flex h-20 shrink-0 items-center border-b border-white/[0.1] px-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.035em] text-neutral-100">Documentation</h1>
          <p className="text-sm text-neutral-500">The open-source model, identity contract, and runtime API</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        <article className="mx-auto max-w-5xl pb-8">
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-6 sm:p-8">
            <p className="text-sm font-medium text-neutral-500">Open source · MIT · local-first</p>
            <h2 className="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-[-0.04em] text-neutral-100 sm:text-4xl">
              An agent identity is a stateful interface, not a profile image.
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-400">
              Orbsona separates a stable visual identity from live runtime state. The colors, relief, pattern, and seed remain recognizable while motion responds to what the agent is doing.
            </p>
          </div>

          <section className="mt-5 grid gap-3 lg:grid-cols-3" aria-label="Project model">
            {projectFacts.map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-5">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-neutral-300">
                  <Icon size={20} stroke={1.6} aria-hidden="true" />
                </span>
                <h2 className="mt-5 text-lg font-semibold text-neutral-100">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-neutral-500">{body}</p>
              </div>
            ))}
          </section>

          <section className="mt-8" aria-labelledby="install-package">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-neutral-300">
                <IconPackage size={20} stroke={1.6} aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-medium text-neutral-500">Public npm package · v0.1.0</p>
                <h2 id="install-package" className="font-display text-2xl font-semibold tracking-[-0.03em] text-neutral-100">Install the renderer</h2>
              </div>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-neutral-500">
              npm, pnpm, Yarn, and Bun install the same public <a href="https://www.npmjs.com/package/@accidental-revenue/orbsona" target="_blank" rel="noreferrer" className="font-mono text-xs text-neutral-300 underline decoration-white/20 underline-offset-4 hover:text-white">@accidental-revenue/orbsona</a> release. Choose the manager already used by your application.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {installCommands.map(([manager, command]) => (
                <div key={manager} className="rounded-xl border border-white/[0.1] bg-black/20 p-4">
                  <p className="text-xs font-medium uppercase tracking-[0.12em] text-neutral-600">{manager}</p>
                  <code className="mt-2 block overflow-x-auto font-mono text-sm text-neutral-300">{command}</code>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5" aria-labelledby="why-identity">
            <h2 id="why-identity" className="font-display text-2xl font-semibold tracking-[-0.03em] text-neutral-100">Why agents need identity</h2>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              {principles.map(({ icon: Icon, title, body }) => (
                <div key={title} className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-neutral-300">
                    <Icon size={20} stroke={1.6} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold text-neutral-100">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-500">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8" aria-labelledby="runtime-contract">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-500">Version 1</p>
                <h2 id="runtime-contract" className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-neutral-100">Runtime state contract</h2>
              </div>
              <code className="rounded-lg border border-white/[0.1] bg-black/20 px-3 py-2 font-mono text-xs text-neutral-400">AgentState</code>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.1]">
              <div className="grid grid-cols-[130px_minmax(0,1fr)] border-b border-white/[0.08] bg-white/[0.035] px-5 py-3 text-sm font-medium text-neutral-400">
                <span>State</span>
                <span>When to use it</span>
              </div>
              {runtimeStates.map((state) => (
                <div key={state.id} className="grid grid-cols-[130px_minmax(0,1fr)] border-b border-white/[0.07] px-5 py-3.5 text-sm last:border-b-0">
                  <code className="font-mono text-neutral-200">{state.id}</code>
                  <span className="text-neutral-500">{state.description}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8" aria-labelledby="component-api">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-500">React 18+ · ESM</p>
                <h2 id="component-api" className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-neutral-100">Component API</h2>
              </div>
              <Link href="/install" className="identity-action">Install package</Link>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border border-white/[0.1]">
              <div className="grid grid-cols-[120px_150px_minmax(0,1fr)] border-b border-white/[0.08] bg-white/[0.035] px-5 py-3 text-sm font-medium text-neutral-400">
                <span>Prop</span>
                <span>Type</span>
                <span>Purpose</span>
              </div>
              {componentProps.map(([name, type, purpose]) => (
                <div key={name} className="grid grid-cols-[120px_150px_minmax(0,1fr)] border-b border-white/[0.07] px-5 py-3.5 text-sm last:border-b-0">
                  <code className="font-mono text-neutral-200">{name}</code>
                  <code className="font-mono text-xs text-neutral-400">{type}</code>
                  <span className="text-neutral-500">{purpose}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" aria-labelledby="identity-file">
            <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-black/20">
              <div className="flex items-center gap-3 border-b border-white/[0.1] px-5 py-4">
                <IconFileCode size={20} stroke={1.6} className="text-neutral-400" aria-hidden="true" />
                <h2 id="identity-file" className="font-display text-xl font-semibold text-neutral-100">Portable identity file</h2>
              </div>
              <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-6 text-neutral-300"><code>{identityExample}</code></pre>
            </div>
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-5">
              <h3 className="font-display text-xl font-semibold text-neutral-100">Rendering guarantees</h3>
              <ul className="mt-4 grid gap-4 text-sm leading-6 text-neutral-500">
                <li><strong className="font-medium text-neutral-300">Reduced motion.</strong> Movement becomes restrained when the operating system requests it.</li>
                <li><strong className="font-medium text-neutral-300">Bounded rendering.</strong> The canvas caps pixel density to avoid unnecessary GPU work.</li>
                <li><strong className="font-medium text-neutral-300">Semantic state.</strong> Provider events map to a small, stable set of agent states.</li>
                <li><strong className="font-medium text-neutral-300">Versioned files.</strong> Import validation can reject incompatible identities safely.</li>
              </ul>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/[0.1] bg-white/[0.025] p-6 sm:p-8" aria-labelledby="where-it-lives">
            <p className="text-sm font-medium text-neutral-500">Ownership model</p>
            <h2 id="where-it-lives" className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-neutral-100">Your identity lives with your code.</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-neutral-400">
              Studio keeps one working draft in this browser so a refresh does not erase your work. Download the <code className="font-mono text-sm text-neutral-300">.orbsona.json</code> file and commit it with your application. That file is the portable source of truth, and you can import it back into Studio whenever you want to edit it.
            </p>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {[
                ["Create", "Tune one browser draft in Studio."],
                ["Own", "Download and version the identity file."],
                ["Run", "Map your agent events to semantic states."],
              ].map(([title, body], index) => (
                <div key={title} className="rounded-xl border border-white/[0.08] bg-black/15 p-4">
                  <span className="font-mono text-xs text-neutral-600">0{index + 1}</span>
                  <h3 className="mt-3 text-base font-semibold text-neutral-200">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-500">{body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 grid gap-5 lg:grid-cols-2" aria-label="Project boundaries">
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-6">
              <h2 className="font-display text-xl font-semibold text-neutral-100">Included today</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-neutral-500">
                <li>Visual Studio with one browser-saved working draft</li>
                <li>Import and export for versioned identity JSON</li>
                <li>React canvas renderer and TypeScript contract</li>
                <li>PNG and WebM fallback exports</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-6">
              <h2 className="font-display text-xl font-semibold text-neutral-100">Deliberately not included</h2>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-neutral-500">
                <li>User accounts, subscriptions, or a hosted backend</li>
                <li>Cloud identity storage or cross-device synchronization</li>
                <li>Analytics, telemetry, or identity uploads</li>
                <li>Provider-specific SDK adapters or hosted event relays</li>
              </ul>
            </div>
          </section>

          <section className="mt-8 rounded-2xl border border-white/[0.1] bg-white/[0.025] p-6 sm:p-8" aria-labelledby="license">
            <p className="text-sm font-medium text-neutral-500">License</p>
            <h2 id="license" className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-neutral-100">Build on it freely.</h2>
            <p className="mt-3 max-w-3xl text-base leading-7 text-neutral-400">
              Orbsona is distributed under the MIT License, including the repository-level Studio and the <code className="font-mono text-sm text-neutral-300">@accidental-revenue/orbsona</code> package. Keep the copyright and permission notice with copies or substantial portions of the software.
            </p>
            <a
              href="https://opensource.org/license/mit"
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex text-sm font-medium text-neutral-300 underline decoration-white/20 underline-offset-4 hover:text-white"
            >
              Read the MIT License
            </a>
          </section>
        </article>
      </div>
    </section>
  );
}
