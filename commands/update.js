'use strict';

var fs = require('fs');
var path = require('path');
var installDeps = require('../lib/install-deps');
var util = require('../lib/util');
var Q = require('q');
var chalk = require('chalk');
var os = require('os');
var exec = require('child_process').exec;

module.exports = function updateCommand(program) {
    var nodecgPath = process.cwd();

    function update(bundleName) {
        var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);
        var manifestPath = path.join(bundlePath, 'nodecg.json');
        if (!fs.existsSync(manifestPath)) {
            console.error('nodecg.json not found, are you in a bundle directory?');
            process.exit(1);
        }

        process.chdir(bundlePath);
        var write = process.stderr.write;
        Q.Promise(function(resolve, reject) {
            process.stdout.write('Updating ' + bundleName + '... ');

            // Make git be quiet
            process.stderr.write = function(){};

            exec('git pull', function(err, stdout, stderr) {
                process.stderr.write = write;

                if (err) {
                    process.stdout.write(chalk.red('failed!') + os.EOL);
                    reject(err);
                    return;
                }

                process.stdout.write(chalk.green('done!') + os.EOL);
                resolve();
            });
        })
            .then(function() {
                return installDeps(bundlePath);
            })
            .catch(function(err) {
                process.stderr.write = write;
                console.error(err.message);
                process.exit(1);
            });
    }

    program
        .command('update [bundleName]')
        .description('\'git pull\' a bundle. If run with no arguments, attempts to update the bundle in the current directory (if any).')
        .action(function(bundleName) {
            // TODO: this prevents this command working from within a bundle's directory
            if (!util.pathContainsNodeCG(nodecgPath)) {
                console.error('NodeCG installation not found, are you in the right directory?');
                process.exit(1);
            }

            bundleName = bundleName || path.basename(process.cwd());

            if (bundleName === '*') {
                // update all bundles

                // disabled for now, need to make this sync
                return;

                /*var bundlesPath = path.join(nodecgPath, 'bundles/');
                var bundlesPathContents = fs.readdirSync(bundlesPath);
                bundlesPathContents.forEach(function(bundleFolderName) {
                    if (!fs.lstatSync(bundleFolderName).isDirectory()) return;
                    update(bundleFolderName);
                });*/
            } else {
                // update a single bundle
                update(bundleName);
            }
        })

};
