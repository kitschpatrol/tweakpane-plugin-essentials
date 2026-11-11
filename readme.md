<!-- title -->

# @kitschpatrol/tweakpane-plugin-essentials

<!-- /title -->

<!-- badges({ npmDownloads: true }) -->

[![NPM Package @kitschpatrol/tweakpane-plugin-essentials](https://img.shields.io/npm/v/@kitschpatrol/tweakpane-plugin-essentials.svg)](https://www.npmjs.com/package/@kitschpatrol/tweakpane-plugin-essentials)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/license/mit)
[![CI](https://github.com/kitschpatrol/tweakpane-plugin-essentials/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/tweakpane-plugin-essentials/actions/workflows/ci.yml)
[![NPM Downloads @kitschpatrol/tweakpane-plugin-essentials](https://img.shields.io/npm/dm/@kitschpatrol/tweakpane-plugin-essentials)](https://www.npmjs.com/package/@kitschpatrol/tweakpane-plugin-essentials)

<!-- /badges -->

<!-- description -->

**Fork of @tweakpane/plugin-essentials with build optimizations.**

<!-- /description -->

## Overview

This is a fork of the [Tweakpane essentials plugin](https://github.com/tweakpane/plugin-essentials) by [Hiroki Kokubun (cocopon)](https://cocopon.me/), providing interval inputs, grids, a frame rate graph, and a cubic Bézier editor for Tweakpane 4.

See the [upstream README](https://github.com/tweakpane/plugin-essentials/blob/main/README.md) for the original documentation and examples. This fork is published primarily for [Svelte Tweakpane UI](https://kitschpatrol.com/svelte-tweakpane-ui), with minimal changes to upstream behavior.

## Fork changes

- Publishes as `@kitschpatrol/tweakpane-plugin-essentials` instead of `@tweakpane/plugin-essentials`.
- Bundles `@tweakpane/core` at the package root like a standard Tweakpane plugin, and adds a `/lite` entry that imports core instead so bundlers can share one copy across plugins.
- Exports public parameter types from the package root and `/lite`.
- Builds TypeScript and inline SCSS with tsdown, with a Vite playground, Vitest tests, ksc linting, and chagent release notes.
- Incorporates the [CubicBezier performance fix](https://github.com/tweakpane/plugin-essentials/pull/21).

## Getting started

<!-- dependencies({ headingLevel: 3 }) -->

### Dependencies

- [Node.js](https://nodejs.org/) 18.0.0 or newer
- [tweakpane](https://www.npmjs.com/package/tweakpane) `^4.0.0` _(peer dependency)_

<!-- /dependencies -->

<!-- install({ headingLevel: 3 }) -->

### Installation

Add it to your project:

```sh
npm install @kitschpatrol/tweakpane-plugin-essentials
```

<!-- /install -->

## Usage

```ts
import * as EssentialsPlugin from '@kitschpatrol/tweakpane-plugin-essentials'
import { Pane } from 'tweakpane'

const pane = new Pane()
pane.registerPlugin(EssentialsPlugin)

const parameters = { range: { min: 20, max: 80 } }
pane.addBinding(parameters, 'range', { min: 0, max: 100 })
```

See the [upstream usage examples](https://github.com/tweakpane/plugin-essentials/blob/main/README.md#usage) for the other controls and their options.

To share core in a bundled application, change the plugin import to `@kitschpatrol/tweakpane-plugin-essentials/lite`. Existing consumers that relied on external core at the package root should use this entry.

## Distribution

The build writes four ES module files directly under `dist/`:

| File                                      | Core     | Minified |
| ----------------------------------------- | -------- | -------- |
| `tweakpane-plugin-essentials.js`          | Bundled  | No       |
| `tweakpane-plugin-essentials.min.js`      | Bundled  | Yes      |
| `tweakpane-plugin-essentials.lite.js`     | External | No       |
| `tweakpane-plugin-essentials.lite.min.js` | External | Yes      |

The package root resolves to `.js` and bundles `@tweakpane/core`. The `/lite` entry resolves to `.lite.js` and imports core, so an application bundler can share one copy across plugins. Direct URL imports of a lite file need an import map for core. Tweakpane itself is a peer dependency and is never bundled. Use one entry consistently when relying on the identity of exported classes.

Both entries share the `dist/tweakpane-plugin-essentials.d.ts` declarations, so import public types from the package root or `/lite`. The export map contains only the package root, `/lite`, and `/package.json`. JavaScript targets ES2022, and no source maps are emitted.

<!-- size-table({ files: ["dist/tweakpane-plugin-essentials.js", "dist/tweakpane-plugin-essentials.min.js", "dist/tweakpane-plugin-essentials.lite.js", "dist/tweakpane-plugin-essentials.lite.min.js"], precision: 1 }) -->

| File                                    | Original | Gzip    | Brotli  |
| --------------------------------------- | -------- | ------- | ------- |
| tweakpane-plugin-essentials.js          | 122.8 kB | 25.5 kB | 21.7 kB |
| tweakpane-plugin-essentials.min.js      | 69.2 kB  | 17.1 kB | 15.2 kB |
| tweakpane-plugin-essentials.lite.js     | 56.5 kB  | 12.9 kB | 11 kB   |
| tweakpane-plugin-essentials.lite.min.js | 36.7 kB  | 9.8 kB  | 8.8 kB  |

<!-- /size-table -->

## Development

<!-- development-dependencies({ headingLevel: 3 }) -->

### Development dependencies

- [Node.js](https://nodejs.org/) ^24.16.0 || >=26.3.0
- [pnpm](https://pnpm.io/) 12.16.1

<!-- /development-dependencies -->

| Command        | Purpose                                                                 |
| -------------- | ----------------------------------------------------------------------- |
| `pnpm install` | Install development dependencies.                                       |
| `pnpm build`   | Build the four distributions and the declaration bundle with tsdown.    |
| `pnpm dev`     | Open the Vite playground in `demo/index.html`.                          |
| `pnpm watch`   | Rebuild JavaScript, declarations, and imported Sass partials on change. |
| `pnpm test`    | Run the Vitest suite in `test/`.                                        |
| `pnpm fix`     | Apply ksc formatting and lint fixes.                                    |
| `pnpm lint`    | Check code, types, styles, dependencies, and generated documentation.   |

Styles live in `src/styles/` and compile to a CSS string through an `?inline` import, which Tweakpane installs when the plugin is registered. Build before running `pnpm fix` or `pnpm lint`, since mdat reads `dist/` for the size table.

The release script calls chagent to update the changelog while preparing the version bump, then builds and publishes the package.

## Versioning

In addition to the optional external-core entry, this fork also includes dependency updates. In an effort to stay in sync with future upstream versions, release version numbers are tagged with a "fork" suffix and an incrementing number.

<!-- contributing -->

## Contributing

[Issues](https://github.com/kitschpatrol/tweakpane-plugin-essentials/issues) are welcome and appreciated.

Please open an issue to discuss changes before submitting a pull request. Unsolicited PRs (especially AI-generated ones) are unlikely to be merged.

This repository uses [@kitschpatrol/shared-config](https://github.com/kitschpatrol/shared-config) (via its `ksc` CLI) for linting and formatting, plus [MDAT](https://github.com/kitschpatrol/mdat) for readme placeholder expansion.

<!-- /contributing -->

<!-- license -->

## License

[MIT](license.txt) © cocopon

<!-- /license -->

Fork modifications: [MIT](license.txt) © [Eric Mika](https://ericmika.com).
