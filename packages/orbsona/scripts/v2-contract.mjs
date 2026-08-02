import assert from "node:assert/strict";
import {
  ORBSONA_IDENTITY_VERSION,
  animations,
  backgrounds,
  createIdentityDocument,
  identityFromSeed,
  identityFromSeedV2,
  initialIdentity,
  parseIdentityDocument,
} from "../dist/index.js";

assert.equal(ORBSONA_IDENTITY_VERSION, 2);
assert.deepEqual(
  backgrounds.map(({ id }) => id),
  ["relief", "dunes", "strata", "currents"],
  "v2 restores the four independent relief backgrounds",
);
assert.deepEqual(
  animations.map(({ id }) => id),
  ["phyllotaxis", "radiolaria", "field", "orbit", "globe", "wave", "solve", "pulse"],
  "v2 combines original nature presets with the licensed legacy collection",
);
assert.deepEqual(initialIdentity, {
  name: "Aster",
  background: "relief",
  rotateBackground: false,
  grain: false,
  animation: "field",
  palette: {
    id: "ion",
    name: "Ion",
    colors: ["#77c8ff", "#214bb4", "#e0f7ff"],
  },
  seed: 2718,
});

const document = createIdentityDocument(initialIdentity);
assert.equal(document.version, 2);
assert.equal("background" in document.identity, true);
assert.equal("animation" in document.identity, true);
assert.equal("morphology" in document.identity, false);

const migratedV1 = parseIdentityDocument({
  format: "orbsona.identity",
  version: 1,
  identity: {
    name: "Legacy Aster",
    background: "currents",
    rotateBackground: true,
    grain: true,
    animation: "wave",
    palette: initialIdentity.palette,
    seed: 2718,
  },
});
assert.equal(migratedV1.success, true);
assert.deepEqual(migratedV1.data, {
  format: "orbsona.identity",
  version: 2,
  identity: {
    name: "Legacy Aster",
    background: "currents",
    rotateBackground: true,
    grain: true,
    animation: "wave",
    palette: initialIdentity.palette,
    seed: 2718,
  },
});

const migratedTopologyPreview = parseIdentityDocument({
  format: "orbsona.identity",
  version: 2,
  identity: {
    name: "Preview Aster",
    morphology: "cellular",
    material: "glass",
    palette: initialIdentity.palette,
    seed: 3141,
  },
});
assert.equal(migratedTopologyPreview.success, true);
assert.deepEqual(migratedTopologyPreview.data.identity, {
  name: "Preview Aster",
  background: "currents",
  rotateBackground: true,
  grain: false,
  animation: "globe",
  palette: initialIdentity.palette,
  seed: 3141,
});

assert.equal(parseIdentityDocument({
  ...document,
  identity: { ...initialIdentity, background: "clouds" },
}).success, false);
assert.equal(parseIdentityDocument({
  ...document,
  identity: { ...initialIdentity, animation: "noise" },
}).success, false);

const expectedBackgrounds = ["relief", "dunes", "strata", "currents"];
const expectedLegacyAnimations = ["field", "orbit", "globe", "wave", "solve", "pulse"];
const expectedV2Animations = ["phyllotaxis", "radiolaria", "field", "orbit", "globe", "wave", "solve", "pulse"];
const expectedPalettes = ["ion", "moss", "ember", "mineral", "mono"];
for (let seed = 0; seed < 240; seed += 1) {
  const legacyIdentity = identityFromSeed(seed);
  assert.equal(legacyIdentity.background, expectedBackgrounds[seed % expectedBackgrounds.length]);
  assert.equal(
    legacyIdentity.animation,
    expectedLegacyAnimations[Math.floor(seed / expectedBackgrounds.length) % expectedLegacyAnimations.length],
    "identityFromSeed must preserve the published v1 derivation",
  );
  assert.equal(
    legacyIdentity.palette.id,
    expectedPalettes[
      Math.floor(seed / (expectedBackgrounds.length * expectedLegacyAnimations.length))
        % expectedPalettes.length
    ],
  );

  const v2Identity = identityFromSeedV2(seed);
  assert.equal(v2Identity.background, expectedBackgrounds[seed % expectedBackgrounds.length]);
  assert.equal(
    v2Identity.animation,
    expectedV2Animations[Math.floor(seed / expectedBackgrounds.length) % expectedV2Animations.length],
  );
}

console.log("Orbsona layered v2 identity contract test passed.");
