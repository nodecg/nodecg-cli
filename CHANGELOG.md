# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [9.0.1](https://github.com/nodecg/nodecg-cli/compare/v9.0.0...v9.0.1) (2025-01-03)


### Bug Fixes

* release CI bug ([4bb377a](https://github.com/nodecg/nodecg-cli/commit/4bb377a7540f4774edb75643d9694c21338de3a2))

## [9.0.0](https://github.com/nodecg/nodecg-cli/compare/v8.7.0...v9.0.0) (2025-01-01)


### ⚠ BREAKING CHANGES

* **setup:** Drop support for nodecg 0.x.x and 1.x.x.
* **schema-types:** schema-types command no longer outputs index file
* `defaultconfig` command now uses ajv to generate default value. A config schema that are not object will throw an error. A config schema with top level default will now throw an error.

### Features

* deprecated package ([#128](https://github.com/nodecg/nodecg-cli/issues/128)) ([1726529](https://github.com/nodecg/nodecg-cli/commit/17265294e94cb93a0b88d19e31135cba6441ca12))
* use ajv for defaultconfig command ([#117](https://github.com/nodecg/nodecg-cli/issues/117)) ([6f2c19d](https://github.com/nodecg/nodecg-cli/commit/6f2c19d8a7a99f9ca90c5cfff5cd636f5804333b))


### Bug Fixes

* **defaultconfig:** correct styling of log output ([#120](https://github.com/nodecg/nodecg-cli/issues/120)) ([7cf54f3](https://github.com/nodecg/nodecg-cli/commit/7cf54f3efeae36ad8008777e321128f5970ab939))
* **schema-types:** don't output index file ([#119](https://github.com/nodecg/nodecg-cli/issues/119)) ([4ca2931](https://github.com/nodecg/nodecg-cli/commit/4ca29311b5220fdc53357c54dff41a3f1dc20686))


### Code Refactoring

* **setup:** remove support for nodecg less than 2.0.0 ([#124](https://github.com/nodecg/nodecg-cli/issues/124)) ([4536527](https://github.com/nodecg/nodecg-cli/commit/4536527088ccfb320cb6989a00bc9bf04b3a0266))

## [8.7.0](https://github.com/nodecg/nodecg-cli/compare/v8.6.8...v8.7.0) (2024-12-26)


### Features

* update commander and inquirer ([#109](https://github.com/nodecg/nodecg-cli/issues/109)) ([579b79e](https://github.com/nodecg/nodecg-cli/commit/579b79ed255875e76cb06b453a54f150f6f76172))
* update node version to 18/20/22 ([#98](https://github.com/nodecg/nodecg-cli/issues/98)) ([9990349](https://github.com/nodecg/nodecg-cli/commit/999034977350695e4c09fbf12446e900743f81db))
* use esm and update packages ([#108](https://github.com/nodecg/nodecg-cli/issues/108)) ([058be35](https://github.com/nodecg/nodecg-cli/commit/058be35204e48ee989161b96f7cc36b7b5eeb904))


### Bug Fixes

* remove __dirname ([#113](https://github.com/nodecg/nodecg-cli/issues/113)) ([8c9a033](https://github.com/nodecg/nodecg-cli/commit/8c9a033dce5630f6ef0edf5515ffdc8f1f673f6d))
* remove node-fetch ([#102](https://github.com/nodecg/nodecg-cli/issues/102)) ([50a6323](https://github.com/nodecg/nodecg-cli/commit/50a632382fba9a05f087042d78dde09ae3c96997))

## [8.6.8](https://github.com/nodecg/nodecg-cli/compare/v8.6.7...v8.6.8) (2023-06-20)

### Bug Fixes

- try prepending "v" to the checkout tag when installing a bundle ([58daa03](https://github.com/nodecg/nodecg-cli/commit/58daa0336319624f5ec783806d0e8a00f4aefb24))

## [8.6.7](https://github.com/nodecg/nodecg-cli/compare/v8.6.6...v8.6.7) (2023-06-20)

### Bug Fixes

- better semver parsing ([61a0e8c](https://github.com/nodecg/nodecg-cli/commit/61a0e8cdc704bff5c081beffd3f30d76dbf59cbb))

## [8.6.6](https://github.com/nodecg/nodecg-cli/compare/v8.6.5...v8.6.6) (2023-06-11)

### Bug Fixes

- force build to try to fix release-please ([e2ae645](https://github.com/nodecg/nodecg-cli/commit/e2ae6451be408d821d3211fea82ed1a95cf6db89))

## [8.6.5](https://github.com/nodecg/nodecg-cli/compare/v8.6.4...v8.6.5) (2023-06-11)

### Bug Fixes

- don't return a promise from the compile method, it isn't used ([2903e50](https://github.com/nodecg/nodecg-cli/commit/2903e5016a9daa410f3972b7d94873fd9f41adee))
- prevent eslint and typescript from being overly worried about replicant schemas ([3d2dd82](https://github.com/nodecg/nodecg-cli/commit/3d2dd82ea642e5a6e596ff2191577f0dd8424f42))

## [6.1.0](https://github.com/nodecg/nodecg-cli/compare/v6.0.4-alpha.2...v6.1.0) (2019-08-06)

### Features

- make installation of Bower deps optional ([#66](https://github.com/nodecg/nodecg-cli/issues/66)) ([2e16c1b](https://github.com/nodecg/nodecg-cli/commit/2e16c1b))

## [6.0.4-alpha.2](https://github.com/nodecg/nodecg-cli/compare/v6.0.4-alpha.1...v6.0.4-alpha.2) (2019-01-27)

### Bug Fixes

- **modules:** use commonjs export for dynamic modules ([523a6a6](https://github.com/nodecg/nodecg-cli/commit/523a6a6))

<a name="6.0.4-alpha.1"></a>

## [6.0.4-alpha.1](https://github.com/nodecg/nodecg-cli/compare/v6.0.4-alpha.0...v6.0.4-alpha.1) (2019-01-27)

### Bug Fixes

- correct require path to package.json ([035e71e](https://github.com/nodecg/nodecg-cli/commit/035e71e))

<a name="6.0.4-alpha.0"></a>

## [6.0.4-alpha.0](https://github.com/nodecg/nodecg-cli/compare/v6.0.3...v6.0.4-alpha.0) (2019-01-27)

<a name="6.0.3"></a>

## [6.0.3](https://github.com/nodecg/nodecg-cli/compare/v6.0.2...v6.0.3) (2018-12-03)

### Bug Fixes

- **package:** make fs-extra a prod dep, not a devDep ([76ab59d](https://github.com/nodecg/nodecg-cli/commit/76ab59d))

<a name="6.0.2"></a>

## [6.0.2](https://github.com/nodecg/nodecg-cli/compare/v6.0.1...v6.0.2) (2018-12-03)

<a name="6.0.1"></a>

## [6.0.1](https://github.com/nodecg/nodecg-cli/compare/v6.0.0...v6.0.1) (2018-12-03)

<a name="6.0.0"></a>

# [6.0.0](https://github.com/nodecg/nodecg-cli/compare/v5.0.1...v6.0.0) (2018-12-03)

### Bug Fixes

- **package:** update chalk to version 2.0.0 ([#44](https://github.com/nodecg/nodecg-cli/issues/44)) ([b19ddc1](https://github.com/nodecg/nodecg-cli/commit/b19ddc1))
- **package:** update inquirer to version 4.0.0 ([#52](https://github.com/nodecg/nodecg-cli/issues/52)) ([ef4560f](https://github.com/nodecg/nodecg-cli/commit/ef4560f))

### Code Refactoring

- port to ES6 ([b373fff](https://github.com/nodecg/nodecg-cli/commit/b373fff))

### Features

- add schema-types command ([#62](https://github.com/nodecg/nodecg-cli/issues/62)) ([237d734](https://github.com/nodecg/nodecg-cli/commit/237d734))

### BREAKING CHANGES

- drop support for Node 6
- requires Node 6+

<a name="5.0.1"></a>

## [5.0.1](https://github.com/nodecg/nodecg-cli/compare/v5.0.0...v5.0.1) (2016-03-06)

### Bug Fixes

- **setup:** run `git fetch` before attempting to check out an updated release ([aa352c2](https://github.com/nodecg/nodecg-cli/commit/aa352c2))

<a name="5.0.0"></a>

# [5.0.0](https://github.com/nodecg/nodecg-cli/compare/v4.1.0...v5.0.0) (2016-03-02)

### Bug Fixes

- **install:** I'm the worst, go back to using httpsUrl ([501264d](https://github.com/nodecg/nodecg-cli/commit/501264d))
- **install:** use gitUrl instead of httpsUrl ([8c483a3](https://github.com/nodecg/nodecg-cli/commit/8c483a3))
- **install:** use ssh instead of giturl ([7c25f0f](https://github.com/nodecg/nodecg-cli/commit/7c25f0f))
- **update:** fix error when installing bundle deps ([20ccda4](https://github.com/nodecg/nodecg-cli/commit/20ccda4))

### Code Refactoring

- **install:** use system bower ([1109d82](https://github.com/nodecg/nodecg-cli/commit/1109d82))

### Features

- **install:** install command now respects semver ranges, if supplied ([3be0c6a](https://github.com/nodecg/nodecg-cli/commit/3be0c6a))
- **setup:** add `-k` alias for `--skip-dependencies` ([fcd841a](https://github.com/nodecg/nodecg-cli/commit/fcd841a))
- **update:** remove update command while its functionality is re-evaluated ([52fbe07](https://github.com/nodecg/nodecg-cli/commit/52fbe07))

### BREAKING CHANGES

- update: remove update command
- install: requires bower to be globally installed

<a name="4.1.0"></a>

# [4.1.0](https://github.com/nodecg/nodecg-cli/compare/v4.0.0...v4.1.0) (2016-02-18)

### Features

- **command:** Add defaultconfig command ([e247110](https://github.com/nodecg/nodecg-cli/commit/e247110))

<a name="4.0.0"></a>

# [4.0.0](https://github.com/nodecg/nodecg-cli/compare/v3.0.1...v4.0.0) (2016-02-07)

<a name="3.0.1"></a>

## [3.0.1](https://github.com/nodecg/nodecg-cli/compare/v3.0.0...v3.0.1) (2016-02-02)

<a name="3.0.0"></a>

# [3.0.0](https://github.com/nodecg/nodecg-cli/compare/v2.2.4...v3.0.0) (2016-02-02)

<a name="2.2.4"></a>

## [2.2.4](https://github.com/nodecg/nodecg-cli/compare/v2.2.3...v2.2.4) (2015-04-23)

<a name="2.2.3"></a>

## [2.2.3](https://github.com/nodecg/nodecg-cli/compare/v2.2.1...v2.2.3) (2015-04-10)

<a name="2.2.1"></a>

## [2.2.1](https://github.com/nodecg/nodecg-cli/compare/v2.2.0...v2.2.1) (2015-02-20)

<a name="2.2.0"></a>

# [2.2.0](https://github.com/nodecg/nodecg-cli/compare/v2.1.1...v2.2.0) (2015-02-20)

<a name="2.1.1"></a>

## [2.1.1](https://github.com/nodecg/nodecg-cli/compare/v2.1.0...v2.1.1) (2015-02-19)

<a name="2.0.1"></a>

## [2.0.1](https://github.com/nodecg/nodecg-cli/compare/v2.0.0...v2.0.1) (2015-02-18)

<a name="2.0.0"></a>

# [2.0.0](https://github.com/nodecg/nodecg-cli/compare/v1.0.3...v2.0.0) (2015-02-18)

<a name="1.0.3"></a>

## [1.0.3](https://github.com/nodecg/nodecg-cli/compare/v1.0.1...v1.0.3) (2015-02-14)

<a name="1.0.1"></a>

## [1.0.1](https://github.com/nodecg/nodecg-cli/compare/v1.0.0...v1.0.1) (2015-01-24)

<a name="1.0.0"></a>

# [1.0.0](https://github.com/nodecg/nodecg-cli/compare/v0.0.2...v1.0.0) (2015-01-18)

<a name="0.0.2"></a>

## [0.0.2](https://github.com/nodecg/nodecg-cli/compare/v0.0.1...v0.0.2) (2015-01-17)

<a name="0.0.1"></a>

## 0.0.1 (2015-01-16)
