"use client";

import { IconCheck, IconCopy, IconDownload, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { type AvatarIdentity, serializeIdentity } from "@/lib/avatar";
import { cn } from "@/lib/utils";

type UseTab = "react" | "json";

interface UseIdentityDialogProps {
  identity: AvatarIdentity;
  open: boolean;
  onClose: () => void;
  onDownloadJson: () => void;
}

function componentSnippet(identity: AvatarIdentity) {
  const filename = identity.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "orbsona-avatar";
  return `import { AgentAvatar } from "@accidental-revenue/orbsona/react";
import type { AgentState } from "@accidental-revenue/orbsona";
import identity from "./${filename}.orbsona.json";

type AgentPresenceProps = {
  state: AgentState;
  voiceLevel: number;
};

export function AgentPresence({ state, voiceLevel }: AgentPresenceProps) {
  return (
    <AgentAvatar
      identity={identity.identity}
      state={state}
      energy={voiceLevel}
      size={64}
    />
  );
}`;
}

export function UseIdentityDialog({ identity, open, onClose, onDownloadJson }: UseIdentityDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [tab, setTab] = useState<UseTab>("react");
  const [copied, setCopied] = useState<"content" | null>(null);
  const [copyError, setCopyError] = useState("");
  const content = tab === "react"
    ? componentSnippet(identity)
    : identity.name.trim()
      ? serializeIdentity(identity)
      : "Enter an agent name before generating the identity document.";

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  async function copy(value: string, target: "content") {
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
    <dialog
      ref={dialogRef}
      aria-labelledby="use-identity-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto max-h-[calc(100dvh-32px)] w-[min(760px,calc(100vw-32px))] overflow-hidden rounded-3xl border border-white/[0.14] bg-neutral-950 p-0 text-neutral-100 shadow-[0_28px_90px_rgba(0,0,0,0.7)] backdrop:bg-black/75"
    >
      <div className="flex max-h-[calc(100dvh-32px)] flex-col">
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-white/[0.1] px-6 py-5">
          <div>
            <p className="text-sm font-medium text-neutral-500">Live React identity</p>
            <h2 id="use-identity-title" className="mt-1 font-display text-2xl font-semibold tracking-[-0.035em]">Add {identity.name || "this identity"} to your app</h2>
            <p className="mt-1 text-sm text-neutral-500">Keep the identity file with your source code and drive it with runtime state.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close use identity dialog" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.1] text-neutral-400 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <IconX size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.025] p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-base font-medium text-neutral-200">React renderer</p>
              <a
                href="https://www.npmjs.com/package/@accidental-revenue/orbsona"
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-emerald-200/[0.18] bg-emerald-200/[0.06] px-2.5 py-1 text-xs font-medium text-emerald-100/85 transition-colors hover:border-emerald-200/30 hover:bg-emerald-200/[0.1] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                Public on npm
              </a>
            </div>
            <p className="mt-1 text-sm leading-6 text-neutral-500">Install the live renderer from npm, then keep this identity file with your application code and drive it with runtime state.</p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/[0.1] bg-black/25 px-4 py-3">
              <code className="truncate font-mono text-sm text-neutral-300">npm install @accidental-revenue/orbsona</code>
              <span className="shrink-0 text-xs font-medium text-neutral-500">npm registry</span>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4">
            <div className="inline-flex rounded-xl border border-white/[0.1] bg-black/20 p-1" role="tablist" aria-label="Identity usage format">
              {(["react", "json"] as const).map((item) => (
                <button
                  key={item}
                  id={`identity-tab-${item}`}
                  type="button"
                  role="tab"
                  aria-selected={tab === item}
                  aria-controls="identity-usage-panel"
                  onClick={() => setTab(item)}
                  className={cn(
                    "h-10 rounded-lg px-4 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    tab === item ? "bg-white text-neutral-950" : "text-neutral-400 hover:bg-white/[0.05] hover:text-neutral-200",
                  )}
                >
                  {item === "json" ? "Identity JSON" : "React"}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => copy(content, "content")} className="identity-action">
              {copied === "content" ? <IconCheck size={16} aria-hidden="true" /> : <IconCopy size={16} aria-hidden="true" />}
              {copied === "content" ? "Copied" : "Copy code"}
            </button>
          </div>

          <pre
            id="identity-usage-panel"
            role="tabpanel"
            tabIndex={0}
            aria-labelledby={`identity-tab-${tab}`}
            className="mt-3 max-h-[320px] overflow-auto rounded-2xl border border-white/[0.1] bg-black/30 p-5 font-mono text-[13px] leading-6 text-neutral-300"
          >
            <code>{content}</code>
          </pre>
          {copyError && <p role="alert" className="mt-3 text-sm text-red-300">{copyError}</p>}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.1] pt-5">
            <div className="flex gap-4 text-sm">
              <Link href="/install" onClick={onClose} className="text-neutral-400 underline decoration-white/20 underline-offset-4 hover:text-white">Install guide</Link>
              <Link href="/docs" onClick={onClose} className="text-neutral-400 underline decoration-white/20 underline-offset-4 hover:text-white">Runtime contract</Link>
            </div>
            <button type="button" onClick={onDownloadJson} className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-100 px-5 text-sm font-medium text-neutral-950 transition-[background-color,transform] hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <IconDownload size={17} aria-hidden="true" />
              Download .orbsona.json
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}
