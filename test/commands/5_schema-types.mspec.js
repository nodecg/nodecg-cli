'use strict';

// Native
const fs = require('fs');
const path = require('path');

// Packages
const assert = require('chai').assert;
const fse = require('fs-extra');
const sinon = require('sinon');
const temp = require('tmp');

// Ours
const MockProgram = require('../mocks/program');
const SchemaTypesCommand = require('../../commands/schema-types');

describe('schema-types command', () => {
	let program;

	beforeEach(() => {
		// Set up environment.
		const tempFolder = temp.dirSync();
		process.chdir(tempFolder.name);
		fs.writeFileSync('package.json', JSON.stringify({name: 'nodecg'}));

		// Copy fixtures.
		fse.copySync(path.resolve(__dirname, '../fixtures/'), './');

		// Build program.
		program = new MockProgram();
		new SchemaTypesCommand(program); // eslint-disable-line no-new
	});

	it('should successfully create d.ts files from the replicant schemas', async () => {
		process.chdir('bundles/schema-types');
		program.runWith('schema-types');

		/* Commander has no return values for command invocations.
		 * This means that if your command returns a promise (or is otherwise async),
		 * there is no way to get a reference to that promise to await it.
		 * The command is just invoked by a dispatched event, with no
		 * way to access the return value of your command's action.
		 *
		 * This makes testing async actions very challenging.
		 *
		 * Our current solution is to hack custom events onto the process global.
		 * It's gross, but whatever. It works for now.
		 */
		await waitForEvent(process, 'schema-types-done');

		const outputPath = './src/types/schemas/example.d.ts';
		assert.isTrue(
			fs.existsSync(outputPath)
		);

		assert.equal(
			fs.readFileSync(outputPath, 'utf8'),
			fs.readFileSync('../../results/schema-types/example.d.ts', 'utf8')
		);
	});

	it('should print an error when the target bundle does not have a schemas dir', () => {
		process.chdir('bundles/uninstall-test');
		sinon.spy(console, 'error');
		program.runWith('schema-types');
		assert.equal('\u001b[31mError:\u001b[39m Input directory ("%s") does not exist',
			console.error.getCall(0).args[0]);
		console.error.restore();
	});

	it('should successfully compile the config schema', async () => {
		process.chdir('bundles/config-schema');
		fs.mkdirSync('empty-dir');
		program.runWith('schema-types empty-dir');

		await waitForEvent(process, 'schema-types-done');

		const outputPath = './src/types/schemas/configschema.d.ts';
		assert.isTrue(
			fs.existsSync(outputPath)
		);

		assert.equal(
			fs.readFileSync(outputPath, 'utf8'),
			fs.readFileSync('../../results/schema-types/configschema.d.ts', 'utf8')
		);
	});
});

function waitForEvent(emitter, eventName) {
	return new Promise(resolve => {
		emitter.on(eventName, () => {
			resolve();
		});
	});
}
