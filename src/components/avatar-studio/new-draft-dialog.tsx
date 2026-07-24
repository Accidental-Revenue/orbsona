"use client";

import { IconRefresh, IconX } from "@tabler/icons-react";
import { useEffect, useRef } from "react";

interface NewDraftDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function NewDraftDialog({ open, onClose, onConfirm }: NewDraftDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="new-draft-title"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[min(460px,calc(100vw-32px))] rounded-3xl border border-white/[0.14] bg-neutral-950 p-0 text-neutral-100 shadow-[0_28px_90px_rgba(0,0,0,0.7)] backdrop:bg-black/75"
    >
      <div className="flex items-start justify-between gap-4 border-b border-white/[0.1] px-6 py-5">
        <div>
          <p className="text-sm font-medium text-neutral-500">Browser draft</p>
          <h2 id="new-draft-title" className="mt-1 font-display text-2xl font-semibold tracking-[-0.035em]">
            Start a new draft?
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close new draft dialog"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/[0.1] text-neutral-400 transition-colors hover:border-white/20 hover:bg-white/[0.05] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          <IconX size={18} aria-hidden="true" />
        </button>
      </div>

      <div className="p-6">
        <p className="text-sm leading-6 text-neutral-400">
          This returns Studio to the Aster example and clears the draft saved in this browser. Download the identity file first if you want to keep it.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="identity-action px-5">
            Keep draft
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-neutral-100 px-5 text-sm font-medium text-neutral-950 transition-[background-color,transform] hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <IconRefresh size={17} aria-hidden="true" />
            Start fresh
          </button>
        </div>
      </div>
    </dialog>
  );
}
