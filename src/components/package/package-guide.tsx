"use client";

import {
  IconBrackets,
  IconCheck,
  IconCopy,
  IconLockOpen,
  IconPackage,
} from "@tabler/icons-react";
import { useState } from "react";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const packageManagers: Array<{ id: PackageManager; label: string; command: string }> = [
  { id: "npm", label: "npm", command: "npm install @accidental-revenue/orbsona" },
  { id: "pnpm", label: "pnpm", command: "pnpm add @accidental-revenue/orbsona" },
  { id: "yarn", label: "Yarn", command: "yarn add @accidental-revenue/orbsona" },
  { id: "bun", label: "Bun", command: "bun add @accidental-revenue/orbsona" },
];

const componentExample = `import { AgentAvatar } from "@accidental-revenue/orbsona/react";
import type { AgentState } from "@accidental-revenue/orbsona";
import aster from "./aster.orbsona.json";

type AgentPresenceProps = {
  state: AgentState;
  inputLevel?: number;
  outputLevel?: number;
};

export function AgentPresence({
  state,
  inputLevel,
  outputLevel,
}: AgentPresenceProps) {
  return (
    <AgentAvatar
      identity={aster.identity}
      state={state}
      inputLevel={inputLevel}
      outputLevel={outputLevel}
      size={64}
    />
  );
}`;

const localCommands = `npm install
npm run test:package
npm run dev`;

