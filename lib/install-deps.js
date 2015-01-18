'use strict';

var npm = require('npm');
var fs = require('fs');
var path = require('path');

module.exports = function (bundlePath, installDev) {
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

        if (installDev) {
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
};