"use client";

import { AgentAvatar } from "@accidental-revenue/orbsona/react";
import { useEffect, useMemo, useState } from "react";
import {
  type AgentState,
  initialIdentity,
  runtimeStates,
} from "@/lib/avatar";
import { readCurrentIdentity } from "@/lib/identity-draft";
import { cn } from "@/lib/utils";

export function RuntimePlayground() {
  const [identity, setIdentity] = useState(initialIdentity);
  const [state, setState] = useState<AgentState>("idle");
  const [energy, setEnergy] = useState(0.42);
  const activeState = useMemo(
    () => runtimeStates.find((item) => item.id === state) ?? runtimeStates[0],
    [state],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setIdentity(readCurrentIdentity()), 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-neutral-900/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]">
      <header className="flex h-20 shrink-0 items-center border-b border-white/[0.1] px-6">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-[-0.035em] text-neutral-100">Playground</h1>
          <p className="text-sm text-neutral-500">Test the runtime contract before integrating a provider</p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="preview-stage relative grid min-h-0 place-items-center overflow-hidden border-b border-white/[0.1] bg-[#0b0b0b] xl:border-r xl:border-b-0">
          <div className="preview-grid absolute inset-0" aria-hidden="true" />
          <div className="relative z-[1] grid place-items-center">
            <AgentAvatar identity={identity} state={state} energy={energy} size={288} />
            <div className="mt-3 text-center">
              <p className="font-display text-xl font-semibold text-neutral-100">{activeState.label}</p>
              <p className="mt-1 text-sm text-neutral-500">{activeState.description}</p>
            </div>
          </div>
        </div>

        <aside className="min-h-0 overflow-y-auto p-5">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.025em] text-neutral-100">Runtime signal</h2>
            <p className="mt-1 text-sm leading-6 text-neutral-500">Provider events should set state. Audio levels should set energy.</p>
          </div>

          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-medium text-neutral-300">Agent state</legend>
            <div className="grid grid-cols-2 gap-2">
              {runtimeStates.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={state === item.id}
                  onClick={() => setState(item.id)}
                  className={cn(
                    "h-11 rounded-xl border px-3 text-left text-sm font-medium capitalize transition-[border-color,background-color,color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    state === item.id
                      ? "border-white/25 bg-white/[0.09] text-white"
                      : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-neutral-200",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="mt-6 grid gap-3 text-sm font-medium text-neutral-300">
            <span className="flex items-center justify-between">
              Signal energy
              <span className="font-mono text-neutral-500">{energy.toFixed(2)}</span>
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={energy}
              onChange={(event) => setEnergy(Number(event.target.value))}
              className="w-full accent-white"
            />
          </label>

          <div className="mt-6 rounded-xl border border-white/[0.1] bg-black/20 p-4">
            <p className="mb-3 text-sm font-medium text-neutral-300">Component input</p>
            <pre className="overflow-x-auto font-mono text-[13px] leading-6 text-neutral-400"><code>{`<AgentAvatar
  identity={identity}
  state="${state}"
  energy={${energy.toFixed(2)}}
  size={64}
/>`}</code></pre>
          </div>
        </aside>
      </div>
    </section>
  );
}
