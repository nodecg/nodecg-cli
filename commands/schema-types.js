'use strict';

// Native
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

// Packages
const chalk = require('chalk');
const fse = require('fs-extra');
const {compileFromFile} = require('json-schema-to-typescript');

const writeFilePromise = promisify(fs.writeFile);

module.exports = function (program) {
	program
		.command('schema-types [dir]')
		.option('-o, --out-dir [path]', 'Where to put the generated d.ts files', 'src/types/schemas')
		.option('--no-config-schema', 'Don\'t generate a typedef from configschema.json')
		.description('Generate d.ts TypeScript typedef files from Replicant schemas and configschema.json (if present)')
		.action(action);
};

function action(inDir, cmd) {
	const processCwd = process.cwd();
	const schemasDir = path.resolve(processCwd, inDir || 'schemas');
	if (!fs.existsSync(schemasDir)) {
		console.error(chalk.red('Error:') + ' Input directory ("%s") does not exist', inDir);
		return;
	}

	const outDir = path.resolve(processCwd, cmd.outDir);
	if (!fs.existsSync(outDir)) {
		fse.mkdirpSync(outDir);
	}

	const configSchemaPath = path.join(processCwd, 'configschema.json');
	const schemas = fs.readdirSync(schemasDir).filter(f => f.endsWith('.json'));

	const style = {
		singleQuote: true,
		useTabs: true
	};

	const compilePromises = [];
	const compile = (input, output, cwd = processCwd) => {
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

	if (fs.existsSync(configSchemaPath) && cmd.configSchema) {
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
