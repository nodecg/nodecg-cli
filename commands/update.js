'use strict';

var fs = require('fs');
var nodegit = require('nodegit');
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

        var repository;

        // Open a repository that needs to be fetched and fast-forwarded
        nodegit.Repository.open(bundlePath)
            .then(function(repo) {
                repository = repo;

                return repository.fetchAll({
                    credentials: function(url, userName) {
                        return nodegit.Cred.sshKeyFromAgent(userName);
                    }
                }, true);
            })
            // Now that we're finished fetching, go ahead and merge our local branch
            // with the new one
            .then(function() {
                // TODO: work on branches other than master
                repository.mergeBranches("master", "origin/master");
            })
            .done(function() {
                // TODO: make installDeps return a promise
                installDeps(bundlePath);
            })
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
