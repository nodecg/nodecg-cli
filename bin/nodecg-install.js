#!/usr/bin/env node
'use strict';

var program = require('commander');

// External libs
var npa = require('npm-package-arg');

// Pass in the descriptor, and it'll return an object
var parsed = npa(program.args[0]);

program
    .option('-d, --dev', 'install development dependencies')
    .parse(process.argv);

if (parsed.type === 'git') {
    // clone the git repo
}

if (parsed.type === 'hosted') {
    // clone the hosted git repo
}

if (program.dev) {
    // take the contents of nodecg-installdev.js and put them in here
}