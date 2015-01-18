# nodecg-cli
[NodeCG](https://github.com/nodecg/nodecg)'s command line interface.

## Installation
`npm install -g nodecg-cli`

Installing `nodecg-cli` does not install `NodeCG`. To install an instance of `NodeCG`, use the `init` command in an empty directory:
```
mkdir nodecg
cd nodecg
nodecg init
```

## Usage
* `nodecg init [version]`, install a new instance of NodeCG; defaults to `latest`
* `nodecg config`, interactively generate a new NodeCG config file (WIP, feedback wanted)
* `nodecg start`, start the NodeCG instance in this directory path
* `nodecg bundle`, interactively generate a new NodeCG bundle template (WIP, feedback wanted)
* `nodecg install [repo] [--dev]`, install a bundle by cloning a git repo. Can be a GitHub owner/repo pair (`supportclass/lfg-sublistener`) or https git url (`https://github.com/SupportClass/lfg-sublistener.git`).
If run in a bundle directory with no arguments, installs that bundle\'s dependencies. Enable `--dev` flag to install the bundle's `devDependencies`.
* `nodecg update`, `git pull` a bundle. If run with no arguments, attempts to update the bundle in the current directory (if any)
