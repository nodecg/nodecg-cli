#!/usr/bin/env node
'use strict';

// Nodejs libs
var fs = require('fs');

// External libs
var npm = require('npm');

// Parse nodecg.json. If it doesn't exist, exit.
if (!fs.existsSync('nodecg.json')) {
    console.error('nodecg.json not found in current directory');
    process.exit(1);
}

var bundle = require (process.cwd() + '/nodecg.json');

if (!bundle.devDependencies) {
    console.log('%s has no devDependencies');
    process.exit(0);
}

npm.load({ prefix: process.cwd(), loglevel: 'warn' }, function (er) {
    if (er) {
        console.error('Failed to load npm:', er.message);
        return;
    }
    // npm.commands.install takes an array of string arguments
    // we must take the bundle's list of deps and turn them into arg strings
    var args = [];
    for (var dep in bundle.devDependencies) {
        if (!bundle.devDependencies.hasOwnProperty(dep)) continue;
        args.push(dep + '@' + bundle.devDependencies[dep]);
    }

    npm.commands.install(args, function (er, data) {
        if (er) {
            console.error('Failed to install devDependencies:', er.message);
        }
    });
});