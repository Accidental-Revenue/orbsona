"use client";

import { IconCheck, IconChevronDown, IconCopy } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

const packageManagers: Array<{
  id: PackageManager;
  label: string;
  command: string;
  accent: string;
}> = [
  {
    id: "npm",
    label: "npm",
    command: "npm install @accidental-revenue/orbsona",
    accent: "text-red-300",
  },
  {
    id: "pnpm",
    label: "pnpm",
    command: "pnpm add @accidental-revenue/orbsona",
    accent: "text-amber-300",
  },
  {
    id: "yarn",
    label: "Yarn",
    command: "yarn add @accidental-revenue/orbsona",
    accent: "text-sky-300",
  },
  {
    id: "bun",
    label: "Bun",
    command: "bun add @accidental-revenue/orbsona",
    accent: "text-rose-200",
  },
];

export function InstallCommand({ className = "" }: { className?: string }) {
  const [selectedId, setSelectedId] = useState<PackageManager>("npm");
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const copiedTimerRef = useRef<number | null>(null);
  const selected = packageManagers.find((manager) => manager.id === selectedId) ?? packageManagers[0];

  useEffect(() => {
    function closeOnOutsidePress(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
    };
  }, []);

  async function copyCommand() {
    try {
      await navigator.clipboard.writeText(selected.command);
      setCopyError("");
      setCopied(true);
      if (copiedTimerRef.current) window.clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = window.setTimeout(() => setCopied(false), 1_600);
    } catch {
      setCopyError("Copy is unavailable. Select the command and copy it manually.");
    }
  }

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <div className="flex min-h-14 w-full items-stretch overflow-hidden rounded-xl border border-white/[0.12] bg-black/30 shadow-[0_10px_30px_rgba(0,0,0,0.16)] transition-colors focus-within:border-white/[0.22]">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Package manager: ${selected.label}`}
          onClick={() => setOpen((value) => !value)}
          className="flex min-w-24 shrink-0 items-center gap-2.5 border-r border-white/[0.1] px-4 text-sm font-semibold text-neutral-200 transition-colors hover:bg-white/[0.055] focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        >
          <ManagerMark manager={selected.id} accent={selected.accent} />
          <span>{selected.label}</span>
          <IconChevronDown
            size={16}
            stroke={1.8}
            aria-hidden="true"
            className={`ml-auto text-neutral-500 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        <code className="min-w-0 flex-1 self-center truncate px-4 font-mono text-sm text-neutral-300 selection:bg-white/20">
          {selected.command}
        </code>

        <button
          type="button"
          onClick={copyCommand}
          aria-label={copied ? "Install command copied" : "Copy install command"}
          title={copied ? "Copied" : "Copy command"}
          className={`grid w-14 shrink-0 place-items-center border-l border-white/[0.1] transition-colors focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent ${
            copied
              ? "bg-emerald-300/[0.1] text-emerald-200"
              : "text-neutral-400 hover:bg-white/[0.055] hover:text-white"
          }`}
        >
          {copied ? <IconCheck size={19} stroke={2} aria-hidden="true" /> : <IconCopy size={19} stroke={1.7} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div
          role="listbox"
          aria-label="Choose a package manager"
          className="absolute left-0 top-[calc(100%+8px)] z-30 w-52 overflow-hidden rounded-xl border border-white/[0.13] bg-neutral-900 p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
        >
          {packageManagers.map((manager) => {
            const isSelected = selectedId === manager.id;
            return (
              <button
                key={manager.id}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setSelectedId(manager.id);
                  setOpen(false);
                  setCopied(false);
                }}
                className={`flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isSelected
                    ? "bg-white/[0.09] text-white"
                    : "text-neutral-400 hover:bg-white/[0.055] hover:text-neutral-100"
                }`}
              >
                <ManagerMark manager={manager.id} accent={manager.accent} />
                <span>{manager.label}</span>
                {isSelected && <IconCheck size={17} stroke={2} className="ml-auto" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}

      <p
        aria-live="polite"
        className={copyError ? "mt-2 text-xs text-red-300" : "sr-only"}
      >
        {copyError || (copied ? `${selected.command} copied` : "")}
      </p>
    </div>
  );
}

function ManagerMark({ manager, accent }: { manager: PackageManager; accent: string }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-5 min-w-5 place-items-center rounded border border-current/25 px-1 font-mono text-[9px] font-bold leading-none ${accent}`}
    >
      {manager === "pnpm" ? "pn" : manager.slice(0, 1).toUpperCase()}
    </span>
  );
}
