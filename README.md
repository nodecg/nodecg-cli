# nodecg-cli
[NodeCG](https://github.com/nodecg/nodecg)'s command line interface.

[![Build Status](https://travis-ci.org/nodecg/nodecg-cli.svg?branch=master)](https://travis-ci.org/nodecg/nodecg-cli)
[![Coverage Status](https://coveralls.io/repos/github/nodecg/nodecg-cli/badge.svg?branch=master)](https://coveralls.io/github/nodecg/nodecg-cli?branch=master)

## Installation
First, make sure you have [git](http://git-scm.com/) installed, and that it is in your PATH. Then, install via npm:
```sh
npm install -g nodecg-cli
````

Installing `nodecg-cli` does not install `NodeCG`. 
To install an instance of `NodeCG`, use the `setup` command in an empty directory:
```sh
mkdir nodecg
cd nodecg
nodecg setup
```

## Usage
* `nodecg setup [version] [--update]`, install a new instance of NodeCG. `version` is a semver range.
If `version` is not supplied, the latest release will be installed.
Enable `--update` flag to install over an existing copy of NodeCG.
* `nodecg start`, start the NodeCG instance in this directory path
* `nodecg install [repo] [--dev]`, install a bundle by cloning a git repo.
Can be a GitHub owner/repo pair (`supportclass/lfg-sublistener`) or https git url (`https://github.com/SupportClass/lfg-sublistener.git`).
If run in a bundle directory with no arguments, installs that bundle's dependencies.
Enable `--dev` flag to install the bundle's `devDependencies`.
* `nodecg uninstall <bundle>`, uninstall a bundle
* `nodecg update [bundle|*] [--dev]`, Runs `git pull` on a bundle. Use `*` to update all installed bundles. 
Re-installs the bundles `dependencies` after updating. If run with no arguments, 
attempts to update the bundle in the current directory (if any). 
Enable `--dev` flag to install the bundle's `devDependencies`.

## Special Thanks
This CLI program is based on [Tim Santeford's commander.js starter](https://github.com/tsantef/commander-starter).
