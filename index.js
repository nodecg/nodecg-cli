'use strict';

process.title = 'nodecg';

var program = new (require('commander').Command)('nodecg');

// Initialise CLI
program
    .version(require('./package.json').version)
    .usage('<command> [options]');

// Initialise commands
require('./commands')(program);

// Handle unknown commands
program.on('*', function() {
    console.log('Unknown command:', program.args.join(' '));
    program.help();
});

// Print help if no commands were given
if (!process.argv.slice(2).length) {
    program.help();
}

// Process commands
program.parse(process.argv);
