'use strict';

var util = require('../lib/util');
var chalk = require('chalk');
var fs = require('fs');
var path = require('path');
var defaults = require('json-schema-defaults');

module.exports = function (program) {
	program
		.command('defaultconfig [bundle]')
		.description('Generate default config from configschema.json')
		.action(action);
};

function action(bundleName) {
	var cwd = process.cwd();
	var nodecgPath = util.getNodeCGPath();

	if (!bundleName) {
		if (util.isBundleFolder(cwd)) {
			bundleName = bundleName || path.basename(cwd);
		} else {
			console.error(chalk.red('Error:') + ' No bundle found in the current directory!');
			return;
		}
	}

	var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);
	var schemaPath = path.join(nodecgPath, 'bundles/', bundleName, '/configschema.json');
	var cfgPath = path.join(nodecgPath, 'cfg/');

	if (!fs.existsSync(bundlePath)) {
		console.error(chalk.red('Error:') + ' Bundle %s does not exist', bundleName);
		return;
	}
	if (!fs.existsSync(schemaPath)) {
		console.error(chalk.red('Error:') + ' Bundle %s does not have a configschema.json', bundleName);
		return;
	}
	if (!fs.existsSync(cfgPath)) {
		fs.mkdirSync(cfgPath);
	}

	var schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
	var configPath = path.join(nodecgPath, 'cfg/', bundleName + '.json');
	if (fs.existsSync(configPath)) {
		console.error(chalk.red('Error:') + ' Bundle %s already has a config file', bundleName);
	} else {
		try {
			fs.writeFileSync(configPath, JSON.stringify(defaults(schema), null, '  '));
			console.log(chalk.green('Success:') + ' Created %s\'s default config from schema\n\n' +
				JSON.stringify(defaults(schema), null, '  '), bundleName);
		} catch (e) {
			console.error(chalk.red('Error: ') + e);
		}
	}
}
