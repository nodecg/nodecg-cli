#!/usr/bin/env node
'use strict';

// External libs
var program = require('commander');
var npa = require('npm-package-arg');
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

program
    .option('-d, --dev', 'install development dependencies')
    .parse(process.argv);

if (!program.args[0]) {
    // If no args are supplied, assume the user is intending to operate on the bundle in the current dir
    installDeps(process.cwd(), program.dev);
} else {
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

        // Extract repo name from git url
        var temp = repoUrl.split('/').pop();
        var bundleName = temp.substr(0, temp.length - 4);
        var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);
        installDeps(bundlePath, program.dev);
        process.chdir(cwd);
    });
}
