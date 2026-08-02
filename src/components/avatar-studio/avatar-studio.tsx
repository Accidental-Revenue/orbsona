"use client";

import {
  IconCode,
  IconDownload,
  IconFileImport,
  IconPlus,
  IconVideo,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import {
  AgentState,
  AvatarIdentity,
  identityFromSeedV2,
  initialIdentity,
  parseIdentityJson,
  serializeIdentity,
} from "@/lib/avatar";
import { StudioControls } from "./studio-controls";
import { StudioPreview } from "./studio-preview";
import { PreviewSizeControl, type PreviewSize } from "./preview-size-control";
import {
  clearIdentityDraft,
  readIdentityDraft,
  saveIdentityDraft,
} from "@/lib/identity-draft";
import { UseIdentityDialog } from "./use-identity-dialog";
import { NewDraftDialog } from "./new-draft-dialog";
import { AvatarOrb } from "@/components/orb/avatar-orb";

const RECORDING_DURATION_MS = 4_000;
const MAX_IDENTITY_FILE_BYTES = 128 * 1024;
const PNG_EXPORT_SIZE = 512;
const PNG_EXPORT_READY_FRAME_LIMIT = 30;
type StorageStatus = "example" | "saving" | "saved" | "unavailable";

function safeFilename(name: string) {
  const filename = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return filename || "orbsona-avatar";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.download = filename;
  anchor.href = url;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function createRandomSeed() {
  const seed = new Uint32Array(1);
  window.crypto.getRandomValues(seed);
  return seed[0];
}

export function AvatarStudio() {
  const [identity, setIdentity] = useState<AvatarIdentity>(initialIdentity);
  const [agentState, setAgentState] = useState<AgentState>("idle");
  const [error, setError] = useState("");
  const [previewSize, setPreviewSize] = useState<PreviewSize>(128);
  const [isRecording, setIsRecording] = useState(false);
  const [isPreparingPng, setIsPreparingPng] = useState(false);
  const [isUseDialogOpen, setIsUseDialogOpen] = useState(false);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [storageStatus, setStorageStatus] = useState<StorageStatus>("example");
  const stateTimerRef = useRef<number | undefined>(undefined);
  const recordingTimerRef = useRef<number | undefined>(undefined);
  const recordingRef = useRef<{ recorder: MediaRecorder; stream: MediaStream } | null>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRootRef = useRef<HTMLDivElement>(null);
  const pngCanvasRootRef = useRef<HTMLDivElement>(null);
  const hydratedRef = useRef(false);
  const draftDirtyRef = useRef(false);

  useEffect(() => () => {
    window.clearTimeout(stateTimerRef.current);
    window.clearTimeout(recordingTimerRef.current);
    const recording = recordingRef.current;
    if (recording?.recorder.state !== "inactive") recording?.recorder.stop();
    recording?.stream.getTracks().forEach((track) => track.stop());
  }, []);

  useEffect(() => {
    const draft = readIdentityDraft();
    const restoreTimer = window.setTimeout(() => {
      if (draft) {
        setIdentity(draft);
        setStorageStatus("saved");
      }
      hydratedRef.current = true;
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!hydratedRef.current || !draftDirtyRef.current) return;
    const saveTimer = window.setTimeout(() => {
      const saved = saveIdentityDraft(identity);
      draftDirtyRef.current = false;
      setStorageStatus(saved ? "saved" : "unavailable");
      if (!saved) {
        setError("This browser blocked local storage. Download the identity file before leaving the page.");
      }
    }, 280);
    return () => window.clearTimeout(saveTimer);
  }, [identity]);

  useEffect(() => {
    if (!isPreparingPng) return;

    let frame = 0;
    let attempts = 0;
    const finish = (message?: string) => {
      setIsPreparingPng(false);
      if (message) setError(message);
    };

    const exportWhenReady = () => {
      const source = pngCanvasRootRef.current?.querySelector<HTMLCanvasElement>(
        "[data-avatar-canvas] canvas",
      );
      if (!source || source.dataset.avatarReady !== "true") {
        attempts += 1;
        if (attempts >= PNG_EXPORT_READY_FRAME_LIMIT) {
          finish("The export renderer did not become ready. Try the PNG download again.");
          return;
        }
        frame = window.requestAnimationFrame(exportWhenReady);
        return;
      }

      const output = document.createElement("canvas");
      output.width = PNG_EXPORT_SIZE;
      output.height = PNG_EXPORT_SIZE;
      const context = output.getContext("2d");
      if (!context) {
        finish("The PNG image could not be created in this browser.");
        return;
      }
      context.clearRect(0, 0, PNG_EXPORT_SIZE, PNG_EXPORT_SIZE);
      context.drawImage(source, 0, 0, PNG_EXPORT_SIZE, PNG_EXPORT_SIZE);
      output.toBlob((blob) => {
        if (!blob) {
          finish("The PNG image could not be created. Try the export again.");
          return;
        }
        setError("");
        downloadBlob(blob, `${safeFilename(identity.name)}.png`);
        finish();
      }, "image/png");
    };

    frame = window.requestAnimationFrame(exportWhenReady);
    return () => window.cancelAnimationFrame(frame);
  }, [identity, isPreparingPng]);

  function updateIdentity(change: Partial<AvatarIdentity>) {
    draftDirtyRef.current = true;
    setStorageStatus("saving");
    setIdentity((current) => ({ ...current, ...change }));
    setError("");
  }

  function randomizeAppearance() {
    let randomized = identityFromSeedV2(createRandomSeed());
    for (let attempt = 0; attempt < 7; attempt += 1) {
      const hasChanged = randomized.background !== identity.background
        || randomized.animation !== identity.animation
        || randomized.palette.id !== identity.palette.id;
      if (hasChanged) break;
      randomized = identityFromSeedV2(createRandomSeed());
    }

    draftDirtyRef.current = true;
    setStorageStatus("saving");
    setIdentity((current) => ({ ...current, ...randomized }));
    setError("");
    setAgentState("success");
    window.clearTimeout(stateTimerRef.current);
    stateTimerRef.current = window.setTimeout(() => setAgentState("idle"), 1_100);
  }

  function regenerateSeed() {
    updateIdentity({ seed: createRandomSeed() });
  }

  async function importIdentity(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > MAX_IDENTITY_FILE_BYTES) {
      setError("That identity file is too large. Choose an Orbsona JSON file under 128 KB.");
      return;
    }
    try {
      const result = parseIdentityJson(await file.text());
      if (!result.success) {
        setError(result.error.message);
        return;
      }
      draftDirtyRef.current = true;
      setStorageStatus("saving");
      setIdentity(result.data.identity);
      setError("");
      setAgentState("success");
      window.clearTimeout(stateTimerRef.current);
      stateTimerRef.current = window.setTimeout(() => setAgentState("idle"), 1_100);
    } catch {
      setError("The selected identity file could not be read.");
    }
  }

  function startFresh() {
    const cleared = clearIdentityDraft();
    draftDirtyRef.current = false;
    setIdentity(initialIdentity);
    setStorageStatus(cleared ? "example" : "unavailable");
    setAgentState("idle");
    setError(cleared ? "" : "This browser blocked local storage. The current page was reset, but stored data could not be cleared.");
  }

  function exportPng() {
    if (!identity.name.trim()) {
      setError("Enter an agent name before downloading the PNG image.");
      return;
    }
    setError("");
    setIsPreparingPng(true);
  }

  async function exportWebm() {
    const canvas = previewCanvasRootRef.current?.querySelector<HTMLCanvasElement>("[data-avatar-canvas] canvas");
    if (!canvas || canvas.width <= 1 || canvas.height <= 1 || typeof canvas.captureStream !== "function" || typeof MediaRecorder === "undefined") {
      setError("Animated export is not supported by this browser. The live component and PNG fallback are still available.");
      return;
    }

    const mimeType = [
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ].find((type) => MediaRecorder.isTypeSupported(type));
    if (!mimeType) {
      setError("This browser cannot encode a WebM file. The live component and PNG fallback are still available.");
      return;
    }

    setError("");
    setIsRecording(true);
    const stream = canvas.captureStream(60);
    const chunks: Blob[] = [];

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4_000_000,
      });
      recordingRef.current = { recorder, stream };

      await new Promise<void>((resolve, reject) => {
        recorder.addEventListener("dataavailable", (event) => {
          if (event.data.size > 0) chunks.push(event.data);
        });
        recorder.addEventListener("stop", () => resolve(), { once: true });
        recorder.addEventListener("error", () => reject(new Error("The browser stopped the recording.")), { once: true });
        recorder.start(250);
        recordingTimerRef.current = window.setTimeout(() => {
          if (recorder.state !== "inactive") recorder.stop();
        }, RECORDING_DURATION_MS);
      });

      if (chunks.length === 0) throw new Error("No video frames were recorded.");
      downloadBlob(new Blob(chunks, { type: mimeType }), `${safeFilename(identity.name)}.webm`);
    } catch (recordingError) {
      setError(recordingError instanceof Error ? recordingError.message : "Animated export could not be completed.");
    } finally {
      window.clearTimeout(recordingTimerRef.current);
      stream.getTracks().forEach((track) => track.stop());
      recordingRef.current = null;
      setIsRecording(false);
    }
  }

  function exportJson() {
    if (!identity.name.trim()) {
      setError("Enter an agent name before downloading the identity file.");
      return;
    }
    const payload = serializeIdentity(identity);
    setError("");
    downloadBlob(new Blob([payload], { type: "application/json" }), `${safeFilename(identity.name)}.orbsona.json`);
  }

  return (
    <div
      id="studio-workspace"
      className="studio-shell grid h-full grid-rows-[minmax(0,1fr)_min(560px,34dvh)] gap-3 xl:grid-cols-[minmax(0,1fr)_400px] xl:grid-rows-1"
    >
      <section id="studio-preview" className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-neutral-900/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]">
        <header className="flex h-20 shrink-0 items-center justify-between border-b border-white/[0.1] px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <h1 className="font-display truncate text-2xl font-semibold tracking-[-0.035em] text-neutral-100">{identity.name || "Untitled avatar"}</h1>
              <p className="hidden text-sm text-neutral-500 sm:block" aria-live="polite">
                {storageStatus === "saved"
                  ? "Saved in this browser"
                  : storageStatus === "saving"
                    ? "Saving in this browser…"
                    : storageStatus === "unavailable"
                      ? "Browser storage unavailable"
                    : "Example identity. Changes save in this browser."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PreviewSizeControl value={previewSize} onChange={setPreviewSize} />
          </div>
        </header>

        <StudioPreview
          identity={identity}
          state={agentState}
          previewSize={previewSize}
          canvasRootRef={previewCanvasRootRef}
          onStateChange={setAgentState}
        />
      </section>

      <aside id="avatar-controls" className="inspector flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/[0.1] bg-neutral-900/60 shadow-[0_16px_50px_rgba(0,0,0,0.28)]">
        <div className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-white/[0.1] px-5 sm:h-20">
          <div>
            <h2 className="font-display text-xl font-semibold tracking-[-0.025em] text-neutral-100">Appearance</h2>
            <p className="hidden text-sm text-neutral-500 sm:block">Design your Orbsona live</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              ref={importInputRef}
              type="file"
              accept=".json,.orbsona.json,application/json"
              onChange={importIdentity}
              className="hidden"
              tabIndex={-1}
            />
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="identity-action"
            >
              <IconFileImport size={16} aria-hidden="true" />
              Import
            </button>
            <button
              type="button"
              onClick={() => setIsNewDialogOpen(true)}
              className="identity-action"
            >
              <IconPlus size={16} aria-hidden="true" />
              New
            </button>
          </div>
        </div>

        <div className="inspector-content min-h-0 flex-1 p-4 sm:p-5">
          <StudioControls
            identity={identity}
            error={error}
            onChange={updateIdentity}
            onRandomize={randomizeAppearance}
            onRegenerateSeed={regenerateSeed}
          />

          <div className="my-5 h-px bg-white/[0.1] max-xl:my-3" />
          <button
            type="button"
            onClick={() => setIsUseDialogOpen(true)}
            disabled={!identity.name.trim()}
            title={!identity.name.trim() ? "Enter an agent name first" : undefined}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-neutral-100 px-5 text-base font-medium text-neutral-950 transition-[background-color,transform] hover:bg-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-45"
          >
            <IconCode size={18} stroke={1.8} aria-hidden="true" />
            Add to your app
          </button>
          <p className="mt-3 text-center text-sm text-neutral-500">Download the identity file or embed the live component</p>
          <div id="export-actions" className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={exportWebm} disabled={isRecording} className="studio-action disabled:cursor-wait disabled:opacity-50">
              <IconVideo size={15} aria-hidden="true" /> {isRecording ? "Recording…" : "WebM clip"}
            </button>
            <button type="button" onClick={exportPng} disabled={isPreparingPng} className="studio-action disabled:cursor-wait disabled:opacity-50">
              <IconDownload size={15} aria-hidden="true" /> {isPreparingPng ? "Preparing…" : "PNG image"}
            </button>
          </div>
          <p className="sr-only" aria-live="polite">
            {isRecording ? "Recording a four second animated avatar" : ""}
          </p>
        </div>
      </aside>
      {isPreparingPng && (
        <div
          ref={pngCanvasRootRef}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: -1,
            width: PNG_EXPORT_SIZE,
            height: PNG_EXPORT_SIZE,
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <AvatarOrb identity={identity} state="idle" className="h-full w-full" />
        </div>
      )}
      <UseIdentityDialog
        identity={identity}
        open={isUseDialogOpen}
        onClose={() => setIsUseDialogOpen(false)}
        onDownloadJson={exportJson}
      />
      <NewDraftDialog
        open={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
        onConfirm={startFresh}
      />
    </div>
  );
}