export function PackageGuide() {
  const [packageManager, setPackageManager] = useState<PackageManager>("npm");
  const [copied, setCopied] = useState<"install" | "component" | "local" | null>(null);
  const [copyError, setCopyError] = useState("");
  const installCommand = packageManagers.find((manager) => manager.id === packageManager)?.command
    ?? packageManagers[0].command;

  async function copy(value: string, target: "install" | "component" | "local") {
    try {
      await navigator.clipboard.writeText(value);
      setCopyError("");
      setCopied(target);
      window.setTimeout(() => setCopied(null), 1_400);
    } catch {
      setCopyError("Copy is unavailable in this browser. Select the text manually.");
    }
  }

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-neutral-900/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]">
      <header className="flex h-20 shrink-0 items-center border-b border-white/[0.1] px-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.035em] text-neutral-100">Install Orbsona</h1>
          <p className="text-sm text-neutral-500">Add the live renderer to your React application</p>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/[0.1] bg-white/[0.04] text-neutral-300">
                  <IconPackage size={21} stroke={1.6} aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-medium text-neutral-500">React renderer</p>
                  <h2 className="mt-1 font-display text-2xl font-semibold tracking-[-0.03em] text-neutral-100">@accidental-revenue/orbsona</h2>
                </div>
              </div>
              <a
                href="https://www.npmjs.com/package/@accidental-revenue/orbsona"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-emerald-200/[0.18] bg-emerald-200/[0.06] px-3 py-1.5 text-xs font-medium text-emerald-100/85 transition-colors hover:border-emerald-200/30 hover:bg-emerald-200/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                v0.1.1 · public on npm
              </a>
            </div>
            <p className="mt-5 max-w-3xl text-base leading-7 text-neutral-400">
              The public package contains the identity contract, TypeScript types, and live React renderer. Every package manager below installs the same v0.1.1 release from npm.
            </p>
            <div className="mt-5 inline-flex flex-wrap rounded-xl border border-white/[0.1] bg-black/20 p-1" role="tablist" aria-label="Package manager">
              {packageManagers.map((manager) => (
                <button
                  key={manager.id}
                  type="button"
                  role="tab"
                  aria-selected={packageManager === manager.id}
                  onClick={() => setPackageManager(manager.id)}
                  className={`h-9 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                    packageManager === manager.id
                      ? "bg-white text-neutral-950"
                      : "text-neutral-500 hover:bg-white/[0.05] hover:text-neutral-200"
                  }`}
                >
                  {manager.label}
                </button>
              ))}
            </div>
            <CodeRow
              value={installCommand}
              copied={copied === "install"}
              onCopy={() => copy(installCommand, "install")}
            />
          </div>

          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <IconLockOpen size={20} stroke={1.6} className="text-neutral-400" aria-hidden="true" />
              <h2 className="font-display text-xl font-semibold text-neutral-100">Open source · MIT</h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-neutral-500">
              Use, modify, and ship the renderer under the MIT License. Orbsona has no account requirement, hosted identity store, telemetry, or vendor lock-in.
            </p>
            <dl className="mt-5 grid gap-3 border-t border-white/[0.08] pt-5 text-sm">
              <Fact label="Runtime" value="Browser canvas" />
              <Fact label="Framework" value="React 18+" />
              <Fact label="Module format" value="ESM" />
              <Fact label="Storage" value="Your application" />
            </dl>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="overflow-hidden rounded-2xl border border-white/[0.1] bg-black/20">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.1] p-5">
              <div>
                <h2 className="font-display text-xl font-semibold text-neutral-100">Render the identity</h2>
                <p className="mt-1 text-sm leading-6 text-neutral-500">Import the downloaded file and drive the generic state contract from your own application.</p>
              </div>
              <CopyButton
                copied={copied === "component"}
                label="Copy code"
                onClick={() => copy(componentExample, "component")}
              />
            </div>
            <pre className="max-h-[430px] overflow-auto p-5 font-mono text-[13px] leading-6 text-neutral-300"><code>{componentExample}</code></pre>
          </div>

          <div className="grid content-start gap-5">
            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-5">
              <div className="flex items-center gap-3">
                <IconBrackets size={20} stroke={1.6} className="text-neutral-400" aria-hidden="true" />
                <h2 className="font-display text-xl font-semibold text-neutral-100">What ships</h2>
              </div>
              <ul className="mt-4 grid gap-3 text-sm leading-6 text-neutral-500">
                <li>React canvas renderer and TypeScript props</li>
                <li>Versioned identity types, parser, and serializer</li>
                <li>Eight provider-neutral runtime states</li>
                <li>Reduced-motion and bounded rendering behavior</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display text-xl font-semibold text-neutral-100">Run the repository</h2>
                <a
                  href="https://github.com/Accidental-Revenue/orbsona"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-neutral-400 underline decoration-white/20 underline-offset-4 transition-colors hover:text-white"
                >
                  View source
                </a>
              </div>
              <p className="mt-2 text-sm leading-6 text-neutral-500">For contributors who want to build and test the repository locally.</p>
              <div className="mt-4 overflow-hidden rounded-xl border border-white/[0.1] bg-black/25">
                <div className="flex justify-end border-b border-white/[0.08] p-2">
                  <CopyButton
                    copied={copied === "local"}
                    label="Copy commands"
                    onClick={() => copy(localCommands, "local")}
                  />
                </div>
                <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-neutral-300"><code>{localCommands}</code></pre>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-white/[0.1] bg-white/[0.025] p-5 sm:p-6">
          <h2 className="font-display text-xl font-semibold text-neutral-100">Provider-neutral by design</h2>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-neutral-500">
            Orbsona stays independent from voice and agent providers. Your application maps connection, audio, and tool events to the small <code className="font-mono text-xs text-neutral-300">AgentState</code> contract, so the same identity can move between runtimes without changing its visual language.
          </p>
        </div>

        {copyError && <p role="alert" className="mt-3 text-sm text-red-300">{copyError}</p>}
      </div>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-neutral-500">{label}</dt>
      <dd className="font-medium text-neutral-300">{value}</dd>
    </div>
  );
}

function CodeRow({
  value,
  copied,
  onCopy,
}: {
  value: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-white/[0.1] bg-black/25 px-4 py-3">
      <code className="truncate font-mono text-sm text-neutral-300">{value}</code>
      <CopyButton copied={copied} label="Copy" onClick={onCopy} />
    </div>
  );
}

function CopyButton({
  copied,
  label,
  onClick,
}: {
  copied: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="identity-action shrink-0">
      {copied ? <IconCheck size={16} aria-hidden="true" /> : <IconCopy size={16} aria-hidden="true" />}
      {copied ? "Copied" : label}
    </button>
  );
}
