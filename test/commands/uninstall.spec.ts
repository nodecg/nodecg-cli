import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import temp from 'tmp';
import fse from 'fs-extra';
import { Command } from 'commander';
import { MockCommand, createMockProgram } from '../mocks/program';
import uninstallCommand from '../../src/commands/uninstall';

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
	const spy = jest.spyOn(inquirer, 'prompt').mockImplementation(() => {
		return Promise.resolve({ confirmUninstall: true }) as any;
	});
	await program.runWith('uninstall uninstall-test');
	expect(fs.existsSync('./bundles/uninstall-test')).toBe(false);
	spy.mockRestore();
});

it('should print an error when the target bundle is not installed', async () => {
	const spy = jest.spyOn(console, 'error');
	await program.runWith('uninstall not-installed');
	expect(spy.mock.calls[0][0]).toBe('Cannot uninstall %s: bundle is not installed.');
	spy.mockRestore();
});
