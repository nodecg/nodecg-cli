import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import temp from 'tmp';
import fse from 'fs-extra';
import { Command } from 'commander';
import { MockCommand, createMockProgram } from '../mocks/program';
import uninstallCommand from '../../src/commands/uninstall';
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
	uninstallCommand(program as unknown as Command);
});

it("should delete the bundle's folder after prompting for confirmation", async () => {
	const spy = mock.method(inquirer, 'prompt');
	spy.mock.mockImplementation((async () => ({ confirmUninstall: true })) as any);
	await program.runWith('uninstall uninstall-test');
	assert.equal(fs.existsSync('./bundles/uninstall-test'), false);
	spy.mock.restore();
});

it('should print an error when the target bundle is not installed', async () => {
	const spy = mock.method(console, 'error');
	await program.runWith('uninstall not-installed');
	assert.equal(spy.mock.calls[0].arguments[0], 'Cannot uninstall %s: bundle is not installed.');
	spy.mock.restore();
});
