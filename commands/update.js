'use strict';

var fs = require('fs');
var path = require('path');
var installDeps = require('../lib/install-deps');
var util = require('../lib/util');
var chalk = require('chalk');
var os = require('os');
var execSync = require('child_process').execSync;

module.exports = function updateCommand(program) {
    var nodecgPath = util.getNodeCGPath();

    function update(bundleName, installDev) {
        var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);
        var manifestPath = path.join(bundlePath, 'package.json');

        if (!fs.existsSync(bundlePath)) {
            console.error('Bundle %s is not installed, not updating', bundleName);
            return;
        }

        if (!fs.existsSync(manifestPath)) {
            console.error('package.json not found, are you in a bundle directory?');
            return;
        }

        process.stdout.write('Updating ' + bundleName + '... ');
        try {
            execSync('git pull', { cwd: bundlePath, stdio: ['pipe', 'pipe', 'pipe'] });
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }

        // After updating the bundle, install/update its npm dependencies
        installDeps(bundlePath, installDev);
    }

    program
        .command('update [bundleName]')
        .description('\'git pull\' a bundle. If run with no arguments, ' +
            'attempts to update the bundle in the current directory (if any).')
        .option('-d, --dev', 'install development dependencies')
        .action(function(bundleName, options) {
            var cwd = process.cwd();

            // If we are in a bundle folder...
            if (util.isBundleFolder(cwd)) {
                bundleName = bundleName || path.basename(cwd);
            }

            else if (!util.pathContainsNodeCG(nodecgPath)) {
                console.error('NodeCG installation not found, are you in the right directory?');
                process.exit(1);
            }

            var dev = options.dev || false;
            if (bundleName === '*') {
                // update all bundles
                var bundlesPath = path.join(nodecgPath, 'bundles/');
                var bundlesPathContents = fs.readdirSync(bundlesPath);
                bundlesPathContents.forEach(function(bundleFolderName) {
                    var bundlePath = path.join(bundlesPath, bundleFolderName);
                    if (!fs.lstatSync(bundlePath).isDirectory()) return;
                    update(bundleFolderName, dev);
                });
            } else {
                // update a single bundle
                update(bundleName, dev);
            }
        });
};
