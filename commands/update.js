'use strict';

var fs = require('fs');
var path = require('path');
var installDeps = require('../lib/install-deps');
var util = require('../lib/util');
var chalk = require('chalk');
var os = require('os');
var childProcess = require('child_process');

module.exports = function updateCommand(program) {
    function update(bundleName, installDev) {
        var nodecgPath = util.getNodeCGPath();
        var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);

        if (!fs.existsSync(bundlePath)) {
            console.error('Bundle %s is not installed, not updating', bundleName);
            return;
        }

        process.stdout.write('Updating ' + bundleName + '... ');
        try {
            childProcess.execSync('git pull', { cwd: bundlePath, stdio: ['pipe', 'pipe', 'pipe'] });
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            /* istanbul ignore next */ process.stdout.write(chalk.red('failed!') + os.EOL);
            /* istanbul ignore next */ console.error(e.stack);
            /* istanbul ignore next */ return;
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
            var nodecgPath = util.getNodeCGPath();

            // If no bundle name was provided...
            if (!bundleName) {
                // If we are in a bundle folder, use the current bundle as the update target.
                if (util.isBundleFolder(cwd)) {
                    bundleName = bundleName || path.basename(cwd);
                }

                // Else, print an error and exit.
                else {
                    console.error(chalk.red('Error:') + ' No bundle found in the current directory!');
                    return;
                }
            }

            else if (!util.pathContainsNodeCG(nodecgPath)) {
                console.error('NodeCG installation not found, are you in the right directory?');
                return;
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
