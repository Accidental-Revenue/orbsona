export const ORBSONA_IDENTITY_FORMAT = "orbsona.identity" as const;
export const ORBSONA_IDENTITY_VERSION = 2 as const;

export type AvatarBackground = "relief" | "dunes" | "strata" | "currents";
export type AvatarAnimation =
  | "phyllotaxis"
  | "radiolaria"
  | "field"
  | "orbit"
  | "globe"
  | "wave"
  | "solve"
  | "pulse";

/** @deprecated Unreleased topology-preview type retained only for draft migration. */
export type AvatarMorphology =
  | "basin"
  | "ridge"
  | "archipelago"
  | "fault"
  | "cellular"
  | "pleat"
  | "current"
  | "chorus";
/** @deprecated Unreleased topology-preview type retained only for draft migration. */
export type AvatarMaterial = "mineral" | "glass" | "ink" | "frost";

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
  /** Slowly rotate the relief layer behind the foreground organism. */
  rotateBackground?: boolean;
  /** Add a deterministic granular finish to the relief layer. */
  grain?: boolean;
  animation: AvatarAnimation;
  palette: Palette;
  seed: number;
}

export interface LegacyAvatarIdentityV1 {
  name: string;
  background: AvatarBackground;
  rotateBackground?: boolean;
  grain?: boolean;
  animation: Exclude<AvatarAnimation, "phyllotaxis" | "radiolaria">;
  palette: Palette;
  seed: number;
}

