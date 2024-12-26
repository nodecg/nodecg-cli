import fs from 'node:fs';
import path from 'node:path';
import fse from 'fs-extra';
import temp from 'tmp';
import { Command } from 'commander';
import { createMockProgram, MockCommand } from '../mocks/program';
import defaultConfigCommand from '../../src/commands/defaultconfig';
import { beforeEach, describe, it, mock } from 'node:test';
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
	defaultConfigCommand(program as unknown as Command);
});

describe('when run with a bundle argument', () => {
	it('should successfully create a bundle config file when bundle has configschema.json', async () => {
		await program.runWith('defaultconfig config-schema');
		const config = JSON.parse(fs.readFileSync('./cfg/config-schema.json', { encoding: 'utf8' }));
		assert.equal(config.username, 'user');
		assert.equal(config.value, 5);
		assert.equal(config.nodefault, undefined);
	});

	it('should print an error when the target bundle does not have a configschema.json', async () => {
		const spy = mock.method(console, 'error');
		fse.mkdirpSync(path.resolve(process.cwd(), './bundles/missing-schema-bundle'));
		await program.runWith('defaultconfig missing-schema-bundle');
		assert.equal(
			spy.mock.calls[0].arguments[0],
			'\u001b[31mError:\u001b[39m Bundle %s does not have a configschema.json',
		);
		spy.mock.restore();
	});

	it('should print an error when the target bundle does not exist', async () => {
		const spy = mock.method(console, 'error');
		await program.runWith('defaultconfig not-installed');
		assert.equal(spy.mock.calls[0].arguments[0], '\u001b[31mError:\u001b[39m Bundle %s does not exist');
		spy.mock.restore();
	});

	it('should print an error when the target bundle already has a config', async () => {
		const spy = mock.method(console, 'error');
		fs.mkdirSync('./cfg');
		fs.writeFileSync('./cfg/config-schema.json', JSON.stringify({ fake: 'data' }));
		await program.runWith('defaultconfig config-schema');
		assert.equal(spy.mock.calls[0].arguments[0], '\u001b[31mError:\u001b[39m Bundle %s already has a config file');
		spy.mock.restore();
	});
});

describe('when run with no arguments', () => {
	it('should successfully create a bundle config file when run from inside bundle directory', async () => {
		process.chdir('./bundles/config-schema');
		await program.runWith('defaultconfig');
		assert.equal(fs.existsSync('../../cfg/config-schema.json'), true);
	});

	it('should print an error when in a folder with no package.json', async () => {
		fse.mkdirpSync(path.resolve(process.cwd(), './bundles/not-a-bundle'));
		process.chdir('./bundles/not-a-bundle');

		const spy = mock.method(console, 'error');
		await program.runWith('defaultconfig');
		assert.equal(
			spy.mock.calls[0].arguments[0],
			'\u001b[31mError:\u001b[39m No bundle found in the current directory!',
		);
		spy.mock.restore();
	});
});
