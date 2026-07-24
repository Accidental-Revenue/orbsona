export const ORBSONA_IDENTITY_FORMAT = "orbsona.identity" as const;
export const ORBSONA_IDENTITY_VERSION = 1 as const;

export type AvatarBackground = "relief" | "dunes" | "strata" | "currents";
export type AvatarAnimation = "field" | "orbit" | "globe" | "wave" | "solve" | "pulse";
export type AgentState =
  | "idle"
  | "connecting"
  | "listening"
  | "thinking"
  | "speaking"
  | "working"
  | "success"
  | "error";

export interface Palette {
  id: string;
  name: string;
  colors: [string, string, string];
}

export interface AvatarIdentity {
  name: string;
  background: AvatarBackground;
  /** Slowly rotate the relief layer behind the foreground animation. */
  rotateBackground?: boolean;
  /** Add a deterministic, pixel-grain finish to the relief layer. */
  grain?: boolean;
  animation: AvatarAnimation;
  palette: Palette;
  seed: number;
}

export interface OrbsonaIdentityDocument {
  format: typeof ORBSONA_IDENTITY_FORMAT;
  version: typeof ORBSONA_IDENTITY_VERSION;
  identity: AvatarIdentity;
}

export type IdentityDocumentErrorCode =
  | "INVALID_JSON"
  | "INVALID_FORMAT"
  | "UNSUPPORTED_VERSION"
  | "INVALID_IDENTITY";

export type IdentityDocumentResult =
  | { success: true; data: OrbsonaIdentityDocument }
  | {
      success: false;
      error: {
        code: IdentityDocumentErrorCode;
        message: string;
      };
    };

export const palettes: Palette[] = [
  { id: "ion", name: "Ion", colors: ["#77c8ff", "#214bb4", "#e0f7ff"] },
  { id: "moss", name: "Moss", colors: ["#92d6b0", "#235848", "#e5fff0"] },
  { id: "ember", name: "Ember", colors: ["#ffb07c", "#9f3f30", "#fff0d8"] },
  { id: "mineral", name: "Mineral", colors: ["#c1b5ff", "#504281", "#f4f0ff"] },
  { id: "mono", name: "Mono", colors: ["#dddddd", "#414141", "#ffffff"] },
];

export const backgrounds: Array<{ id: AvatarBackground; name: string }> = [
  { id: "relief", name: "Relief" },
  { id: "dunes", name: "Dunes" },
  { id: "strata", name: "Strata" },
  { id: "currents", name: "Currents" },
];

export const animations: Array<{
  id: AvatarAnimation;
  name: string;
  description: string;
  badge?: "New";
}> = [
  { id: "field", name: "Field", description: "Undulating multi-band sash" },
  { id: "orbit", name: "Orbit", description: "Particles on tilted orbits" },
  { id: "globe", name: "Globe", description: "Scanning dotted meridians" },
  { id: "wave", name: "Wave", description: "Rolling latitude waveform" },
  { id: "solve", name: "Solve", description: "Reorganizing spherical bands" },
  { id: "pulse", name: "Pulse", description: "Concentric signal rings", badge: "New" },
];

export const states: Array<{
  id: Exclude<AgentState, "connecting" | "error">;
  label: string;
  description: string;
}> = [
  { id: "idle", label: "Idle", description: "A slow, recognizable breath" },
  { id: "listening", label: "Listening", description: "Opens toward the user" },
  { id: "thinking", label: "Thinking", description: "Internal systems reorganize" },
  { id: "speaking", label: "Speaking", description: "Energy follows the voice" },
  { id: "working", label: "Working", description: "Tool activity leaves a trace" },
  { id: "success", label: "Success", description: "A brief alignment and release" },
];

