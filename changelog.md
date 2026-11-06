# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Maintenance

- Update the declared package manager to pnpm 12.16.1.
- Update the pinned GitHub release and release-note actions.
- Change the release script to publish using an npm one-time password retrieved from 1Password.

## [0.2.2-fork.1] - 2026-10-15

### Documentation

- Document numbered `fork` version suffixes in place of the beta naming policy.
- Add fork license attribution, refresh README badges, and update reference links.

### Maintenance

- Refresh contributor tooling to pnpm 12, TypeScript 6, and ESLint 10 flat configuration, with development Node.js requirements of `^24.16.0 || >=26.3.0`.
- Normalize build and cleanup scripts, use Rollup watching with Sass recompilation, adopt Sass's modern API, and exclude tests from declaration output.
- Add mdat README generation and include generated-documentation checks in the test command.
- Add automated repository and website link checks on changes and a weekly schedule.
- Add a scheduled Fork Tender workflow for upstream fork maintenance.
- Refresh release and metadata workflows with pinned actions and default-branch tag validation, and run tests/builds before versioning and publishing fork releases.

## [0.2.2-beta.3] - 2025-03-04

### Changed

- Remove pnpm from the package's engine requirements.

### Documentation

- Clarify that fork beta versions track the next upstream patch release.

### Maintenance

- Update the declared runtime dependency on `@tweakpane/core` to `^2.0.5`.
- Refresh development dependencies, move to pnpm 10, and configure the permitted dependency build.
- Correct repository metadata and update release/metadata workflows, including publishing explicitly under npm's `latest` tag.

## [0.2.2-beta.2] - 2024-09-15

### Maintenance

- Add GitHub Actions workflows for tagged releases with generated notes and repository metadata synchronization from package metadata.

## [0.2.2-beta.1] - 2024-09-15

### Changed

- **Breaking:** Rename the fork's npm package to `@kitschpatrol/tweakpane-plugin-essentials`.
- **Breaking:** Externalize `@tweakpane/core` as a runtime dependency (`^2.0.4`) so bundlers can share it; direct browser imports now need an import map.
- **Breaking:** Declare package installation engine requirements of Node.js `>=18` and pnpm `>=9`.

### Fixed

- Cancel pending cubic Bézier preview animation frames when stopping or restarting playback, preventing overlapping animation loops.

### Documentation

- Replace upstream usage examples with the fork's purpose, dependency-externalization guidance, browser import-map setup, and beta versioning policy.

### Maintenance

- Adopt pnpm and refresh build, lint, test, and formatting dependencies, including Rollup 4, TypeScript 5.6, and the official Terser plugin.
- Add a release command for versioning, tagging, building, and publishing the fork.

## [0.2.1] - 2023-12-17

### Added

- Add mutable `min` and `max` properties to `FpsGraphBladeApi` for adjusting the graph range after creation.
- Expose the latest FPS measurement through `FpsGraphBladeApi.fps`.
- Add `tick` event subscriptions to `FpsGraphBladeApi`.

### Changed

- **Breaking:** Require stable Tweakpane `^4.0.0` instead of the beta peer range.
- **Breaking:** Change the exported `FpsGraphController` constructor to accept a shared `props` map instead of `minValue` and `maxValue`.

### Fixed

- Correct cubic Bézier graph and preview rendering when controls are scaled with CSS transforms.

### Documentation

- Add a compatibility table mapping Essentials 0.1.x to Tweakpane 3 and Essentials 0.2.x to Tweakpane 4.

## [0.2.0] - 2023-08-11

No notable changes.

## [0.2.0-beta.1] - 2023-08-06

### Changed

- **Breaking:** Update plugin registration for Tweakpane `^4.0.0-beta.2` and core `^2.0.0-beta.2` using core's `createPlugin()` helper.

## [0.2.0-beta.0] - 2023-06-20

### Added

- Export bundle-level `id` and `css` metadata for Tweakpane 4 beta plugin registration.

### Changed

- **Breaking:** Update compatibility to Tweakpane `^4.0.0-beta.1` and core `^2.0.0-beta.1`, adapting plugin registration and core imports to the beta format.

## [0.2.0-alpha.0] - 2023-04-29

### Added

- Export `ButtonGridControllerConfig` for constructing button-grid controllers.

### Changed

- **Breaking:** Migrate blade APIs to Tweakpane 4 controller types and require Tweakpane `^4.0.0-alpha.0` with core `^2.0.0-alpha.0`.
- **Breaking:** Replace UMD distribution with ES modules and declare the package as `type: module`.
- **Breaking:** Rename the FPS graph height option from `lineCount` to `rows`.
- **Breaking:** Update exported Bézier and interval controller configurations to use `keyScale`, `textProps`, and Tweakpane 4 slider property maps.
- **Breaking:** Allow `null` labels in `CubicBezierApi`, widening its getter and setter types.
- **Breaking:** Replace `TpRadioGridChangeEvent`'s optional `presetKey` constructor argument with a `last` boolean.

