'use strict';

var fs = require('fs');
var path = require('path');
var Q = require('q');
var exec = require('child_process').exec;
var semver = require('semver');

module.exports = function (bundlePath, installDev) {
    var deferred = Q.defer();

    var manifestPath = path.join(bundlePath, 'nodecg.json');
    if (!fs.existsSync(manifestPath)) {
        console.error('nodecg.json not found, are you sure you\'re in a bundle directory?');
        process.exit(1);
    }

    var bundle = require(manifestPath);
    bundle.dir = bundlePath;

    // Check for existing dependencies
    var cmdline = 'npm ls --json --depth=0';
    exec(cmdline, { cwd: bundle.dir }, function(err, stdout, stderr) {
        if (stderr) console.error(stderr);
        var data = JSON.parse(stdout);

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
                fs.mkdirSync(bundlePath + '/node_modules');
            }

            cmdline = 'npm install ' + toInstall.join(' ');

            exec(cmdline, { cwd: bundle.dir }, function(err, stdout, stderr) {
                if (stderr) console.error(stderr);
                if (err) {
                    deferred.reject(new Error('Failed to install npm dependencies:', err.message));
                }
                deferred.resolve();
            });
        } else {
            console.log('No dependencies to install.');
            deferred.resolve();
        }
    });

    return deferred.promise;
};
