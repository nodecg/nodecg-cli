'use strict';

var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var util = require('../lib/util');
var chalk = require('chalk');
var rimraf = require('rimraf');
var os = require('os');

module.exports = function installCommand(program) {
	program
		.command('uninstall <bundle>')
		.description('Uninstalls a bundle.')
		.option('-f, --force', 'ignore warnings')
		.action(action);
};

function action(bundleName, options) {
	var nodecgPath = util.getNodeCGPath();
	var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);

	if (!fs.existsSync(bundlePath)) {
		console.error('Cannot uninstall %s: bundle is not installed.', chalk.magenta(bundleName));
		return;
	}

	/* istanbul ignore if: deleteBundle() is tested in the else path */
	if (options.force) {
		deleteBundle(bundleName, bundlePath);
	} else {
		inquirer.prompt([{
			name: 'confirmUninstall',
			message: 'Are you sure you wish to uninstall ' + chalk.magenta(bundleName) + '?',
			type: 'confirm'
		}], function (answers) {
			if (answers.confirmUninstall) {
				deleteBundle(bundleName, bundlePath);
			}
		});
	}
}

function deleteBundle(name, path) {
	if (!fs.existsSync(path)) {
		console.log('Nothing to uninstall.');
		return;
	}

	process.stdout.write('Uninstalling ' + chalk.magenta(name) + '... ');
	try {
		rimraf.sync(path);
	} catch (e) {
		/* istanbul ignore next */
		process.stdout.write(chalk.red('failed!') + os.EOL);
		/* istanbul ignore next */
		console.error(e.stack);
		/* istanbul ignore next */
		return;
	}
	process.stdout.write(chalk.green('done!') + os.EOL);
}
