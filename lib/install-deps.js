'use strict';

var fs = require('fs.extra');
var path = require('path');
var format = require('util').format;
var chalk = require('chalk');
var os = require('os');
var execSync = require('child_process').execSync;
var util = require('./util');

module.exports = function (bundlePath, installDev) {
    if (!util.isBundleFolder(bundlePath)) {
        console.error(chalk.red('Error:') + ' There doesn\'t seem to be a valid NodeCG bundle in this folder:' +
            '\n\t' + chalk.magenta(bundlePath));
        process.exit(1);
    }

    var cmdline;

    if (fs.existsSync(bundlePath + '/package.json')) {
        process.chdir(bundlePath);
        cmdline = installDev ? 'npm install' : 'npm install --production';
        process.stdout.write(format('Installing npm dependencies (dev: %s)... ', installDev));
        try {
            execSync(cmdline, {cwd: bundlePath, stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }
    }

    if (fs.existsSync(bundlePath + '/bower.json')) {
        // rofl
        // Amazing hack to synchronously install bower components without having to rely on
        // `bower` being in the users' PATH.
        var bowerPath = path.resolve(__dirname, '../node_modules/bower/bin/bower');
        cmdline = format('node "%s" install %s', bowerPath, installDev ? '' : '--production');
        process.stdout.write(format('Installing bower dependencies (dev: %s)... ', installDev));
        try {
            execSync(cmdline, {cwd: bundlePath, stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
        }
    }
};