export const runtimeStates: Array<{
  id: AgentState;
  label: string;
  description: string;
}> = [
  { id: "idle", label: "Idle", description: "Available and waiting" },
  { id: "connecting", label: "Connecting", description: "Establishing a live session" },
  { id: "listening", label: "Listening", description: "Receiving user input" },
  { id: "thinking", label: "Thinking", description: "Reasoning before responding" },
  { id: "speaking", label: "Speaking", description: "Returning voice output" },
  { id: "working", label: "Working", description: "Calling a tool or completing a task" },
  { id: "success", label: "Success", description: "The requested action completed" },
  { id: "error", label: "Error", description: "The session needs attention" },
];

export const initialIdentity: AvatarIdentity = {
  name: "Aster",
  background: "relief",
  rotateBackground: false,
  grain: false,
  animation: "field",
  palette: palettes[0],
  seed: 2718,
};

const backgroundIds = new Set<AvatarBackground>(backgrounds.map(({ id }) => id));
const animationIds = new Set<AvatarAnimation>(animations.map(({ id }) => id));
const colorPattern = /^#[0-9a-f]{6}$/i;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPalette(value: unknown): value is Palette {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") return false;
  return Array.isArray(value.colors)
    && value.colors.length === 3
    && value.colors.every((color) => typeof color === "string" && colorPattern.test(color));
}

export function isAvatarIdentity(value: unknown): value is AvatarIdentity {
  if (!isRecord(value)) return false;
  return typeof value.name === "string"
    && value.name.trim().length > 0
    && value.name.length <= 64
    && typeof value.background === "string"
    && backgroundIds.has(value.background as AvatarBackground)
    && (value.rotateBackground === undefined || typeof value.rotateBackground === "boolean")
    && (value.grain === undefined || typeof value.grain === "boolean")
    && typeof value.animation === "string"
    && animationIds.has(value.animation as AvatarAnimation)
    && isPalette(value.palette)
    && typeof value.seed === "number"
    && Number.isInteger(value.seed)
    && value.seed >= 0
    && value.seed <= 0xffffffff;
}

export function createIdentityDocument(identity: AvatarIdentity): OrbsonaIdentityDocument {
  if (!isAvatarIdentity(identity)) {
    throw new TypeError("Identity does not match the Orbsona v1 contract.");
  }
  return {
    format: ORBSONA_IDENTITY_FORMAT,
    version: ORBSONA_IDENTITY_VERSION,
    identity,
  };
}

export function parseIdentityDocument(value: unknown): IdentityDocumentResult {
  if (!isRecord(value) || value.format !== ORBSONA_IDENTITY_FORMAT) {
    return {
      success: false,
      error: { code: "INVALID_FORMAT", message: "This is not an Orbsona identity document." },
    };
  }
  if (value.version !== ORBSONA_IDENTITY_VERSION) {
    return {
      success: false,
      error: { code: "UNSUPPORTED_VERSION", message: `Identity version ${String(value.version)} is not supported.` },
    };
  }
  if (!isAvatarIdentity(value.identity)) {
    return {
      success: false,
      error: { code: "INVALID_IDENTITY", message: "The identity configuration is incomplete or invalid." },
    };
  }
  return { success: true, data: value as unknown as OrbsonaIdentityDocument };
}

export function parseIdentityJson(json: string): IdentityDocumentResult {
  try {
    return parseIdentityDocument(JSON.parse(json) as unknown);
  } catch {
    return {
      success: false,
      error: { code: "INVALID_JSON", message: "The identity file contains invalid JSON." },
    };
  }
}

export function serializeIdentity(identity: AvatarIdentity): string {
  return JSON.stringify(createIdentityDocument(identity), null, 2);
}

export function identityFromSeed(
  seed: number,
): Pick<AvatarIdentity, "background" | "animation" | "palette" | "seed"> {
  const normalizedSeed = seed >>> 0;
  return {
    seed: normalizedSeed,
    background: backgrounds[normalizedSeed % backgrounds.length].id,
    animation: animations[Math.floor(normalizedSeed / backgrounds.length) % animations.length].id,
    palette: palettes[
      Math.floor(normalizedSeed / (backgrounds.length * animations.length)) % palettes.length
    ],
  };
}
