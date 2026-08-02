import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const rootPackage = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const publicPackage = JSON.parse(await readFile(new URL("../packages/orbsona/package.json", import.meta.url), "utf8"));
const publishingGuide = await readFile(new URL("../docs/npm-publishing.md", import.meta.url), "utf8");
const releaseWorkflow = await readFile(new URL("../.github/workflows/release.yml", import.meta.url), "utf8");
const ciWorkflow = await readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const vercelConfig = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url), "utf8"));

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
assert.match(
  releaseWorkflow,
  /for attempt in \{1\.\.12\}/,
  "registry verification must tolerate normal npm propagation delay",
);
assert.match(releaseWorkflow, /npm ci --strict-allow-scripts/);
assert.match(ciWorkflow, /npm install --global npm@11\.17\.0/);
assert.match(ciWorkflow, /npm ci --strict-allow-scripts/);
assert.equal(
  vercelConfig.installCommand,
  "npx --yes npm@11.17.0 ci --strict-allow-scripts",
  "Vercel must install with the audited npm CLI and strict script approvals",
);
assert.deepEqual(
  vercelConfig.redirects,
  [
    {
      source: "/:path*",
      has: [{ type: "host", value: "www.orbsona.com" }],
      destination: "https://orbsona.com/:path*",
      permanent: true,
    },
  ],
  "www must permanently redirect to the canonical apex domain",
);
assert.deepEqual(rootPackage.allowScripts, {
  "fsevents@2.3.2": true,
  "unrs-resolver@1.12.2": true,
});

console.log("Orbsona release contract test passed.");
