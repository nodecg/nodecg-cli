import fs from 'fs';
import inquirer from 'inquirer';
import temp from 'tmp';
import { PackageJson } from 'type-fest';
import { Command } from 'commander';
import { createMockProgram, MockCommand } from '../mocks/program';
import setupCommand from '../../src/commands/setup';

let program: MockCommand;
const tmpDir = temp.dirSync();
process.chdir(tmpDir.name);

const readPackageJson = (): PackageJson => {
	return JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }));
};

beforeEach(() => {
	program = createMockProgram();
	setupCommand(program as unknown as Command);
});

test('should install the latest NodeCG when no version is specified', async () => {
	await program.runWith('setup --skip-dependencies');
	expect(readPackageJson().name).toBe('nodecg');
});

test('should ask the user for confirmation when downgrading versions', async () => {
	const spy = jest.spyOn(inquirer, 'prompt').mockReturnValue(Promise.resolve({ installOlder: true }) as any);
	await program.runWith('setup 0.8.1 -u --skip-dependencies');
	expect(spy).toBeCalled();
	expect(readPackageJson().version).toBe('0.8.1');
	spy.mockRestore();
});

test('should let the user change upgrade versions', async () => {
	await program.runWith('setup 0.8.2 -u --skip-dependencies');
	expect(readPackageJson().version).toBe('0.8.2');
});

test('should print an error when the target version is the same as current', async () => {
	const spy = jest.spyOn(console, 'log');
	await program.runWith('setup 0.8.2 -u --skip-dependencies');
	expect(spy).toBeCalledWith(
		'The target version (%s) is equal to the current version (%s). No action will be taken.',
		'\u001b[35mv0.8.2\u001b[39m',
		'\u001b[35m0.8.2\u001b[39m',
	);
	spy.mockRestore();
});

test("should print an error when the target version doesn't exist", async () => {
	const spy = jest.spyOn(console, 'error');
	await program.runWith('setup 0.0.99 -u --skip-dependencies');
	expect(spy).toBeCalledWith('No releases match the supplied semver range (\u001b[35m0.0.99\u001b[39m)');
	spy.mockRestore();
});

test('should print an error and exit, when nodecg is already installed in the current directory ', async () => {
	const spy = jest.spyOn(console, 'error');
	await program.runWith('setup 0.7.0 --skip-dependencies');
	expect(spy).toBeCalledWith('NodeCG is already installed in this directory.');
	spy.mockRestore();
});
