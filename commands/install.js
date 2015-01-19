'use strict';

var fs = require('fs');
var git = require('../lib/git');
var installDeps = require('../lib/install-deps');
var npa = require('npm-package-arg');
var path = require('path');
var util = require('../lib/util');

module.exports = function installCommand(program) {
    program
        .command('install [repo]')
        .description('Install a bundle by cloning a git repo. Can be a GitHub owner/repo pair or a git url.' +
                     '\n\t\t    If run in a bundle directory with no arguments, installs that bundle\'s dependencies.')
        .option('-d, --dev', 'install development dependencies')
        .action(function(repo, options) {
            var nodecgPath = process.cwd();
            if (!util.pathContainsNodeCG(nodecgPath)) {
                console.error('NodeCG installation not found, are you in the right directory?');
                process.exit(1);
            }

            var dev = options.dev || false;

            if (!repo) {
                // If no args are supplied, assume the user is intending to operate on the bundle in the current dir
                installDeps(process.cwd(), dev)
            } else {
                var parsed = npa(repo);
                var repoUrl = null;

                if (parsed.type === 'git') {
                    repoUrl = parsed.spec;
                } else if (parsed.type === 'hosted') {
                    repoUrl = parsed.hosted.httpsUrl;
                } else {
                    console.error('Please enter a valid git url (https) or GitHub username/repo pair.');
                    process.exit(1);
                }

                var bundlesPath = path.join(nodecgPath, 'bundles');
                // Check that bundles exists
                if (!fs.existsSync(bundlesPath)) {
                    fs.mkdirSync(bundlesPath);
                }

                var cwd = process.cwd();
                process.chdir(bundlesPath);
                git.clone(repoUrl, function(err) {
                    if (err) {
                        console.error(err.message);
                        process.chdir(cwd);
                        process.exit(1);
                    }

                    // Extract repo name from git url
                    var temp = repoUrl.split('/').pop();
                    var bundleName = temp.substr(0, temp.length - 4);
                    var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);
                    installDeps(bundlePath, dev);
                    process.chdir(cwd);
                });
            }
        });

};
