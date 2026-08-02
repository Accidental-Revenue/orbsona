"use client";

import { IconRefresh } from "@tabler/icons-react";
import {
  AvatarIdentity,
  AvatarMaterial,
  AvatarMorphology,
  materials,
  morphologies,
  Palette,
  palettes,
} from "@/lib/avatar";
import { cn } from "@/lib/utils";

interface StudioControlsProps {
  identity: AvatarIdentity;
  error: string;
  onChange: (change: Partial<AvatarIdentity>) => void;
  onRandomize: () => void;
  onRegenerateSeed: () => void;
}

export function StudioControls({
  identity,
  error,
  onChange,
  onRandomize,
  onRegenerateSeed,
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
        <legend className="mb-3 text-sm font-medium text-neutral-300">Morphology</legend>
        <div className="grid grid-cols-2 gap-2">
          {morphologies.map((morphology) => (
            <button
              key={morphology.id}
              type="button"
              title={morphology.description}
              aria-pressed={identity.morphology === morphology.id}
              onClick={() => onChange({ morphology: morphology.id as AvatarMorphology })}
              className={cn(
                "flex h-12 items-center gap-2.5 rounded-xl border px-3 text-left text-sm transition-[border-color,background-color,color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                identity.morphology === morphology.id
                  ? "border-white/25 bg-white/[0.08] text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-neutral-200",
              )}
            >
              <span className={cn("morphology-mark", `morphology-${morphology.id}`)} aria-hidden="true" />
              <span className="block truncate font-medium">{morphology.name}</span>
            </button>
          ))}
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
        <legend className="mb-3 text-sm font-medium text-neutral-300">Material</legend>
        <div className="grid grid-cols-4 gap-2">
          {materials.map((material) => (
            <button
              key={material.id}
              type="button"
              title={material.description}
              aria-pressed={identity.material === material.id}
              onClick={() => onChange({ material: material.id as AvatarMaterial })}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-2 rounded-xl border px-2 text-sm transition-[border-color,background-color,color,transform] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                identity.material === material.id
                  ? "border-white/25 bg-white/[0.08] text-white"
                  : "border-white/[0.08] bg-white/[0.02] text-neutral-400 hover:border-white/20 hover:text-neutral-200",
              )}
            >
              <span className={cn("material-mark", `material-${material.id}`)} aria-hidden="true" />
              <span className="shrink-0 font-medium">{material.name}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-2.5">
        <label htmlFor="identity-seed" className="text-sm font-medium text-neutral-300">
          Identity seed
          <span className="mt-1 block text-xs font-normal leading-5 text-neutral-500">
            Reproduces the same terrain and motion phase on every device.
          </span>
        </label>
        <div className="grid grid-cols-[minmax(0,1fr)_48px] gap-2">
          <input
            id="identity-seed"
            aria-label="Identity seed"
            className="studio-input font-mono tabular-nums"
            type="number"
            inputMode="numeric"
            min={0}
            max={0xffffffff}
            step={1}
            value={identity.seed}
            onChange={(event) => {
              const seed = Number(event.target.value);
              if (Number.isInteger(seed) && seed >= 0 && seed <= 0xffffffff) {
                onChange({ seed });
              }
            }}
          />
          <button
            type="button"
            aria-label="Generate a new identity seed"
            title="Generate a new identity seed"
            onClick={onRegenerateSeed}
            className="grid h-12 w-12 place-items-center rounded-xl border border-white/[0.12] bg-white/[0.04] text-neutral-300 transition-[border-color,background-color,transform] hover:border-white/25 hover:bg-white/[0.08] hover:text-white active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <IconRefresh aria-hidden="true" size={17} stroke={1.8} />
          </button>
        </div>
      </div>

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
