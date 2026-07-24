import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  createIdentityDocument,
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
