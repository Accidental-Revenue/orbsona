import assert from "node:assert/strict";
import {
  createPhyllotaxisPoints,
  createRadiolariaMesh,
} from "../dist/nature-animations.js";

const phyllotaxis = createPhyllotaxisPoints(144, 2718);
assert.equal(phyllotaxis.length, 144);
assert.deepEqual(phyllotaxis, createPhyllotaxisPoints(144, 2718), "phyllotaxis must be deterministic");
assert.notDeepEqual(phyllotaxis, createPhyllotaxisPoints(144, 2719), "the seed must change the individual");
assert.ok(phyllotaxis.every(({ radius }) => radius >= 0 && radius <= 1));
assert.ok(phyllotaxis.every(({ angle }) => Number.isFinite(angle)));

const radiolaria = createRadiolariaMesh(72, 2718);
assert.equal(radiolaria.nodes.length, 72);
assert.deepEqual(radiolaria, createRadiolariaMesh(72, 2718), "radiolaria must be deterministic");
assert.ok(radiolaria.edges.length >= 72, "the shell needs enough edges to read as a lattice");
assert.ok(radiolaria.edges.length <= 216, "the shell must stay sparse enough for avatar sizes");
for (const node of radiolaria.nodes) {
  assert.ok(Math.abs(node.x ** 2 + node.y ** 2 + node.z ** 2 - 1) < 1e-6, "nodes lie on a sphere");
}
for (const [from, to] of radiolaria.edges) {
  assert.ok(from >= 0 && from < radiolaria.nodes.length);
  assert.ok(to > from && to < radiolaria.nodes.length);
}

console.log("Orbsona nature preset geometry test passed.");
