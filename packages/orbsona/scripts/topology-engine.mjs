import assert from "node:assert/strict";
import { morphologies } from "../dist/index.js";
import {
  createTopologyPose,
  sampleTopology,
  topologyResolutionForSize,
} from "../dist/topology.js";

const idle = createTopologyPose("idle", 0.7, 2, 0, 0, 0, false);
assert.deepEqual(idle, createTopologyPose("idle", 0.7, 2, 0, 0, 0, false));

const signatures = new Map();
for (const { id } of morphologies) {
  const samples = [];
  for (let y = -0.8; y <= 0.8; y += 0.4) {
    for (let x = -0.8; x <= 0.8; x += 0.4) {
      const value = sampleTopology(id, x, y, 2718, idle);
      assert.equal(Number.isFinite(value), true, `${id} must return finite surface values`);
      assert.ok(value >= 0 && value <= 1, `${id} must stay normalized`);
      samples.push(value.toFixed(4));
    }
  }
  signatures.set(id, samples.join(","));
}
assert.equal(new Set(signatures.values()).size, morphologies.length, "every morphology needs a distinct surface signature");

const listening = createTopologyPose("listening", 1.2, 1, 0.9, 0, 0, false);
const thinking = createTopologyPose("thinking", 1.2, 1, 0, 0, 0.5, false);
const speaking = createTopologyPose("speaking", 1.2, 1, 0, 0.9, 0, false);
const working = createTopologyPose("working", 1.2, 1, 0, 0, 0.8, false);
const success = createTopologyPose("success", 1.2, 0.55, 0, 0, 0.5, false);
const error = createTopologyPose("error", 1.2, 1, 0, 0, 0.5, false);
assert.ok(listening.focus > idle.focus, "listening must gather the field toward input");
assert.ok(thinking.division > idle.division, "thinking must divide and reconnect contours");
assert.ok(speaking.pressure > idle.pressure, "speaking must send pressure through the surface");
assert.ok(working.flow > idle.flow, "working must accelerate directional channels");
assert.ok(success.alignment > idle.alignment, "success must align the field");
assert.ok(error.fracture > idle.fracture, "error must create a local displacement");

const reducedA = createTopologyPose("speaking", 1, 0.4, 0, 0.8, 0, true);
const reducedB = createTopologyPose("speaking", 8, 3.4, 0, 0.8, 0, true);
assert.equal(reducedA.time, reducedB.time, "reduced motion must hold the topology phase still");

assert.equal(topologyResolutionForSize(20), 40);
assert.equal(topologyResolutionForSize(32), 48);
assert.equal(topologyResolutionForSize(64), 72);
assert.equal(topologyResolutionForSize(128), 112);
assert.equal(topologyResolutionForSize(512), 144);

console.log("Orbsona Living Topographies engine test passed.");
