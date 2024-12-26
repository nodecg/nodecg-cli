import fs from 'fs';
import inquirer from 'inquirer';
import temp from 'tmp';
import { PackageJson } from 'type-fest';
import { Command } from 'commander';
import { createMockProgram, MockCommand } from '../mocks/program';
import setupCommand from '../../src/commands/setup';
import { beforeEach, mock, test } from 'node:test';
import assert from 'node:assert/strict';

let program: MockCommand;
let currentDir = temp.dirSync();
const chdir = (keepCurrentDir = false) => {
	if (!keepCurrentDir) {
		currentDir = temp.dirSync();
	}

	process.chdir(currentDir.name);
};

const readPackageJson = (): PackageJson => {
	return JSON.parse(fs.readFileSync('./package.json', { encoding: 'utf8' }));
};

beforeEach(() => {
	chdir(true);
	program = createMockProgram();
	setupCommand(program as unknown as Command);
});

test('should install the latest NodeCG when no version is specified', async () => {
	chdir();
	await program.runWith('setup --skip-dependencies');
	assert.equal(readPackageJson().name, 'nodecg');
});

test('should install v2 NodeCG when specified', async () => {
	chdir();
	await program.runWith('setup v2.0.0 --skip-dependencies');
	assert.equal(readPackageJson().name, 'nodecg');
	assert.equal(readPackageJson().version, '2.0.0');
});

test('should install v1 NodeCG when specified', async () => {
	chdir();
	await program.runWith('setup 1.9.0 -u --skip-dependencies');
	assert.equal(readPackageJson().name, 'nodecg');
	assert.equal(readPackageJson().version, '1.9.0');
});

test('should ask the user for confirmation when downgrading versions', async () => {
	const spy = mock.method(inquirer, 'prompt');
	spy.mock.mockImplementation((async () => ({ installOlder: true })) as any);
	await program.runWith('setup 0.8.1 -u --skip-dependencies');
	assert.ok(spy.mock.callCount() > 0);
	assert.equal(readPackageJson().version, '0.8.1');
	spy.mock.restore();
});

test('should let the user change upgrade versions', async () => {
	await program.runWith('setup 0.8.2 -u --skip-dependencies');
	assert.equal(readPackageJson().version, '0.8.2');
});

test('should print an error when the target version is the same as current', async () => {
	const spy = mock.method(console, 'log');
	await program.runWith('setup 0.8.2 -u --skip-dependencies');
	assert.deepEqual(spy.mock.calls[0].arguments, [
		'The target version (%s) is equal to the current version (%s). No action will be taken.',
		'\u001b[35mv0.8.2\u001b[39m',
		'\u001b[35m0.8.2\u001b[39m',
	]);
	spy.mock.restore();
});

test('should correctly handle and refuse when you try to downgrade from v2 to v1', async () => {
	chdir();
	const spy = mock.method(inquirer, 'prompt');
	spy.mock.mockImplementation((async () => ({ installOlder: true })) as any);
	await program.runWith('setup 2.0.0 --skip-dependencies');
	assert.equal(readPackageJson().version, '2.0.0');
	await program.runWith('setup 1.9.0 -u --skip-dependencies');
	assert.equal(readPackageJson().version, '2.0.0');
	spy.mock.restore();
});

test("should print an error when the target version doesn't exist", async () => {
	const spy = mock.method(console, 'error');
	await program.runWith('setup 0.0.99 -u --skip-dependencies');
	assert.equal(
		spy.mock.calls[0].arguments[0],
		'No releases match the supplied semver range (\u001b[35m0.0.99\u001b[39m)',
	);
	spy.mock.restore();
});

test('should print an error and exit, when nodecg is already installed in the current directory ', async () => {
	const spy = mock.method(console, 'error');
	await program.runWith('setup 0.7.0 --skip-dependencies');
	assert.equal(spy.mock.calls[0].arguments[0], 'NodeCG is already installed in this directory.');
	spy.mock.restore();
});
