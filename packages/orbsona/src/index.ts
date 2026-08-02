export const ORBSONA_IDENTITY_FORMAT = "orbsona.identity" as const;
export const ORBSONA_IDENTITY_VERSION = 2 as const;

export type AvatarMorphology =
  | "basin"
  | "ridge"
  | "archipelago"
  | "fault"
  | "cellular"
  | "pleat"
  | "current"
  | "chorus";
export type AvatarMaterial = "mineral" | "glass" | "ink" | "frost";

/** @deprecated Kept only to migrate Orbsona v1 identity documents. */
export type AvatarBackground = "relief" | "dunes" | "strata" | "currents";
/** @deprecated Kept only to migrate Orbsona v1 identity documents. */
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
  morphology: AvatarMorphology;
  material: AvatarMaterial;
  palette: Palette;
  seed: number;
}

export interface LegacyAvatarIdentityV1 {
  name: string;
  background: AvatarBackground;
  rotateBackground?: boolean;
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

export const morphologies: Array<{
  id: AvatarMorphology;
  name: string;
  description: string;
}> = [
  { id: "basin", name: "Basin", description: "Deep fields that gather toward a moving center" },
  { id: "ridge", name: "Ridge", description: "Layered contours that fold and reorganize" },
  { id: "archipelago", name: "Archipelago", description: "Raised islands that connect and dissolve" },
  { id: "fault", name: "Fault", description: "Offset plates with controlled shear" },
  { id: "cellular", name: "Cellular", description: "Breathing membrane-like regions" },
  { id: "pleat", name: "Pleat", description: "Soft fabric folds crossing the surface" },
  { id: "current", name: "Current", description: "Directional channels carrying signal" },
  { id: "chorus", name: "Chorus", description: "Many local fields moving in coordination" },
];

export const materials: Array<{
  id: AvatarMaterial;
  name: string;
  description: string;
}> = [
  { id: "mineral", name: "Mineral", description: "Dimensional shaded relief" },
  { id: "glass", name: "Glass", description: "Deep translucent refraction" },
  { id: "ink", name: "Ink", description: "Graphic contour bands" },
  { id: "frost", name: "Frost", description: "Soft granular diffusion" },
];

export const states: Array<{
  id: Exclude<AgentState, "connecting" | "error">;
  label: string;
  description: string;
}> = [
  { id: "idle", label: "Idle", description: "A slow, recognizable drift" },
  { id: "listening", label: "Listening", description: "The surface gathers toward input" },
  { id: "thinking", label: "Thinking", description: "Contours divide and reconnect" },
  { id: "speaking", label: "Speaking", description: "Pressure travels through the surface" },
  { id: "working", label: "Working", description: "Directional channels accelerate" },
  { id: "success", label: "Success", description: "Separate contours align" },
];

export const runtimeStates: Array<{
  id: AgentState;
  label: string;
  description: string;
}> = [
  { id: "idle", label: "Idle", description: "Available and waiting" },
  { id: "connecting", label: "Connecting", description: "Establishing a shared rhythm" },
  { id: "listening", label: "Listening", description: "Gathering toward user input" },
  { id: "thinking", label: "Thinking", description: "Dividing and reconnecting contours" },
  { id: "speaking", label: "Speaking", description: "Sending pressure through the surface" },
  { id: "working", label: "Working", description: "Driving energy through channels" },
  { id: "success", label: "Success", description: "Bringing the field into alignment" },
  { id: "error", label: "Error", description: "Holding a visible local displacement" },
];

export const initialIdentity: AvatarIdentity = {
  name: "Aster",
  morphology: "basin",
  material: "mineral",
  palette: palettes[0],
  seed: 2718,
};

const morphologyIds = new Set<AvatarMorphology>(morphologies.map(({ id }) => id));
const materialIds = new Set<AvatarMaterial>(materials.map(({ id }) => id));
const legacyBackgroundIds = new Set<AvatarBackground>(["relief", "dunes", "strata", "currents"]);
const legacyAnimationIds = new Set<AvatarAnimation>(["field", "orbit", "globe", "wave", "solve", "pulse"]);
const colorPattern = /^#[0-9a-f]{6}$/i;

const V2_SEED_MORPHOLOGIES = ["basin", "ridge", "archipelago", "fault", "cellular", "pleat", "current", "chorus"] as const;
const V2_SEED_MATERIALS = ["mineral", "glass", "ink", "frost"] as const;
const V2_SEED_PALETTES = ["ion", "moss", "ember", "mineral", "mono"] as const;

const legacyMorphology: Record<AvatarAnimation, AvatarMorphology> = {
  field: "ridge",
  orbit: "archipelago",
  globe: "cellular",
  wave: "current",
  solve: "pleat",
  pulse: "chorus",
};

const legacyMaterial: Record<AvatarBackground, AvatarMaterial> = {
  relief: "mineral",
  dunes: "frost",
  strata: "ink",
  currents: "glass",
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
  return typeof value.morphology === "string"
    && morphologyIds.has(value.morphology as AvatarMorphology)
    && typeof value.material === "string"
    && materialIds.has(value.material as AvatarMaterial);
}

export function isLegacyAvatarIdentityV1(value: unknown): value is LegacyAvatarIdentityV1 {
  if (!isRecord(value) || !hasIdentityBasics(value)) return false;
  return typeof value.background === "string"
    && legacyBackgroundIds.has(value.background as AvatarBackground)
    && typeof value.animation === "string"
    && legacyAnimationIds.has(value.animation as AvatarAnimation)
    && (value.rotateBackground === undefined || typeof value.rotateBackground === "boolean")
    && (value.grain === undefined || typeof value.grain === "boolean");
}

export function migrateLegacyIdentityV1(identity: LegacyAvatarIdentityV1): AvatarIdentity {
  return {
    name: identity.name,
    morphology: legacyMorphology[identity.animation],
    material: identity.grain ? "frost" : legacyMaterial[identity.background],
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
): Pick<AvatarIdentity, "morphology" | "material" | "palette" | "seed"> {
  const normalizedSeed = seed >>> 0;
  const morphology = V2_SEED_MORPHOLOGIES[normalizedSeed % V2_SEED_MORPHOLOGIES.length];
  const material = V2_SEED_MATERIALS[
    Math.floor(normalizedSeed / V2_SEED_MORPHOLOGIES.length) % V2_SEED_MATERIALS.length
  ];
  const paletteId = V2_SEED_PALETTES[
    Math.floor(
      normalizedSeed / (V2_SEED_MORPHOLOGIES.length * V2_SEED_MATERIALS.length),
    ) % V2_SEED_PALETTES.length
  ];
  const palette = palettes.find(({ id }) => id === paletteId);
  if (!palette) {
    throw new Error(`Orbsona v2 palette "${paletteId}" is missing from the catalog.`);
  }

  return {
    seed: normalizedSeed,
    morphology,
    material,
    palette: {
      ...palette,
      colors: [...palette.colors],
    },
  };
}
