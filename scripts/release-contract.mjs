import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const rootPackage = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const publicPackage = JSON.parse(await readFile(new URL("../packages/orbsona/package.json", import.meta.url), "utf8"));
const publishingGuide = await readFile(new URL("../docs/npm-publishing.md", import.meta.url), "utf8");
const releaseWorkflow = await readFile(new URL("../.github/workflows/release.yml", import.meta.url), "utf8");

assert.equal(rootPackage.version, publicPackage.version, "workspace and public package versions must move together");
assert.doesNotMatch(
  publishingGuide,
  /current public (?:Orbsona )?release is [`']?\d+\.\d+\.\d+/i,
  "the registry, not hard-coded prose, must be the source of truth for the public version",
);
assert.match(publishingGuide, /npm view @accidental-revenue\/orbsona version/);
assert.match(
  releaseWorkflow,
  /refs\/tags\/v\$PACKAGE_VERSION/,
  "publishing must be restricted to the tag matching package.json",
);
assert.match(releaseWorkflow, /npm pack --dry-run/);
assert.match(releaseWorkflow, /npm view ["']@accidental-revenue\/orbsona@\$PACKAGE_VERSION["'] version/);

console.log("Orbsona release contract test passed.");
