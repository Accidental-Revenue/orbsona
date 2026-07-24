"use client";

import { cn } from "@/lib/utils";

export type PreviewSize = "fit" | 256 | 128 | 64 | 32;

const previewSizes: Array<{ value: PreviewSize; label: string }> = [
  { value: "fit", label: "Fit" },
  { value: 256, label: "256" },
  { value: 128, label: "128" },
  { value: 64, label: "64" },
  { value: 32, label: "32" },
];

interface PreviewSizeControlProps {
  value: PreviewSize;
  onChange: (value: PreviewSize) => void;
}

export function PreviewSizeControl({ value, onChange }: PreviewSizeControlProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-neutral-500 xl:inline">Size</span>
      <div
        className="flex h-10 items-center gap-0.5 rounded-full border border-white/[0.1] bg-black/20 p-1"
        role="radiogroup"
        aria-label="Avatar preview size"
      >
        {previewSizes.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            aria-label={option.value === "fit" ? "Fit preview" : `${option.value} pixel preview`}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8 min-w-10 rounded-full px-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
              value === option.value
                ? "bg-white text-black"
                : "text-neutral-500 hover:bg-white/[0.06] hover:text-neutral-200",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
