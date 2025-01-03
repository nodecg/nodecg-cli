# nodecg-cli [![CI](https://github.com/nodecg/nodecg-cli/actions/workflows/ci.yml/badge.svg)](https://github.com/nodecg/nodecg-cli/actions/workflows/ci.yml)

[NodeCG](https://github.com/nodecg/nodecg)'s command line interface.

## Deprecation Notice

`nodecg-cli` has been migrated to [`nodecg`](github.com/nodecg/nodecg). This repository is now deprecated and will no longer be maintained. Please uninstall `nodecg-cli` and install `nodecg` instead.

```sh
npm un -g nodecg-cli
npm i -g nodecg
```

The `nodecg` includes the CLI from v2.4.0, which is equivalent to `nodecg-cli@9.0.1`.

## Compatibility

- `nodecg-cli` version earlier than 8.6.1 is not compatible with NodeCG 2.x.x.
- `nodecg-cli` version 9.0.0 and later are not compatible with NodeCG 0.x.x and 1.x.x.

| NodeCG | nodecg-cli |
| ------ | ---------- |
| 0.x.x  | < 9.0.0    |
| 1.x.x  | < 9.0.0    |
| 2.x.x  | >= 8.6.1   |

## Installation

First, make sure you have [git](http://git-scm.com/) installed, and that it is in your PATH.

Once those are installed, you may install nodecg-cli via npm:

```sh
npm install -g nodecg-cli
```

Installing `nodecg-cli` does not install `NodeCG`.
To install an instance of `NodeCG`, use the `setup` command in an empty directory:

```sh
mkdir nodecg
cd nodecg
nodecg setup
```

## Usage

- `nodecg setup [version] [--update]`, install a new instance of NodeCG. `version` is a semver range.
  If `version` is not supplied, the latest release will be installed.
  Enable `--update` flag to install over an existing copy of NodeCG.
- `nodecg start`, start the NodeCG instance in this directory path
- `nodecg install [repo] [--dev]`, install a bundle by cloning a git repo.
  Can be a GitHub owner/repo pair (`supportclass/lfg-sublistener`) or https git url (`https://github.com/SupportClass/lfg-sublistener.git`).
  If run in a bundle directory with no arguments, installs that bundle's dependencies.
  Enable `--dev` flag to install the bundle's `devDependencies`.
- `nodecg uninstall <bundle>`, uninstall a bundle
- `nodecg defaultconfig`, If a bundle has a `configschema.json` present in its root, this command will create a default
  config file at `nodecg/cfg/:bundleName.json` with defaults based on that schema.
- `nodecg schema-types [dir]`, Generate d.ts TypeScript typedef files from Replicant schemas and configschema.json (if present)
