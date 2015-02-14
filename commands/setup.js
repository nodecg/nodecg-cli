'use strict';

var util = require('../lib/util');
var childProcess = require('child_process');
var exec = childProcess.exec;
var os = require('os');
var Q = require('q');

var NODECG_GIT_URL = 'https://github.com/nodecg/nodecg.git';

module.exports = function initCommand(program) {
    program
        .command('setup [version]')
        .description('Install a new NodeCG instance')
        .action(function(version) {
            // Check if nodecg is already installed
            if (util.pathContainsNodeCG(process.cwd())) {
                console.log('NodeCG is already installed in this directory');
                process.exit(0);
            }

            // We prefix our release tags with 'v'
            if (version && version.charAt(0) !== 'v') {
                version = 'v' + version;
            }

            Q.Promise(function(resolve, reject) {
                process.stdout.write('Cloning NodeCG...');

                // Put the earbuds in
                var write = process.stderr.write;
                process.stderr.write = function(){};

                exec('git clone ' + NODECG_GIT_URL + ' .', function(err, stdout, stderr) {
                    // Take them earbuds out
                    process.stderr.write = write;

                    if (err) {
                        reject(new Error('Failed to clone NodeCG:', err.message));
                    }

                    process.stdout.write(' done!' + os.EOL);
                    resolve();
                });
            })
                .then(function() {
                    if (!version) return;

                    var deferred = Q.defer();

                    // Put the earbuds in
                    var write = process.stderr.write;
                    process.stderr.write = function(){};

                    process.stdout.write('Checking out version ' + version + '...');

                    // If a specific version tag argument was supplied, check out that tag
                    exec('git checkout ' + version, function(err, stdout, stderr) {
                        // Take them earbuds out
                        process.stderr.write = write;

                        if (err) {
                            deferred.reject(new Error('Failed to checkout NodeCG version %s:', version, err.message));
                        }

                        process.stdout.write(' done!' + os.EOL);
                        deferred.resolve();
                    });

                    return deferred.promise;
                })
                .then(function(){
                    process.stdout.write('Installing production npm dependencies...');
                    var deferred = Q.defer();
                    exec('npm install --production', {}, function(err, stdout, stderr) {
                        if (stderr) console.error(stderr);
                        if (err) {
                            deferred.reject(new Error('Failed to install npm dependencies:', err.message));
                        }
                        process.stdout.write(' done!' + os.EOL);
                        deferred.resolve();
                    });
                    return deferred.promise;
                })
                .catch(function(e) {
                   console.error('Failed to setup NodeCG:', e);
                })
                .done(function() {
                    console.log('NodeCG (%s) installed to', version ? version : 'latest', process.cwd());
                });

            /*clone(NODECG_GIT_URL, process.cwd(), opts)
                .then(function(repo) {
                    // If a specific version tag was supplied, checkout that tag
                    if (version) {
                        console.log('Checking out version', version);
                        return repo.getReferenceCommit(version)
                            .then(function(tag) {
                                return Checkout.tree(repo, tag, { checkoutStrategy: Checkout.STRATEGY.SAFE_CREATE });
                            })
                    }
                })
                .then(function(){
                    console.log('Installing production npm dependencies');
                    var deferred = Q.defer();
                    exec('npm install --production', {}, function(err, stdout, stderr) {
                        if (stderr) console.error(stderr);
                        if (err) {
                            deferred.reject(new Error('Failed to install npm dependencies:', err.message));
                        }
                        deferred.resolve();
                    });
                    return deferred.promise;
                })
                .catch(function(err) {
                    if (err.toString() === 'Error: The requested type does not match the type in the ODB') {
                        console.log('Could not find the specified version tag.');
                        console.log('A list of tags can be found here: https://github.com/nodecg/nodecg/releases');
                        console.log('Please be aware that only annotated tags (tags with descriptions) are currently supported.');
                    } else {
                        console.error(err.stack);
                    }
                    process.exit(1);
                })
                .done(function() {
                    console.log('NodeCG (%s) installed to', version ? version : 'latest', process.cwd());
                });*/
        });
};
