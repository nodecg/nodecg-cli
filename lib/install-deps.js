'use strict';

var fs = require('fs.extra');
var path = require('path');
var semver = require('semver');
var format = require('util').format;
var chalk = require('chalk');
var os = require('os');
var execSync = require('child_process').execSync;

module.exports = function (bundlePath, installDev) {
    var manifestPath = path.join(bundlePath, 'nodecg.json');
    if (!fs.existsSync(manifestPath)) {
        console.error('nodecg.json not found, are you sure you\'re in a bundle directory?');
        process.exit(1);
    }

    var bundle = require(manifestPath);
    bundle.dir = bundlePath;

    // Check for existing dependencies
    var cmdline = 'npm ls --json --depth=0';
    try {
        var data = JSON.parse(execSync(cmdline, { cwd: bundlePath, stdio: ['pipe', 'pipe', 'pipe'] }));
    } catch (e) {
        console.error(e.stack);
        return;
    }

    var toInstall = [];

    // For each dependency, make an arg string and push it onto the toInstall array
    for (var dependency in bundle.dependencies) {
        if (!bundle.dependencies.hasOwnProperty(dependency)) continue;

        if (!data.dependencies ||
            !data.dependencies[dependency] ||
            !semver.satisfies(data.dependencies[dependency].version, bundle.dependencies[dependency])) {
            toInstall.push(dependency + '@' + bundle.dependencies[dependency]);
        }
    }

    // If we're installing dev dependencies, do the same for those
    if (installDev) {
        for (dependency in bundle.devDependencies) {
            if (!bundle.devDependencies.hasOwnProperty(dependency)) continue;

            if (!data.dependencies ||
                !data.dependencies[dependency] ||
                !semver.satisfies(data.dependencies[dependency].version, bundle.devDependencies[dependency])) {
                toInstall.push(dependency + '@' + bundle.devDependencies[dependency]);
            }
        }
    }

    if (toInstall.length > 0) {
        // Make node_modules if it doesn't exist
        // Crucial for npm to install into the expected path
        if (!fs.existsSync(bundlePath + '/node_modules')) {
            fs.mkdirpSync(bundlePath + '/node_modules');
        }

        cmdline = 'npm install ' + toInstall.join(' ');
        process.stdout.write(format('Installing dependencies (dev: %s)...', installDev));
        try {
            execSync(cmdline, { cwd: bundlePath, stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }
    } else {
        console.log('No dependencies to install.');
    }
};