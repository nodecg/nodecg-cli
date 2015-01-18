#!/usr/bin/env node
'use strict';

// Nodejs libs
var fs = require('fs');

// External libs
var program = require('commander');
var git = require('../lib/git');
var findup = require('findup-sync');
var path = require('path');

// Internal libs
var installDeps = require('../lib/install-deps');

var nodecgPath = findup('nodecg/');
if (!nodecgPath) {
    console.error('NodeCG installation not found, are you in the right directory?');
    process.exit(1);
}

program.parse(process.argv);

if (!program.args[0]) {
    // If no args are supplied, assume the user is intending to operate on the bundle in the current dir
    var bundleName = path.basename(process.cwd());
    update(bundleName);
} else if (program.args[0] === '*') {
    // update all bundles

    // disabled for now, need to make this sync
    return;

    var bundlesPath = path.join(nodecgPath, 'bundles/');
    var bundlesPathContents = fs.readdirSync(bundlesPath);
    bundlesPathContents.forEach(function(bundleFolderName) {
        if (!fs.lstatSync(bundleFolderName).isDirectory()) return;
        update(bundleFolderName);
    });
} else {
    // update a single bundle
    update(program.args[0]);
}

function update(bundleName) {
    var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);
    var manifestPath = path.join(bundlePath, 'nodecg.json');
    if (!fs.existsSync(manifestPath)) {
        console.error('nodecg.json not found, are you in a bundle directory?');
        process.exit(1);
    }

    var cwd = process.cwd();
    process.chdir(bundlePath);
    git.pull(function(err) {
        if (err) {
            console.error(err.message);
            process.chdir(cwd);
            process.exit(1);
        }
        installDeps(bundlePath);
        process.chdir(cwd);
    });
}
