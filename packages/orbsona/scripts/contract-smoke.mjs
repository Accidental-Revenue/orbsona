import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createIdentityDocument,
  identityFromSeed,
  initialIdentity,
  parseIdentityDocument,
  parseIdentityJson,
  serializeIdentity,
} from "../dist/index.js";
import { createMotionRuntime, updateMotion } from "../dist/orb-motion.js";

const document = createIdentityDocument(initialIdentity);
assert.equal(document.format, "orbsona.identity");
assert.equal(document.version, 1);
assert.deepEqual(parseIdentityJson(serializeIdentity(initialIdentity)), {
  success: true,
  data: document,
});

const wrongVersion = parseIdentityDocument({ ...document, version: 2 });
assert.equal(wrongVersion.success, false);
assert.equal(wrongVersion.error.code, "UNSUPPORTED_VERSION");

const invalidJson = parseIdentityJson("{");
assert.equal(invalidJson.success, false);
assert.equal(invalidJson.error.code, "INVALID_JSON");

const legacyIdentity = {
  name: initialIdentity.name,
  background: initialIdentity.background,
  animation: initialIdentity.animation,
  palette: initialIdentity.palette,
  seed: initialIdentity.seed,
};
assert.equal(parseIdentityDocument({
  format: "orbsona.identity",
  version: 1,
  identity: legacyIdentity,
}).success, true, "v1 identities created before background effects must remain valid");

const effectsIdentity = {
  ...initialIdentity,
  rotateBackground: true,
  grain: true,
};
assert.deepEqual(
  parseIdentityJson(serializeIdentity(effectsIdentity)),
  { success: true, data: createIdentityDocument(effectsIdentity) },
);
assert.equal(parseIdentityDocument({
  format: "orbsona.identity",
  version: 1,
  identity: { ...initialIdentity, grain: "yes" },
}).success, false);

assert.deepEqual(identityFromSeed(0), {
  seed: 0,
  background: "relief",
  animation: "field",
  palette: {
    id: "ion",
    name: "Ion",
    colors: ["#77c8ff", "#214bb4", "#e0f7ff"],
  },
}, "seed 0 must keep its published v1 identity mapping");
assert.deepEqual(identityFromSeed(4), {
  seed: 4,
  background: "relief",
  animation: "orbit",
  palette: {
    id: "ion",
    name: "Ion",
    colors: ["#77c8ff", "#214bb4", "#e0f7ff"],
  },
}, "seed 4 must keep its published v1 identity mapping");
assert.deepEqual(identityFromSeed(24), {
  seed: 24,
  background: "relief",
  animation: "field",
  palette: {
    id: "moss",
    name: "Moss",
    colors: ["#92d6b0", "#235848", "#e5fff0"],
  },
}, "seed 24 must keep its published v1 identity mapping");
assert.deepEqual(identityFromSeed(0xffffffff), {
  seed: 0xffffffff,
  background: "currents",
  animation: "wave",
  palette: {
    id: "ion",
    name: "Ion",
    colors: ["#77c8ff", "#214bb4", "#e0f7ff"],
  },
}, "the maximum v1 seed must keep its published identity mapping");

const v1Backgrounds = ["relief", "dunes", "strata", "currents"];
const v1Animations = ["field", "orbit", "globe", "wave", "solve", "pulse"];
const v1Palettes = ["ion", "moss", "ember", "mineral", "mono"];
for (let seed = 0; seed < 120; seed += 1) {
  const generated = identityFromSeed(seed);
  assert.equal(
    generated.background,
    v1Backgrounds[seed % v1Backgrounds.length],
    `seed ${seed} must preserve its v1 background`,
  );
  assert.equal(
    generated.animation,
    v1Animations[Math.floor(seed / v1Backgrounds.length) % v1Animations.length],
    `seed ${seed} must preserve its v1 animation`,
  );
  assert.equal(
    generated.palette.id,
    v1Palettes[
      Math.floor(seed / (v1Backgrounds.length * v1Animations.length)) % v1Palettes.length
    ],
    `seed ${seed} must preserve its v1 palette`,
  );
}

function settledFrame(state, signal) {
  const runtime = createMotionRuntime(state);
  let frame;
  for (let index = 0; index < 120; index += 1) {
    frame = updateMotion(runtime, state, 1 / 60, index / 60, initialIdentity.seed, false, signal, signal, signal);
  }
  return frame;
}

const quietIdle = settledFrame("idle", 0);
const energeticIdle = settledFrame("idle", 1);
assert.ok(energeticIdle.glow - quietIdle.glow > 0.3, "energy must visibly increase the glow");
assert.ok(energeticIdle.phase - quietIdle.phase > 0.25, "energy must visibly increase motion speed");
assert.ok(energeticIdle.scale - quietIdle.scale > 0.02, "energy must visibly affect idle scale");

const quietListening = settledFrame("listening", 0);
const energeticListening = settledFrame("listening", 1);
assert.ok(energeticListening.scale - quietListening.scale > 0.1, "input energy must visibly open the listening pose");

const rendererSource = readFileSync(new URL("../dist/react.js", import.meta.url), "utf8");
assert.doesNotMatch(rendererSource, /\bh-full\b|\bw-full\b/, "the published renderer must not require Tailwind CSS");
assert.match(rendererSource, /width:\s*"100%"/, "the canvas must size itself without consumer CSS");

console.log("Orbsona identity contract smoke test passed.");
