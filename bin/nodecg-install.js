#!/usr/bin/env node
'use strict';

var program = require('commander');

// External libs
var npa = require('npm-package-arg');
var git = require('../lib/git');
var findup = require('findup-sync');
var path = require('path');

var nodecgPath = findup('nodecg/');
if (!nodecgPath) {
    console.error('NodeCG installation not found, are you in the right directory?');
    process.exit(1);
}

program
    .option('-d, --dev', 'install development dependencies')
    .parse(process.argv);

if (!program.args[0]) {
    console.log('Hay do stuff if no arg is supplied');
    process.exit(0);
}

var parsed = npa(program.args[0]);
var repoUrl = null;

if (parsed.type === 'git') {
    repoUrl = parsed.spec;
} else if (parsed.type === 'hosted') {
    repoUrl = parsed.hosted.httpsUrl;
} else {
    console.error('Please enter a valid git url (https) or GitHub username/repo pair.');
    process.exit(1);
}

var bundlesPath = path.join(nodecgPath, 'bundles');
var cwd = process.cwd();
process.chdir(bundlesPath);
git.clone(repoUrl, '', function(err) {
    if (err) {
        console.error(err.message);
        process.chdir(cwd);
        process.exit(1);
    }
});

process.chdir(cwd);

if (program.dev) {
    // take the contents of nodecg-installdev.js and put them in here
}
