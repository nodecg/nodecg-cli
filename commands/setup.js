'use strict';

var util = require('../lib/util');
var childProcess = require('child_process');
var exec = childProcess.exec;
var os = require('os');
var Q = require('q');
var chalk = require('chalk');

var NODECG_GIT_URL = 'https://github.com/nodecg/nodecg.git';

module.exports = function initCommand(program) {
    program
        .command('setup [version]')
        .option('-u, --update', 'Update the local NodeCG installation')
        .description('Install a new NodeCG instance')
        .action(function(version, options) {
            // We'll need this for later...
            var write = process.stderr.write;

            // We prefix our release tags with 'v'
            if (version && version.charAt(0) !== 'v') {
                version = 'v' + version;
            }

            // If NodeCG is already installed and the `-u` flag was supplied, update NodeCG
            if (util.pathContainsNodeCG(process.cwd())) {
                if (!options.update) {
                    console.log('NodeCG is already installed in this directory.');
                    console.log('Use ' + chalk.cyan('nodecg setup [version] -u') + ' if you want update your existing install.');
                    process.exit(0);
                }

                // Fetch the latest tags from GitHub
                Q.Promise(function(resolve, reject) {
                    process.stdout.write('Fetching the list of releases... ');

                    exec('git fetch', function(err, stdout, stderr) {
                        if (err) {
                            process.stdout.write(chalk.red('failed!') + os.EOL);
                            reject(err);
                            return;
                        }

                        process.stdout.write(chalk.green('done!') + os.EOL);
                        resolve();
                    });
                })

                    // If [version] was supplied, check that it exists
                    // If not, grab whatever the latest tag is
                    .then(function() {
                        var deferred = Q.defer();
                        process.stderr.write = function(){}; // Shh git...

                        if (version) {
                            process.stdout.write('Searching for release '+chalk.magenta(version)+' ... ');
                        } else {
                            process.stdout.write('Checking against local install for updates... ');
                        }


                        exec('git tag', function(err, stdout, stderr) {
                            process.stderr.write = write;

                            if (err) {
                                process.stdout.write(chalk.red('failed!') + os.EOL);
                                deferred.reject(err);
                                return;
                            }

                            var tags = stdout.trim().split('\n');
                            var current = 'v' + require(process.cwd() + '/package.json').version;

                            // If a version was specified, look for it in the list of tags
                            if (version && tags.indexOf(version) < 0) {
                                process.stdout.write(chalk.red('failed!') + os.EOL);
                                deferred.reject(new Error('The desired release, ' + chalk.magenta(version) + ', could not be found.'));
                            }

                            // Now that we know our version exists, our target is either the version or the newest tag.
                            var target = version || tags.pop();
                            process.stdout.write(chalk.green('done!') + os.EOL);

                            if (target < current) {
                                console.log(chalk.red('WARNING: ') + 'The target version (%s) is older than the current version (%s)',
                                    chalk.magenta(target), chalk.magenta(current));
                            }

                            if (target === current) {
                                console.log('Already on version %s', chalk.magenta(current));
                                return;
                            }

                            deferred.resolve({
                                updatingToLatest: Boolean(!version),
                                current: current,
                                target: target
                            });
                        });

                        return deferred.promise;
                    })

                    // Now that we know for sure if the target tag exists (and if its newer or older than current),
                    // we can `git pull` and `git checkout <tag>` if appropriate.
                    .then(function(result) {
                        if (result.updatingToLatest && result.current >= result.latest) {
                            console.log('No updates found! Your current version (%s) is the latest.', chalk.magenta(result.current));
                            return;
                        }

                        var deferred = Q.defer();
                        process.stderr.write = function(){}; // Shh git...
                        process.stdout.write('Updating from '+chalk.magenta(result.current)+' to '+chalk.magenta(result.target)+'... ');
                        exec('git pull origin master', function(err, stdout, stderr) {
                            if (err) {
                                process.stdout.write(chalk.red('failed!') + os.EOL);
                                deferred.reject(err);
                                return;
                            }

                            exec('git checkout ' + result.target, function(err, stdout, stderr) {
                                process.stderr.write = write;

                                if (err) {
                                    process.stdout.write(chalk.red('failed!') + os.EOL);
                                    deferred.reject(err);
                                    return;
                                }

                                process.stdout.write(chalk.green('done!') + os.EOL);
                                deferred.resolve(result.target);
                            });
                        });

                        return deferred.promise;
                    })

                    .catch(function(e) {
                        process.stderr.write = write;
                        console.error('Failed to update NodeCG:', os.EOL, e.message);
                    })

                    .done(function(target) {
                        if (target) {
                            console.log('NodeCG updated to', chalk.magenta(target));
                        }
                    });
                return;
            }

            // If we're here, then NodeCG must not be installed yet.
            // Clone it into the cwd.
            Q.Promise(function(resolve, reject) {
                process.stdout.write('Cloning NodeCG... ');
                process.stderr.write = function(){}; // Shh git...

                exec('git clone ' + NODECG_GIT_URL + ' .', function(err, stdout, stderr) {
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

                // If [version] was supplied, checkout that version
                .then(function() {
                    if (!version) return;

                    var deferred = Q.defer();
                    process.stderr.write = function(){}; // Shh git...
                    process.stdout.write('Checking out version ' + version + '... ');

                    // If a specific version tag argument was supplied, check out that tag
                    exec('git checkout ' + version, function(err, stdout, stderr) {
                        process.stderr.write = write;

                        if (err) {
                            process.stdout.write(chalk.red('failed!') + os.EOL);
                            deferred.reject(err);
                            return;
                        }

                        process.stdout.write(chalk.green('done!') + os.EOL);
                        deferred.resolve();
                    });

                    return deferred.promise;
                })

                // Install NodeCG's production depdendencies (`npm install --production`)
                .then(function(){
                    process.stdout.write('Installing production npm dependencies... ');
                    var deferred = Q.defer();
                    exec('npm install --production', {}, function(err, stdout, stderr) {
                        if (stderr) console.error(stderr);
                        if (err) {
                            process.stdout.write(chalk.red('failed!') + os.EOL);
                            deferred.reject(err);
                            return;
                        }
                        process.stdout.write(chalk.green('done!') + os.EOL);
                        deferred.resolve();
                    });
                    return deferred.promise;
                })

                .catch(function(e) {
                    process.stderr.write = write;
                   console.error('Failed to setup NodeCG:', os.EOL, e.message);
                })

                .done(function() {
                    console.log('NodeCG (%s) installed to', version ? version : 'latest', process.cwd());
                });
        });
};
