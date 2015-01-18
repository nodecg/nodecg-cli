#!/usr/bin/env node
'use strict';

// Nodejs libs
var fs = require('fs');

// External libs
var program = require('commander');
var npa = require('npm-package-arg');
var git = require('../lib/git');
var findup = require('findup-sync');
var path = require('path');
var npm = require('npm');

var nodecgPath = findup('nodecg/');
if (!nodecgPath) {
    console.error('NodeCG installation not found, are you in the right directory?');
    process.exit(1);
}

program
    .option('-d, --dev', 'install development dependencies')
    .parse(process.argv);

if (!program.args[0]) {
    installDeps(process.cwd());
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
        installDeps(bundlePath);
    });
    process.chdir(cwd);
}

function installDeps(bundlePath) {
    // If no args are supplied, assume the user is intending to update the bundle in the current dir
    var manifestPath = path.join(bundlePath, 'nodecg.json');
    if (!fs.existsSync(manifestPath)) {
        console.error('nodecg.json not found, are you in a bundle directory?');
        process.exit(1);
    }

    var bundle = require(manifestPath);
    npm.load({ prefix: process.cwd(), loglevel: 'warn' }, function npmLoaded(err) {
        if (err) {
            console.errror('Failed to load npm:', err.message);
            return;
        }

        // npm.commands.install takes an array of string arguments
        // we must take the bundle's list of deps and turn them into arg strings
        var args = [];
        for (var dep in bundle.dependencies) {
            if (!bundle.dependencies.hasOwnProperty(dep)) continue;
            args.push(dep + '@' + bundle.dependencies[dep]);
        }
        if (program.dev) {
            for (dep in bundle.devDependencies) {
                if (!bundle.devDependencies.hasOwnProperty(dep)) continue;
                args.push(dep + '@' + bundle.devDependencies[dep]);
            }
        }

        if (args.length <= 0) {
            console.log('No dependencies to install.');
            return;
        }

        npm.commands.install(args, function afterNpmInstall(err, data) {
            if (err) {
                console.error('Failed to install dependencies:', err.message);
            }
        });
    });
}
