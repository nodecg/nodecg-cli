'use strict';

var fs = require('fs');
var os = require('os');
var installDeps = require('../lib/install-deps');
var exec = require('child_process').exec;
var npa = require('npm-package-arg');
var path = require('path');
var util = require('../lib/util');
var format = require('util').format;
var Q = require('q');
var chalk = require('chalk');

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
                    // TODO: This line was meant to accomodate nodegit, which is no longer used. Is is still needed?
                    repoUrl = parsed.spec.replace('+https', ''); //nodegit doesn't support git+https:// addresses
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

                // Extract repo name from git url
                var temp = repoUrl.split('/').pop();
                var bundleName = temp.substr(0, temp.length - 4);
                var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);

                var write = process.stderr.write;
                Q.Promise(function(resolve, reject) {
                    process.stdout.write('Installing ' + bundleName + '... ');

                    // Make git be quiet
                    process.stderr.write = function(){};

                    var cmdline = format('git clone %s "%s"', repoUrl, bundlePath);
                    exec(cmdline, function(err, stdout, stderr) {
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
                        return installDeps(bundlePath, dev);
                    })
                    .catch(function(err) {
                        process.stderr.write = write;
                        console.error(err.message);
                        process.exit(1);
                    });
            }
        });

};
