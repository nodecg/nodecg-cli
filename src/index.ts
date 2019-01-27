process.title = 'nodecg';

import request from 'request';
import semver from 'semver';
import chalk from 'chalk';
import {Command} from 'commander';

const program = new Command('nodecg');
const packageVersion: string = require('../package.json');

// Check for updates
request('http://registry.npmjs.org/nodecg-cli/latest', (err, res, body) => {
	if (!err && res.statusCode === 200) {
		if (semver.gt(JSON.parse(body).version, packageVersion)) {
			console.log(chalk.yellow('?') + ' A new update is available for nodecg-cli: ' +
				chalk.green.bold(JSON.parse(body).version) + chalk.dim(' (current: ' + packageVersion + ')'));
			console.log('  Run ' + chalk.cyan.bold('npm install -g nodecg-cli') + ' to install the latest version');
		}
	}
});

// Initialise CLI
program
	.version(packageVersion)
	.usage('<command> [options]');

// Initialise commands
require('./commands')(program);

// Handle unknown commands
program.on('*', () => {
	console.log('Unknown command:', program.args.join(' '));
	program.help();
});

// Print help if no commands were given
if (!process.argv.slice(2).length) {
	program.help();
}

// Process commands
program.parse(process.argv);
