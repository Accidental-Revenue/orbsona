"use client";

import { AgentAvatar } from "@accidental-revenue/orbsona/react";
import { IconActivityHeartbeat, IconBook2, IconCode, IconLayoutGrid } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { type AvatarIdentity, initialIdentity } from "@/lib/avatar";
import { IDENTITY_DRAFT_EVENT, readIdentityDraft } from "@/lib/identity-draft";

function IdentityThumbnail({
  identity,
  size,
  energy = 0.2,
}: {
  identity: AvatarIdentity;
  size: number;
  energy?: number;
}) {
  return (
    <span
      className="block shrink-0 overflow-hidden rounded-full border border-white/[0.16] bg-black/30 shadow-[0_0_18px_rgba(119,200,255,0.12)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <AgentAvatar
        identity={identity}
        state="idle"
        energy={energy}
        size="100%"
      />
    </span>
  );
}

function CurrentIdentity({ identity }: { identity: AvatarIdentity }) {
  return (
    <div data-browser-draft-preview className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3">
      <IdentityThumbnail identity={identity} size={44} />
      <div className="min-w-0">
        <p className="truncate text-base font-medium text-neutral-100">{identity.name || "Untitled avatar"}</p>
        <p className="truncate text-sm capitalize text-neutral-500">
          {identity.background} / {identity.animation}
        </p>
      </div>
    </div>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const [identity, setIdentity] = useState(initialIdentity);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    const update = () => {
      const draft = readIdentityDraft();
      setIdentity(draft ?? initialIdentity);
      setHasDraft(Boolean(draft));
    };
    update();
    window.addEventListener("storage", update);
    window.addEventListener(IDENTITY_DRAFT_EVENT, update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener(IDENTITY_DRAFT_EVENT, update);
    };
  }, []);

  return (
    <aside className="hidden min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-neutral-900/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)] xl:flex">
      <Link
        href="/"
        aria-label="Orbsona home"
        className="flex h-20 shrink-0 items-center gap-3 border-b border-white/[0.1] px-5 transition-colors hover:bg-white/[0.025] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
      >
        <IdentityThumbnail identity={initialIdentity} size={44} energy={0.28} />
        <div className="min-w-0">
          <p className="font-display truncate text-lg font-semibold tracking-[-0.025em] text-neutral-100">Orbsona</p>
          <p className="text-sm text-neutral-500">Agent identity</p>
        </div>
      </Link>

      <nav aria-label="Product" className="w-full px-3 py-5">
        <div className="grid gap-1">
          {[
            { href: "/", label: "Studio", icon: IconLayoutGrid },
            { href: "/playground", label: "Playground", icon: IconActivityHeartbeat },
            { href: "/install", label: "Install", icon: IconCode },
            { href: "/docs", label: "Documentation", icon: IconBook2 },
          ].map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={active
                  ? "flex h-12 items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.08] px-3.5 text-base font-medium text-neutral-100 transition-[border-color,background-color,transform] hover:border-white/25 hover:bg-white/[0.12] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  : "flex h-12 items-center gap-3 rounded-xl border border-transparent px-3.5 text-base font-medium text-neutral-400 transition-[border-color,background-color,color,transform] hover:border-white/[0.08] hover:bg-white/[0.05] hover:text-neutral-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"}
              >
                <Icon size={20} stroke={1.7} aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="mx-3 border-t border-white/[0.1] px-2 py-5">
        <div className="mb-3 flex items-center justify-between gap-3 px-1">
          <p className="text-sm font-medium text-neutral-500">Browser draft</p>
          <span className="text-xs text-neutral-600">{hasDraft ? "Saved locally" : "Example"}</span>
        </div>
        <CurrentIdentity identity={identity} />
        <p className="mt-3 px-1 text-xs leading-5 text-neutral-600">
          {hasDraft ? "Stored only in this browser." : "Make a change to start a local draft."}
        </p>
      </div>

      <div className="mt-auto border-t border-white/[0.1] p-4">
        <div className="rounded-xl px-2 py-2">
          <p className="text-sm font-medium text-neutral-300">Open source · MIT</p>
          <p className="mt-1 text-xs leading-5 text-neutral-600">By Accidental Revenue AI Labs</p>
        </div>
      </div>
    </aside>
  );
}

export function MobileNavigation() {
  return (
    <div className="flex h-16 items-center justify-between rounded-2xl border border-white/[0.1] bg-neutral-900/70 px-4 xl:hidden">
      <Link href="/" aria-label="Orbsona home" className="flex items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
        <IdentityThumbnail identity={initialIdentity} size={36} energy={0.28} />
        <span className="font-display text-lg font-semibold tracking-[-0.025em]">Orbsona</span>
      </Link>
      <div className="flex gap-1">
        <Link href="/" aria-label="Open Studio" className="grid h-10 w-10 place-items-center rounded-xl text-neutral-300 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <IconLayoutGrid size={19} stroke={1.7} aria-hidden="true" />
        </Link>
        <Link href="/playground" aria-label="Open Playground" className="grid h-10 w-10 place-items-center rounded-xl text-neutral-300 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <IconActivityHeartbeat size={19} stroke={1.7} aria-hidden="true" />
        </Link>
        <Link href="/install" aria-label="Open Install guide" className="grid h-10 w-10 place-items-center rounded-xl text-neutral-300 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <IconCode size={19} stroke={1.7} aria-hidden="true" />
        </Link>
        <Link href="/docs" aria-label="Open Documentation" className="grid h-10 w-10 place-items-center rounded-xl text-neutral-300 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          <IconBook2 size={19} stroke={1.7} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