### Documentation

- Update examples for ES module imports, Tweakpane 4's `addBinding()` API, and the FPS graph's `rows` option.

### Maintenance

- Refresh lint and formatting dependencies, migrate build/release scripts to ES modules, and add HTTP-server development scripts.

## [0.1.8] - 2023-01-30

### Changed

- **Breaking:** Raise the Tweakpane peer requirement to `^3.1.4` and update bundled core to `^1.1.4`.

## [0.1.7] - 2023-01-18

### Added

- Export control APIs and supporting controllers, models, views, constraints, and event types from the package entry point for typed integrations.

## [0.1.6] - 2023-01-17

### Changed

- **Breaking:** Raise the Tweakpane peer requirement to `^3.1.2` and update bundled core to `^1.1.2`.

### Maintenance

- Refactor interval sliders to use definite range constraints and shared reactive slider properties.

## [0.1.5] - 2022-08-17

### Added

- Support string and boolean values in radio-grid input bindings alongside numbers.

### Changed

- **Breaking:** Raise the Tweakpane peer requirement to `^3.1.0` and update bundled core to `^1.1.0`.

### Maintenance

- Replace Node Sass with Dart Sass for stylesheet builds.
- Refresh TypeScript and TypeScript ESLint dependencies.

## [0.1.4] - 2021-11-02

### Fixed

- Correct whole-interval dragging when the slider's minimum bound is nonzero.

## [0.1.3] - 2021-09-25

### Added

- Add a `format` callback for interval values in both slider and text-only inputs.
- Allow programmatic cubic Bézier updates through `CubicBezierApi.value` and export the `CubicBezier` class from the package entry point.

### Documentation

- Correct the cubic Bézier example to subscribe to `change` events.

## [0.1.2] - 2021-08-24

### Fixed

- Fix missing cubic Bézier change subscriptions by adding `CubicBezierApi.on('change', ...)`, including final-change flags.

### Documentation

- Correct the browser installation example's misspelled script tag.
- Refresh screenshots for all controls.

## [0.1.1] - 2021-08-07

### Added

- Support final-change (`last`) flags for cubic Bézier keyboard and pointer edits and interval slider drags.

### Changed

- **Breaking:** Declare Tweakpane `^3.0.5` as a required peer dependency and update bundled core to `^1.0.6`.

### Maintenance

- Correct release archive naming for scoped package names.
- Make TypeScript and Sass watchers build immediately and restart builds when files change.

## [0.1.0] - 2021-06-15

### Added

- Add interval inputs for `{min, max}` values, with numeric fields, optional bounds and steps, and draggable endpoints or whole ranges.
- Add FPS graphs with `begin()`/`end()` measurement, configurable sampling intervals, display ranges, and graph height.
- Add radio grids as numeric input bindings or standalone selection blades, with configurable cells, change events, and per-cell titles and disabled states.
- Add configurable button grids with coordinate-aware click events and per-cell title, disabled-state, and click APIs.
- Add a cubic Bézier editor with popup or inline pickers, draggable handles, keyboard and numeric editing, CSS curve text, and animated previews.
- Provide a registerable `plugins` bundle for Tweakpane 3 as `@tweakpane/plugin-essentials`, with browser UMD builds and TypeScript declarations.

### Documentation

- Document browser and package registration, with usage examples and screenshots for all five controls.

### Maintenance

- Establish TypeScript/Rollup builds, Sass compilation, linting and formatting, interval model tests, a browser test page, and release asset packaging.

[Unreleased]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.2.2-fork.1...HEAD
[0.1.0]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/releases/tag/0.1.0
[0.1.1]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.1.0...0.1.1
[0.1.2]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.1.1...0.1.2
[0.1.3]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.1.2...0.1.3
[0.1.4]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.1.3...0.1.4
[0.1.5]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.1.4...0.1.5
[0.1.6]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.1.5...0.1.6
[0.1.7]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.1.6...0.1.7
[0.1.8]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.1.7...0.1.8
[0.2.0-alpha.0]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.1.8...0.2.0-alpha.0
[0.2.0-beta.0]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.2.0-alpha.0...0.2.0-beta.0
[0.2.0-beta.1]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.2.0-beta.0...0.2.0-beta.1
[0.2.0]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.2.0-beta.1...0.2.0
[0.2.1]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.2.0...0.2.1
[0.2.2-beta.1]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.2.1...0.2.2-beta.1
[0.2.2-beta.2]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.2.2-beta.1...0.2.2-beta.2
[0.2.2-beta.3]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.2.2-beta.2...0.2.2-beta.3
[0.2.2-fork.1]: https://github.com/kitschpatrol/tweakpane-plugin-essentials/compare/0.2.2-beta.3...0.2.2-fork.1
