'use strict';

// Native
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

// Packages
const chalk = require('chalk');
const fse = require('fs-extra');
const {compileFromFile} = require('json-schema-to-typescript');

// Ours
const util = require('../lib/util');

const writeFilePromise = promisify(fs.writeFile);

module.exports = function (program) {
	program
		.command('schema-types [bundle]')
		.option('-i, --in-dir [path]', 'Where to look for JSON schemas to convert (relative to bundle root)', 'schemas')
		.option('-o, --out-dir [path]', 'Where to put the generated d.ts files (relative to bundle root)', 'src/types/schemas')
		.option('-c, --configschema', 'Generate a typedef from configschema.json (if present)', true)
		.description('Generate d.ts TypeScript typedef files from Replicant schemas and configschema.json (if present)')
		.action(action);
};

function action(bundleName, cmd) {
	const cwd = process.cwd();
	const nodecgPath = util.getNodeCGPath();

	if (!bundleName) {
		if (util.isBundleFolder(cwd)) {
			bundleName = bundleName || path.basename(cwd);
		} else {
			console.error(chalk.red('Error:') + ' No bundle found in the current directory!');
			return;
		}
	}

	const bundlePath = path.join(nodecgPath, 'bundles/', bundleName);
	if (!fs.existsSync(bundlePath)) {
		console.error(chalk.red('Error:') + ' Bundle %s does not exist', bundleName);
		return;
	}

	const schemasDir = path.resolve(bundlePath, cmd.inDir);
	if (!fs.existsSync(schemasDir)) {
		console.error(chalk.red('Error:') + ' Input directory ("%s") does not exist', cmd.inDir);
		return;
	}

	const outDir = path.resolve(bundlePath, cmd.outDir);
	if (!fs.existsSync(outDir)) {
		fse.mkdirpSync(outDir);
	}

	const configSchemaPath = path.join(nodecgPath, 'bundles/', bundleName, '/configschema.json');
	const schemas = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'));

	const style = {
		singleQuote: true,
		useTabs: true
	};

	const compilePromises = [];
	const compile = (input, output, cwd = bundlePath) => {
		const promise = compileFromFile(input, {
			cwd,
			declareExternallyReferenced: true,
			enableConstEnums: true,
			style
		})
			.then(ts => writeFilePromise(output, ts))
			.then(() => {
				console.log(output);
			})
			.catch(err => {
				console.error(err);
			});
		compilePromises.push(promise);
		return promise;
	};

	if (fs.existsSync(configSchemaPath)) {
		compile(
			configSchemaPath,
			path.resolve(outDir, 'configschema.d.ts'),
			style
		);
	}

	for (const schema of schemas) {
		compile(
			path.resolve(schemasDir, schema),
			path.resolve(outDir, schema.replace(/\.json$/i, '.d.ts')),
			schemasDir
		);
	}

	return Promise.all(compilePromises).then(() => {
		process.emit('schema-types-done');
	});
}
