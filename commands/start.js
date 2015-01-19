'use strict';

var util = require('../lib/util');

module.exports = function startCommand(program) {
    program
        .command('start')
        .description('Start NodeCG')
        .action(function() {
            // Check if nodecg is already installed
            if (util.pathContainsNodeCG(process.cwd())) {
                require(process.cwd());
            } else {
                console.warn('No NodeCG installation found in this folder.');
            }
        });
};
