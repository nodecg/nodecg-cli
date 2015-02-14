'use strict';

var util = require('../lib/util');
var nodegit = require('nodegit');
var clone = nodegit.Clone.clone;
var Checkout = nodegit.Checkout;
var Q = require('q');
var exec = require('child_process').exec;

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

            // Github SSL cert isn't trusted by nodegit on OS X d-(^_^)z
            var opts = { ignoreCertErrors: 1 };

            console.log('Cloning NodeCG');
            clone(NODECG_GIT_URL, process.cwd(), opts)
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
                });
        });
};
