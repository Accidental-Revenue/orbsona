# npm publishing guide

Orbsona is published as the public package [`@accidental-revenue/orbsona`](https://www.npmjs.com/package/@accidental-revenue/orbsona) under the [`accidental-revenue`](https://www.npmjs.com/org/accidental-revenue) npm organization. The registry is the source of truth for the current public version:

```bash
npm view @accidental-revenue/orbsona version
```

## Ownership and package names

Use a personal npm account for authentication. That account must be an owner or a member with read/write access in the `accidental-revenue` organization.

The initial package is:

- `@accidental-revenue/orbsona` — identity contract and React renderer

The organization leaves room for future packages such as `@accidental-revenue/orbsona-mcp` or `@accidental-revenue/orbsona-cli`, but those should only be created when they contain maintained, independently useful functionality.

## Recommended: trusted publishing

The repository includes `.github/workflows/release.yml`. It uses GitHub Actions OIDC, npm 11.17.0, and Node 24. It does not need a long-lived npm token or a cached release install.

In the npm package settings for `@accidental-revenue/orbsona`, add a trusted publisher with:

- provider: GitHub Actions
- organization or user: `Accidental-Revenue`
- repository: `orbsona`
- workflow filename: `release.yml`
- environment: leave empty unless the workflow is later assigned one
- allowed actions: `npm publish`

After the trusted publisher is saved, create and push a tag that exactly matches the version in `packages/orbsona/package.json`, then run **Publish package** from that tag. The workflow refuses branches, mismatched tags, and versions that already exist on npm. It verifies lint, package and release contracts, the production build, dependency audit, and packed contents before publishing; it then verifies the exact version from the registry.

```bash
PACKAGE_VERSION=$(node --print "require('./packages/orbsona/package.json').version")
git tag "v$PACKAGE_VERSION"
git push origin "v$PACKAGE_VERSION"
gh workflow run release.yml --ref "v$PACKAGE_VERSION"
```

For a public repository and package, npm trusted publishing generates provenance automatically.

Current npm requirements for trusted publishing are npm 11.5.1 or newer and Node 22.14.0 or newer. The workflow pins compatible versions.

## Alternative: authenticate interactively

Run these commands in a trusted local terminal. Never paste passwords, one-time codes, recovery codes, or access tokens into source files, issues, or chat:

```bash
npm login
npm whoami
npm ping
npm access list packages @accidental-revenue
```

Publishing requires account 2FA or an appropriately scoped publishing mechanism. For an interactive release, npm prompts for the one-time code during `npm publish`.

## Verify the release artifact

From the repository root:

```bash
npm run lint
npm run test:package
npm run build
npm pack --dry-run --workspace @accidental-revenue/orbsona
```

The package preview must contain only `dist`, `README.md`, `LICENSE`, `THIRD_PARTY_NOTICES.md`, and `package.json`. Do not publish if it includes environment files, credentials, application source, screenshots, or unrelated assets.

## Publish interactively

After the checks pass:

```bash
npm publish --workspace @accidental-revenue/orbsona --access public
```

The explicit `--access public` flag is important for an organization-scoped package.

## Verify from a clean project

```bash
npm view @accidental-revenue/orbsona version

mkdir orbsona-consumer
cd orbsona-consumer
npm init -y
npm install @accidental-revenue/orbsona
```

The same npm-registry release works with other JavaScript package managers:

```bash
pnpm add @accidental-revenue/orbsona
yarn add @accidental-revenue/orbsona
bun add @accidental-revenue/orbsona
```

No separate pnpm, Yarn, or Bun publication is required.

## Maintain future releases

For later versions, prefer npm trusted publishing from a supported CI provider. Avoid long-lived classic access tokens. Every release should:

1. increment the package version,
2. pass package tests and the application build,
3. inspect the packed file list,
4. publish with provenance where the CI platform supports it,
5. verify the public version and install it in a clean consumer.

Official references:

- [Publishing scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/)
- [Requiring 2FA for package publishing](https://docs.npmjs.com/requiring-2fa-for-package-publishing-and-settings-modification/)
- [Trusted publishing](https://docs.npmjs.com/trusted-publishers/)
- [Installing scoped public packages](https://docs.npmjs.com/downloading-and-installing-packages-locally/)

## Stop conditions

Do not publish when:

- `npm whoami` is not the intended maintainer account;
- that account cannot write to `@accidental-revenue`;
- 2FA or the approved publishing mechanism is unavailable;
- package tests, lint, or the application build fails;
- the dry-run artifact contains unexpected files;
- the registry already contains the same package version.
