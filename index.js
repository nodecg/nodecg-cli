'use strict';

process.title = 'nodecg';

var request = require('request');
var versionCompare = require('./lib/version-compare');
var chalk = require('chalk');
var program = new (require('commander').Command)('nodecg');

var pjson = require('./package.json');

// Check for updates
request('http://registry.npmjs.org/nodecg-cli/latest', function (err, res, body) {
    if (!err && res.statusCode == 200) {
        if (versionCompare(JSON.parse(body).version, pjson.version) >= 1) {
            console.log(chalk.yellow('?')+' A new update is available for nodecg-cli: ' + chalk.green.bold(JSON.parse(body).version) + chalk.dim(' (current: ' + pjson.version + ')'));
            console.log('  Run ' + chalk.cyan.bold('npm install -g nodecg-cli') + ' to install the latest version');
        }
    }
});

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
