import assert from "node:assert/strict";
import {
  COMPACT_AVATAR_BREAKPOINT,
  presetSizeForAvatar,
  resolveAnimationPreset,
} from "../dist/orb-presets.js";

assert.equal(COMPACT_AVATAR_BREAKPOINT, 40);
assert.equal(presetSizeForAvatar(20), 20);
assert.equal(presetSizeForAvatar(32), 20);
assert.equal(presetSizeForAvatar(39.99), 20);
assert.equal(presetSizeForAvatar(40), 64);
assert.equal(presetSizeForAvatar(64), 64);
assert.equal(presetSizeForAvatar(256), 64);

const compactOrbit = resolveAnimationPreset("orbit", 32);
const standardOrbit = resolveAnimationPreset("orbit", 64);
assert.equal(compactOrbit.presetSize, 20);
assert.equal(standardOrbit.presetSize, 64);
assert.ok(
  Number(compactOrbit.opts.orbitN) < Number(standardOrbit.opts.orbitN),
  "compact avatars must use the lower-density thinking-orbs preset",
);

const pulse = resolveAnimationPreset("pulse", 20);
assert.equal(pulse.mode, "pulse");
assert.equal(pulse.presetSize, 20);

console.log("Orbsona launch regression test passed.");
