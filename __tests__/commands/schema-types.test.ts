import fs from 'fs';
import path from 'path';
import fse from 'fs-extra';
import temp from 'tmp';
import { MockCommand, createMockProgram } from '../mocks/program';
import schemaTypesCommand from '../../src/commands/schema-types';
import { EventEmitter } from 'events';
import { beforeEach, it, mock } from 'node:test';
import assert from 'node:assert/strict';

let program: MockCommand;

beforeEach(() => {
	// Set up environment.
	const tempFolder = temp.dirSync();
	process.chdir(tempFolder.name);
	fs.writeFileSync('package.json', JSON.stringify({ name: 'nodecg' }));

	// Copy fixtures.
	fse.copySync(path.resolve(__dirname, '../fixtures/'), './');

	// Build program.
	program = createMockProgram();
	schemaTypesCommand(program as any);
});

it('should successfully create d.ts files from the replicant schemas and create an index.d.ts file', async () => {
	process.chdir('bundles/schema-types');

	/*
	 * Commander has no return values for command invocations.
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
	await Promise.all([program.runWith('schema-types'), waitForEvent(process, 'schema-types-done')]);

	const outputPath = './src/types/schemas/example.d.ts';
	assert.ok(fs.existsSync(outputPath));

	assert.equal(
		fs.readFileSync(outputPath, 'utf8'),
		fs.readFileSync('../../results/schema-types/example.d.ts', 'utf8'),
	);

	const indexPath = './src/types/schemas/index.d.ts';
	assert.ok(fs.existsSync(indexPath));
	assert.equal(fs.readFileSync(indexPath, 'utf8'), fs.readFileSync('../../results/schema-types/index.d.ts', 'utf8'));
});

it('should print an error when the target bundle does not have a schemas dir', async () => {
	process.chdir('bundles/uninstall-test');
	const spy = mock.method(console, 'error');
	await program.runWith('schema-types');
	assert.equal(spy.mock.calls[0].arguments[0], '\u001b[31mError:\u001b[39m Input directory ("%s") does not exist');
	spy.mock.restore();
});

it('should successfully compile the config schema', async () => {
	process.chdir('bundles/config-schema');
	fs.mkdirSync('empty-dir');

	await Promise.all([program.runWith('schema-types empty-dir'), waitForEvent(process, 'schema-types-done')]);

	const outputPath = './src/types/schemas/configschema.d.ts';
	assert.ok(fs.existsSync(outputPath));

	assert.equal(
		fs.readFileSync(outputPath, 'utf8'),
		fs.readFileSync('../../results/schema-types/configschema.d.ts', 'utf8'),
	);
	assert.equal(
		fs.readFileSync('./src/types/schemas/index.d.ts', 'utf8'),
		"/* eslint-disable */\n// @ts-ignore\nexport * from './configschema';\n",
	);
});

async function waitForEvent(emitter: EventEmitter, eventName: string) {
	return new Promise<void>((resolve) => {
		emitter.on(eventName, () => {
			resolve();
		});
	});
}
