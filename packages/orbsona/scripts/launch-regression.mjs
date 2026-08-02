import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const reactSource = await readFile(new URL("../dist/react.js", import.meta.url), "utf8");
const packageSource = await readFile(new URL("../package.json", import.meta.url), "utf8");
const notices = await readFile(new URL("../THIRD_PARTY_NOTICES.md", import.meta.url), "utf8");

assert.ok(reactSource.includes("paintOrbBackground"), "the React component must restore layered relief composition");
assert.ok(reactSource.includes("drawNatureAnimation"), "the React component must include original nature presets");
assert.ok(packageSource.includes('"thinking-orbs"'), "the licensed legacy animation dependency must be declared");
assert.ok(notices.includes("thinking-orbs"), "the package must identify the licensed dependency");
assert.ok(notices.includes("Copyright (c) 2026 Jakub Antalik"), "the MIT copyright notice must be retained");

console.log("Orbsona launch regression test passed.");
