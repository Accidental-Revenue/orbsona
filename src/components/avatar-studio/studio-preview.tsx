"use client";

import { AvatarOrb } from "@/components/orb/avatar-orb";
import { AmbientSignalField } from "@/components/ui/ambient-signal-field";
import { AgentState, AvatarIdentity, states } from "@/lib/avatar";
import { cn } from "@/lib/utils";
import type { RefObject } from "react";
import type { PreviewSize } from "./preview-size-control";

const compactStateLabel: Record<(typeof states)[number]["id"], string> = {
  idle: "Idle",
  listening: "Listen",
  thinking: "Think",
  speaking: "Speak",
  working: "Work",
  success: "Done",
};

interface StudioPreviewProps {
  identity: AvatarIdentity;
  state: AgentState;
  previewSize: PreviewSize;
  canvasRootRef: RefObject<HTMLDivElement | null>;
  onStateChange: (state: AgentState) => void;
}

export function StudioPreview({
  identity,
  state,
  previewSize,
  canvasRootRef,
  onStateChange,
}: StudioPreviewProps) {
  return (
    <section aria-label="Avatar preview" className="preview-stage relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-[#0b0b0b]">
      <div className="preview-grid absolute inset-0" aria-hidden="true" />
      <AmbientSignalField />
      <div
        ref={canvasRootRef}
        className={cn(
          "relative z-[2] aspect-square transition-[width] duration-300 ease-out",
          previewSize === "fit" && "avatar-canvas-shell",
        )}
        style={previewSize === "fit" ? undefined : { width: previewSize }}
        data-studio-avatar
        data-preview-size={previewSize}
      >
        <AvatarOrb identity={identity} state={state} className="relative h-full w-full" />
      </div>

      <div className="absolute inset-x-3 bottom-3 z-10 sm:inset-x-auto sm:bottom-5">
        <div className="state-switcher grid grid-cols-6 gap-1 rounded-full border border-white/[0.12] bg-[#121212]/92 p-1.5 shadow-[0_12px_35px_rgba(0,0,0,0.4)] backdrop-blur-xl" role="radiogroup" aria-label="Agent state">
          {states.map((item) => (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-label={item.label}
              aria-checked={state === item.id}
              onClick={() => onStateChange(item.id)}
              className={cn(
                "h-10 min-w-0 rounded-full px-2 text-sm font-medium transition-[background-color,color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:px-3",
                state === item.id
                  ? "bg-white text-black"
                  : "text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-200",
              )}
            >
              <span className="sm:hidden">{compactStateLabel[item.id]}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
