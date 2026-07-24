# npm publishing guide

Orbsona is published as the public package [`@accidental-revenue/orbsona`](https://www.npmjs.com/package/@accidental-revenue/orbsona) under the [`accidental-revenue`](https://www.npmjs.com/org/accidental-revenue) npm organization. The current public release is `0.1.1`.

## Ownership and package names

Use a personal npm account for authentication. That account must be an owner or a member with read/write access in the `accidental-revenue` organization.

The initial package is:

- `@accidental-revenue/orbsona` — identity contract and React renderer

The organization leaves room for future packages such as `@accidental-revenue/orbsona-mcp` or `@accidental-revenue/orbsona-cli`, but those should only be created when they contain maintained, independently useful functionality.

## 1. Authenticate safely

Run these commands in a trusted local terminal. Never paste passwords, one-time codes, recovery codes, or access tokens into source files, issues, or chat:

```bash
npm login
npm whoami
npm ping
npm access list packages @accidental-revenue
```

Publishing requires account 2FA or an appropriately scoped publishing mechanism. For an interactive release, npm prompts for the one-time code during `npm publish`.

## 2. Verify the release artifact

From the repository root:

```bash
npm run lint
npm run test:package
npm run build
npm pack --dry-run --workspace @accidental-revenue/orbsona
```

The package preview must contain only `dist`, `README.md`, `LICENSE`, and `package.json`. Do not publish if it includes environment files, credentials, application source, screenshots, or unrelated assets.

## 3. Publish the public release

After the checks pass:

```bash
npm publish --workspace @accidental-revenue/orbsona --access public
```

The explicit `--access public` flag is important for an organization-scoped package.

## 4. Verify from a clean project

```bash
npm view @accidental-revenue/orbsona version

mkdir orbsona-consumer
cd orbsona-consumer
npm init -y
npm install @accidental-revenue/orbsona
```

The current public Orbsona release is `0.1.1`.

The same npm-registry release works with other JavaScript package managers:

```bash
pnpm add @accidental-revenue/orbsona
yarn add @accidental-revenue/orbsona
bun add @accidental-revenue/orbsona
```

No separate pnpm, Yarn, or Bun publication is required.

## 5. Automate future releases

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
