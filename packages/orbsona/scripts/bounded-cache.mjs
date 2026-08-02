import assert from "node:assert/strict";
import { BoundedCache } from "../dist/bounded-cache.js";

const cache = new BoundedCache(2);
cache.set("aster", 1);
cache.set("moss", 2);
assert.equal(cache.get("aster"), 1, "reading an entry keeps it recent");
cache.set("ember", 3);

assert.equal(cache.size, 2, "the cache must never exceed its configured limit");
assert.equal(cache.get("moss"), undefined, "the least-recently-used entry must be evicted");
assert.equal(cache.get("aster"), 1);
assert.equal(cache.get("ember"), 3);

assert.throws(() => new BoundedCache(0), /positive integer/);

console.log("Orbsona bounded cache test passed.");