export interface TopologyPreviewIdentity {
  name: string;
  morphology: AvatarMorphology;
  material: AvatarMaterial;
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

export const backgrounds: Array<{
  id: AvatarBackground;
  name: string;
  description: string;
}> = [
  { id: "relief", name: "Relief", description: "Organic mineral terrain" },
  { id: "dunes", name: "Dunes", description: "Wind-shaped parallel ridges" },
  { id: "strata", name: "Strata", description: "Layered geological terraces" },
  { id: "currents", name: "Currents", description: "Directional flowing relief" },
];

export const animations: Array<{
  id: AvatarAnimation;
  name: string;
  description: string;
  origin: "orbsona" | "thinking-orbs";
  badge?: "New";
}> = [
  {
    id: "phyllotaxis",
    name: "Phyllotaxis",
    description: "Golden-angle growth found in flowers and seed heads",
    origin: "orbsona",
    badge: "New",
  },
  {
    id: "radiolaria",
    name: "Radiolaria",
    description: "A rotating lattice inspired by microscopic silica shells",
    origin: "orbsona",
    badge: "New",
  },
  { id: "field", name: "Field", description: "Undulating multi-band sash", origin: "thinking-orbs" },
  { id: "orbit", name: "Orbit", description: "Particles on tilted orbits", origin: "thinking-orbs" },
  { id: "globe", name: "Globe", description: "Scanning dotted meridians", origin: "thinking-orbs" },
  { id: "wave", name: "Wave", description: "Rolling latitude waveform", origin: "thinking-orbs" },
  { id: "solve", name: "Solve", description: "Reorganizing spherical bands", origin: "thinking-orbs" },
  { id: "pulse", name: "Pulse", description: "Concentric signal rings", origin: "orbsona" },
];

export const states: Array<{
  id: Exclude<AgentState, "connecting" | "error">;
  label: string;
  description: string;
}> = [
  { id: "idle", label: "Idle", description: "A slow, recognizable breath" },
  { id: "listening", label: "Listening", description: "Attention gathers toward the user" },
  { id: "thinking", label: "Thinking", description: "Internal systems reorganize" },
  { id: "speaking", label: "Speaking", description: "Energy propagates outward" },
  { id: "working", label: "Working", description: "Directional activity accelerates" },
  { id: "success", label: "Success", description: "The organism briefly synchronizes" },
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
const v1AnimationIds = new Set<LegacyAvatarIdentityV1["animation"]>([
  "field",
  "orbit",
  "globe",
  "wave",
  "solve",
  "pulse",
]);
const morphologyIds = new Set<AvatarMorphology>([
  "basin",
  "ridge",
  "archipelago",
  "fault",
  "cellular",
  "pleat",
  "current",
  "chorus",
]);
const materialIds = new Set<AvatarMaterial>(["mineral", "glass", "ink", "frost"]);
const colorPattern = /^#[0-9a-f]{6}$/i;

// The original derivation is a published v1 contract. Do not insert new items
// into these lists: an existing numeric seed must always resolve identically.
const V1_SEED_BACKGROUNDS = ["relief", "dunes", "strata", "currents"] as const;
const V1_SEED_ANIMATIONS = ["field", "orbit", "globe", "wave", "solve", "pulse"] as const;
const V1_SEED_PALETTES = ["ion", "moss", "ember", "mineral", "mono"] as const;
const V2_SEED_ANIMATIONS = ["phyllotaxis", "radiolaria", ...V1_SEED_ANIMATIONS] as const;

const topologyAnimation: Record<AvatarMorphology, AvatarAnimation> = {
  basin: "field",
  ridge: "field",
  archipelago: "orbit",
  fault: "solve",
  cellular: "globe",
  pleat: "wave",
  current: "pulse",
  chorus: "phyllotaxis",
};

const topologyBackground: Record<AvatarMaterial, AvatarBackground> = {
  mineral: "relief",
  glass: "currents",
  ink: "strata",
  frost: "dunes",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPalette(value: unknown): value is Palette {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") return false;
  return Array.isArray(value.colors)
    && value.colors.length === 3
    && value.colors.every((color) => typeof color === "string" && colorPattern.test(color));
}

function hasIdentityBasics(value: Record<string, unknown>) {
  return typeof value.name === "string"
    && value.name.trim().length > 0
    && value.name.length <= 64
    && isPalette(value.palette)
    && typeof value.seed === "number"
    && Number.isInteger(value.seed)
    && value.seed >= 0
    && value.seed <= 0xffffffff;
}

export function isAvatarIdentity(value: unknown): value is AvatarIdentity {
  if (!isRecord(value) || !hasIdentityBasics(value)) return false;
  return typeof value.background === "string"
    && backgroundIds.has(value.background as AvatarBackground)
    && typeof value.animation === "string"
    && animationIds.has(value.animation as AvatarAnimation)
    && (value.rotateBackground === undefined || typeof value.rotateBackground === "boolean")
    && (value.grain === undefined || typeof value.grain === "boolean");
}

export function isLegacyAvatarIdentityV1(value: unknown): value is LegacyAvatarIdentityV1 {
  if (!isRecord(value) || !hasIdentityBasics(value)) return false;
  return typeof value.background === "string"
    && backgroundIds.has(value.background as AvatarBackground)
    && typeof value.animation === "string"
    && v1AnimationIds.has(value.animation as LegacyAvatarIdentityV1["animation"])
    && (value.rotateBackground === undefined || typeof value.rotateBackground === "boolean")
    && (value.grain === undefined || typeof value.grain === "boolean");
}

export function isTopologyPreviewIdentity(value: unknown): value is TopologyPreviewIdentity {
  if (!isRecord(value) || !hasIdentityBasics(value)) return false;
  return typeof value.morphology === "string"
    && morphologyIds.has(value.morphology as AvatarMorphology)
    && typeof value.material === "string"
    && materialIds.has(value.material as AvatarMaterial);
}

export function migrateLegacyIdentityV1(identity: LegacyAvatarIdentityV1): AvatarIdentity {
  return {
    name: identity.name,
    background: identity.background,
    rotateBackground: identity.rotateBackground ?? false,
    grain: identity.grain ?? false,
    animation: identity.animation,
    palette: {
      ...identity.palette,
      colors: [...identity.palette.colors],
    },
    seed: identity.seed >>> 0,
  };
}

export function migrateTopologyPreviewIdentity(identity: TopologyPreviewIdentity): AvatarIdentity {
  return {
    name: identity.name,
    background: topologyBackground[identity.material],
    rotateBackground: identity.material === "glass",
    grain: identity.material === "frost",
    animation: topologyAnimation[identity.morphology],
    palette: {
      ...identity.palette,
      colors: [...identity.palette.colors],
    },
    seed: identity.seed >>> 0,
  };
}

export function createIdentityDocument(identity: AvatarIdentity): OrbsonaIdentityDocument {
  if (!isAvatarIdentity(identity)) {
    throw new TypeError("Identity does not match the Orbsona v2 contract.");
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

  if (value.version === 1) {
    if (!isLegacyAvatarIdentityV1(value.identity)) {
      return {
        success: false,
        error: { code: "INVALID_IDENTITY", message: "The legacy identity configuration is incomplete or invalid." },
      };
    }
    return { success: true, data: createIdentityDocument(migrateLegacyIdentityV1(value.identity)) };
  }

  if (value.version !== ORBSONA_IDENTITY_VERSION) {
    return {
      success: false,
      error: { code: "UNSUPPORTED_VERSION", message: `Identity version ${String(value.version)} is not supported.` },
    };
  }
  if (isAvatarIdentity(value.identity)) {
    return { success: true, data: value as unknown as OrbsonaIdentityDocument };
  }
  if (isTopologyPreviewIdentity(value.identity)) {
    return { success: true, data: createIdentityDocument(migrateTopologyPreviewIdentity(value.identity)) };
  }
  return {
    success: false,
    error: { code: "INVALID_IDENTITY", message: "The identity configuration is incomplete or invalid." },
  };
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
  return deriveIdentityFromSeed(seed, V1_SEED_ANIMATIONS);
}

/** Derive an identity from the expanded v2 catalog without remapping v1 seeds. */
export function identityFromSeedV2(
  seed: number,
): Pick<AvatarIdentity, "background" | "animation" | "palette" | "seed"> {
  return deriveIdentityFromSeed(seed, V2_SEED_ANIMATIONS);
}

function deriveIdentityFromSeed(
  seed: number,
  animationCatalog: readonly AvatarAnimation[],
): Pick<AvatarIdentity, "background" | "animation" | "palette" | "seed"> {
  const normalizedSeed = seed >>> 0;
  const background = V1_SEED_BACKGROUNDS[normalizedSeed % V1_SEED_BACKGROUNDS.length];
  const animation = animationCatalog[
    Math.floor(normalizedSeed / V1_SEED_BACKGROUNDS.length) % animationCatalog.length
  ];
  const paletteId = V1_SEED_PALETTES[
    Math.floor(normalizedSeed / (V1_SEED_BACKGROUNDS.length * animationCatalog.length))
      % V1_SEED_PALETTES.length
  ];
  const palette = palettes.find(({ id }) => id === paletteId);
  if (!palette) {
    throw new Error(`Orbsona palette "${paletteId}" is missing from the catalog.`);
  }

  return {
    seed: normalizedSeed,
    background,
    animation,
    palette: {
      ...palette,
      colors: [...palette.colors],
    },
  };
}
