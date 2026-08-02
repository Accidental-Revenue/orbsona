import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { topologyResolutionForSize } from "../dist/topology.js";

assert.equal(topologyResolutionForSize(20), 40);
assert.equal(topologyResolutionForSize(32), 48);
assert.equal(topologyResolutionForSize(64), 72);
assert.equal(topologyResolutionForSize(128), 112);
assert.equal(topologyResolutionForSize(512), 144);

const reactSource = await readFile(new URL("../dist/react.js", import.meta.url), "utf8");
const packageSource = await readFile(new URL("../package.json", import.meta.url), "utf8");
assert.ok(!reactSource.includes("thinking-orbs"), "the runtime must not import the retired preset library");
assert.ok(!packageSource.includes("thinking-orbs"), "the package must not ship the retired preset library");
assert.ok(reactSource.includes("paintTopologySurface"), "the React component must use Orbsona's topology renderer");

console.log("Orbsona launch regression test passed.");
