# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="6.1.0"></a>
# [6.1.0](https://github.com/nodecg/nodecg-cli/compare/v6.0.4-alpha.2...v6.1.0) (2019-08-06)


### Features

* make installation of Bower deps optional ([#66](https://github.com/nodecg/nodecg-cli/issues/66)) ([2e16c1b](https://github.com/nodecg/nodecg-cli/commit/2e16c1b))



<a name="6.0.4-alpha.2"></a>
## [6.0.4-alpha.2](https://github.com/nodecg/nodecg-cli/compare/v6.0.4-alpha.1...v6.0.4-alpha.2) (2019-01-27)


### Bug Fixes

* **modules:** use commonjs export for dynamic modules ([523a6a6](https://github.com/nodecg/nodecg-cli/commit/523a6a6))



<a name="6.0.4-alpha.1"></a>
## [6.0.4-alpha.1](https://github.com/nodecg/nodecg-cli/compare/v6.0.4-alpha.0...v6.0.4-alpha.1) (2019-01-27)


### Bug Fixes

* correct require path to package.json ([035e71e](https://github.com/nodecg/nodecg-cli/commit/035e71e))



<a name="6.0.4-alpha.0"></a>
## [6.0.4-alpha.0](https://github.com/nodecg/nodecg-cli/compare/v6.0.3...v6.0.4-alpha.0) (2019-01-27)



<a name="6.0.3"></a>
## [6.0.3](https://github.com/nodecg/nodecg-cli/compare/v6.0.2...v6.0.3) (2018-12-03)


### Bug Fixes

* **package:** make fs-extra a prod dep, not a devDep ([76ab59d](https://github.com/nodecg/nodecg-cli/commit/76ab59d))



<a name="6.0.2"></a>
## [6.0.2](https://github.com/nodecg/nodecg-cli/compare/v6.0.1...v6.0.2) (2018-12-03)



<a name="6.0.1"></a>
## [6.0.1](https://github.com/nodecg/nodecg-cli/compare/v6.0.0...v6.0.1) (2018-12-03)



<a name="6.0.0"></a>
# [6.0.0](https://github.com/nodecg/nodecg-cli/compare/v5.0.1...v6.0.0) (2018-12-03)


### Bug Fixes

* **package:** update chalk to version 2.0.0 ([#44](https://github.com/nodecg/nodecg-cli/issues/44)) ([b19ddc1](https://github.com/nodecg/nodecg-cli/commit/b19ddc1))
* **package:** update inquirer to version 4.0.0 ([#52](https://github.com/nodecg/nodecg-cli/issues/52)) ([ef4560f](https://github.com/nodecg/nodecg-cli/commit/ef4560f))


### Code Refactoring

* port to ES6 ([b373fff](https://github.com/nodecg/nodecg-cli/commit/b373fff))


### Features

* add schema-types command ([#62](https://github.com/nodecg/nodecg-cli/issues/62)) ([237d734](https://github.com/nodecg/nodecg-cli/commit/237d734))


### BREAKING CHANGES

* drop support for Node 6
* requires Node 6+



<a name="5.0.1"></a>
## [5.0.1](https://github.com/nodecg/nodecg-cli/compare/v5.0.0...v5.0.1) (2016-03-06)


### Bug Fixes

* **setup:** run `git fetch` before attempting to check out an updated release ([aa352c2](https://github.com/nodecg/nodecg-cli/commit/aa352c2))



<a name="5.0.0"></a>
# [5.0.0](https://github.com/nodecg/nodecg-cli/compare/v4.1.0...v5.0.0) (2016-03-02)


### Bug Fixes

* **install:** I'm the worst, go back to using httpsUrl ([501264d](https://github.com/nodecg/nodecg-cli/commit/501264d))
* **install:** use gitUrl instead of httpsUrl ([8c483a3](https://github.com/nodecg/nodecg-cli/commit/8c483a3))
* **install:** use ssh instead of giturl ([7c25f0f](https://github.com/nodecg/nodecg-cli/commit/7c25f0f))
* **update:** fix error when installing bundle deps ([20ccda4](https://github.com/nodecg/nodecg-cli/commit/20ccda4))

### Code Refactoring

* **install:** use system bower ([1109d82](https://github.com/nodecg/nodecg-cli/commit/1109d82))

### Features

* **install:** install command now respects semver ranges, if supplied ([3be0c6a](https://github.com/nodecg/nodecg-cli/commit/3be0c6a))
* **setup:** add `-k` alias for `--skip-dependencies` ([fcd841a](https://github.com/nodecg/nodecg-cli/commit/fcd841a))
* **update:** remove update command while its functionality is re-evaluated ([52fbe07](https://github.com/nodecg/nodecg-cli/commit/52fbe07))


### BREAKING CHANGES

* update: remove update command
* install: requires bower to be globally installed



<a name="4.1.0"></a>
# [4.1.0](https://github.com/nodecg/nodecg-cli/compare/v4.0.0...v4.1.0) (2016-02-18)


### Features

* **command:** Add defaultconfig command ([e247110](https://github.com/nodecg/nodecg-cli/commit/e247110))



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
