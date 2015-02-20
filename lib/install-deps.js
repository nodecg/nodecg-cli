'use strict';

var fs = require('fs.extra');
var path = require('path');
var bower = require('bower');
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
    var cmdline;
    bundle.dir = bundlePath;

    if (fs.existsSync(bundlePath + '/package.json')) {
        cmdline = installDev ? 'npm install' : 'npm install --production';
        process.stdout.write(format('Installing npm dependencies (dev: %s)...', installDev));
        try {
            execSync(cmdline, { cwd: bundlePath, stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }
    }

    if (fs.existsSync(bundlePath + '/package.json')) {
        // rofl
        // Amazing hack to synchronously install bower components without having to rely on
        // `bower` being in the users' PATH.
        cmdline = 'node ../../../node_modules/bower/bin/bower install' + (installDev ? '' : ' --production');
        process.stdout.write(format('Installing bower dependencies (dev: %s)...', installDev));
        try {
            execSync(cmdline, { cwd: bundlePath, stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }
    }
};