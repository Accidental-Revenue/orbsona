import assert from "node:assert/strict";
import {
  ORBSONA_IDENTITY_VERSION,
  createIdentityDocument,
  identityFromSeed,
  initialIdentity,
  materials,
  morphologies,
  parseIdentityDocument,
} from "../dist/index.js";

assert.equal(ORBSONA_IDENTITY_VERSION, 2);
assert.deepEqual(
  morphologies.map(({ id }) => id),
  ["basin", "ridge", "archipelago", "fault", "cellular", "pleat", "current", "chorus"],
  "v2 ships the original Living Topographies morphology catalog",
);
assert.deepEqual(
  materials.map(({ id }) => id),
  ["mineral", "glass", "ink", "frost"],
  "v2 ships four original surface materials",
);
assert.deepEqual(initialIdentity, {
  name: "Aster",
  morphology: "basin",
  material: "mineral",
  palette: {
    id: "ion",
    name: "Ion",
    colors: ["#77c8ff", "#214bb4", "#e0f7ff"],
  },
  seed: 2718,
});

const document = createIdentityDocument(initialIdentity);
assert.equal(document.version, 2);
assert.equal("background" in document.identity, false);
assert.equal("animation" in document.identity, false);

const migrated = parseIdentityDocument({
  format: "orbsona.identity",
  version: 1,
  identity: {
    name: "Legacy Aster",
    background: "currents",
    rotateBackground: true,
    grain: false,
    animation: "wave",
    palette: initialIdentity.palette,
    seed: 2718,
  },
});
assert.equal(migrated.success, true);
assert.deepEqual(migrated.data, {
  format: "orbsona.identity",
  version: 2,
  identity: {
    name: "Legacy Aster",
    morphology: "current",
    material: "glass",
    palette: initialIdentity.palette,
    seed: 2718,
  },
});

assert.equal(parseIdentityDocument({
  ...document,
  identity: { ...initialIdentity, morphology: "orbit" },
}).success, false);
assert.equal(parseIdentityDocument({
  ...document,
  identity: { ...initialIdentity, material: "particles" },
}).success, false);

const expectedMorphologies = ["basin", "ridge", "archipelago", "fault", "cellular", "pleat", "current", "chorus"];
const expectedMaterials = ["mineral", "glass", "ink", "frost"];
const expectedPalettes = ["ion", "moss", "ember", "mineral", "mono"];
for (let seed = 0; seed < 160; seed += 1) {
  const identity = identityFromSeed(seed);
  assert.equal(identity.morphology, expectedMorphologies[seed % expectedMorphologies.length]);
  assert.equal(
    identity.material,
    expectedMaterials[Math.floor(seed / expectedMorphologies.length) % expectedMaterials.length],
  );
  assert.equal(
    identity.palette.id,
    expectedPalettes[
      Math.floor(seed / (expectedMorphologies.length * expectedMaterials.length))
        % expectedPalettes.length
    ],
  );
}

console.log("Orbsona v2 identity contract test passed.");
