'use strict';

var fs = require('fs');
var program = require('commander');
var git = require('../lib/git');
var path = require('path');
var installDeps = require('../lib/install-deps');
var util = require('../lib/util');

module.exports = function updateCommand(program) {
    var nodecgPath = process.cwd();

    function update(bundleName) {
        var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);
        var manifestPath = path.join(bundlePath, 'nodecg.json');
        if (!fs.existsSync(manifestPath)) {
            console.error('nodecg.json not found, are you in a bundle directory?');
            process.exit(1);
        }

        var cwd = process.cwd();
        process.chdir(bundlePath);
        git.pull(function(err) {
            if (err) {
                console.error(err.message);
                process.chdir(cwd);
                process.exit(1);
            }
            installDeps(bundlePath);
            process.chdir(cwd);
        });
    }

    program
        .command('update [bundleName]')
        .description('\'git pull\' a bundle. If run with no arguments, attempts to update the bundle in the current directory (if any).')
        .action(function(bundleName) {
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
