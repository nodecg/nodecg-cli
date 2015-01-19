'use strict';

var fs = require('fs');

module.exports = function startCommand(program) {
    program
        .command('start')
        .description('Start NodeCG')
        .action(function() {
            // Check if nodecg is already installed
            var pjsonPath = process.cwd() + '/package.json';
            if (fs.existsSync(pjsonPath)) {
                var pjson = require(pjsonPath);
                if (pjson.name.toLowerCase() === 'nodecg') {
                    console.log('Running local NodeCG ('+ pjson.version +')');
                    require(process.cwd());
                } else {
                    console.warn('No NodeCG installation found in this folder.');
                }
            } else {
                console.warn('No NodeCG installation found in this folder.');
            }
        })
};
