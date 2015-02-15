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

            var write = process.stderr.write;
            Q.Promise(function(resolve, reject) {
                process.stdout.write('Cloning NodeCG...');

                // Shh git...
                process.stderr.write = function(){};

                exec('git clone ' + NODECG_GIT_URL + ' .', function(err, stdout, stderr) {
                    process.stderr.write = write;

                    if (err) {
                        process.stdout.write(chalk.red(' failed!') + os.EOL);
                        reject(err);
                        return;
                    }

                    process.stdout.write(chalk.green(' done!') + os.EOL);
                    resolve();
                });
            })
                .then(function() {
                    if (!version) return;

                    var deferred = Q.defer();

                    // Shh git...
                    process.stderr.write = function(){};

                    process.stdout.write('Checking out version ' + version + '...');

                    // If a specific version tag argument was supplied, check out that tag
                    exec('git checkout ' + version, function(err, stdout, stderr) {
                        process.stderr.write = write;

                        if (err) {
                            process.stdout.write(chalk.red(' failed!') + os.EOL);
                            deferred.reject(err);
                            return;
                        }

                        process.stdout.write(chalk.green(' done!') + os.EOL);
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
                            process.stdout.write(chalk.red(' failed!') + os.EOL);
                            deferred.reject(err);
                            return;
                        }
                        process.stdout.write(chalk.green(' done!') + os.EOL);
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
