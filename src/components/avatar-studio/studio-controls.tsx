"use client";

import { IconRefresh } from "@tabler/icons-react";
import {
  animations,
  AvatarAnimation,
  AvatarBackground,
  AvatarIdentity,
  backgrounds,
  Palette,
  palettes,
} from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface StudioControlsProps {
  identity: AvatarIdentity;
  error: string;
  onChange: (change: Partial<AvatarIdentity>) => void;
  onRandomize: () => void;
}

export function StudioControls({
  identity,
  error,
  onChange,
  onRandomize,
}: StudioControlsProps) {
  const nameInvalid = identity.name.trim().length === 0;

  return (
    <div className="flex min-w-0 flex-col gap-5 max-xl:gap-3">
      <label className="grid gap-2.5 text-sm font-medium text-neutral-300">
        <span>
          Agent name
          <span id="agent-name-purpose" className="mt-1 block text-xs font-normal leading-5 text-neutral-500">
            Used for the accessible label and export filename. It does not change the appearance.
          </span>
        </span>
        <input
          className="studio-input"
          value={identity.name}
          maxLength={64}
          placeholder="Aster"
          aria-label="Agent name"
          aria-describedby="agent-name-purpose"
          aria-invalid={nameInvalid}
          required
          onChange={(event) => onChange({ name: event.target.value })}
        />
        {nameInvalid && (
          <span className="text-sm font-normal text-red-300" role="alert">
            Enter an agent name to use or download this identity.
          </span>
        )}
      </label>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-neutral-300">Background</legend>
        <div className="grid grid-cols-4 gap-2">
          {backgrounds.map((background) => (
            <button
              key={background.id}
              type="button"
              aria-pressed={identity.background === background.id}
              onClick={() => onChange({ background: background.id as AvatarBackground })}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-2 rounded-xl border px-2 text-sm transition-[border-color,background-color,color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                identity.background === background.id
                  ? "border-white/25 bg-white/[0.08] text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-neutral-200",
              )}
            >
              <span className={cn("background-style-mark", `background-style-${background.id}`)} aria-hidden="true" />
              <span className="block truncate font-medium">{background.name}</span>
            </button>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <EffectCheckbox
            checked={identity.rotateBackground ?? false}
            label="Rotate"
            description="Slow circular drift"
            onChange={(checked) => onChange({ rotateBackground: checked })}
          />
          <EffectCheckbox
            checked={identity.grain ?? false}
            label="Grain"
            description="Granular texture"
            onChange={(checked) => onChange({ grain: checked })}
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-neutral-300">Palette</legend>
        <div className="grid grid-cols-5 gap-2">
          {palettes.map((palette) => (
            <PaletteButton
              key={palette.id}
              palette={palette}
              selected={identity.palette.id === palette.id}
              onClick={() => onChange({ palette })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-medium text-neutral-300">Animation</legend>
        <div className="grid grid-cols-3 gap-2">
          {animations.map((animation) => (
            <button
              key={animation.id}
              type="button"
              title={animation.description}
              aria-pressed={identity.animation === animation.id}
              onClick={() => onChange({ animation: animation.id as AvatarAnimation })}
              className={cn(
                "flex h-12 items-center justify-center gap-1.5 rounded-xl border px-1.5 text-sm transition-[border-color,background-color,color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                identity.animation === animation.id
                  ? "border-white/25 bg-white/[0.08] text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-neutral-200",
              )}
            >
              <span className={cn("animation-style-mark", `animation-style-${animation.id}`)} aria-hidden="true" />
              <span className="shrink-0 font-medium">{animation.name}</span>
              {animation.badge && (
                <span className="shrink-0 rounded-md border border-sky-300/20 bg-sky-300/[0.1] px-1 py-0.5 text-[11px] font-semibold leading-none text-sky-200">
                  {animation.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <button
          type="button"
          onClick={onRandomize}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-5 text-base font-medium text-neutral-200 transition-[border-color,background-color,transform] hover:border-white/25 hover:bg-white/[0.08] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <IconRefresh aria-hidden="true" size={17} stroke={1.8} />
          Randomize appearance
        </button>
        {error && (
            <p className="mt-3 text-sm leading-6 text-red-300" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function EffectCheckbox({
  checked,
  label,
  description,
  onChange,
}: {
  checked: boolean;
  label: string;
  description: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-2.5 transition-[border-color,background-color] hover:border-white/20 hover:bg-white/[0.04]">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="grid size-5 shrink-0 place-items-center rounded-md border border-white/20 bg-black/20 text-xs text-transparent transition-[border-color,background-color,color] peer-checked:border-white peer-checked:bg-white peer-checked:text-neutral-950 peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-neutral-900"
      >
        ✓
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-neutral-200">{label}</span>
        <span className="block truncate text-xs leading-5 text-neutral-500">{description}</span>
      </span>
    </label>
  );
}

function PaletteButton({
  palette,
  selected,
  onClick,
}: {
  palette: Palette;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={`${palette.name} palette`}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "flex h-11 items-center justify-center gap-1 rounded-xl border px-1 transition-[transform,background-color,border-color] hover:bg-white/[0.05] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
        selected ? "border-white/40 bg-white/[0.08]" : "border-white/[0.1] hover:border-white/25",
      )}
    >
      {palette.colors.map((color) => (
        <span
          key={color}
          className="h-[18px] w-[18px] rounded-full border border-black/20"
          style={{ backgroundColor: color }}
        />
      ))}
    </button>
  );
}
