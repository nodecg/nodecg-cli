import fs from 'fs';
import rimraf from 'rimraf';
import semver from 'semver';
import temp from 'tmp';
import { createMockProgram, MockCommand } from '../mocks/program';
import installCommand from '../../src/commands/install';
import { Command } from 'commander';
import { beforeEach, it, mock } from 'node:test';
import assert from 'node:assert/strict';

let program: MockCommand;
const tempFolder = temp.dirSync();
process.chdir(tempFolder.name);
fs.writeFileSync('package.json', JSON.stringify({ name: 'nodecg' }));

beforeEach(() => {
	program = createMockProgram();
	installCommand(program as unknown as Command);
});

it('should install a bundle and its dependencies', async () => {
	await program.runWith('install supportclass/lfg-streamtip');
	assert.ok(fs.existsSync('./bundles/lfg-streamtip/package.json'));
	assert.ok(fs.readdirSync('./bundles/lfg-streamtip/node_modules').length > 0);
});

it('should install a version that satisfies a provided semver range', async () => {
	await program.runWith('install supportclass/lfg-nucleus#^1.1.0');
	assert.ok(fs.existsSync('./bundles/lfg-nucleus/package.json'));

	const pjson = JSON.parse(
		fs.readFileSync('./bundles/lfg-nucleus/package.json', {
			encoding: 'utf8',
		}),
	);
	assert.ok(semver.satisfies(pjson.version, '^1.1.0'));
});

it('should install bower & npm dependencies when run with no arguments in a bundle directory', async () => {
	rimraf.sync('./bundles/lfg-streamtip/node_modules');
	rimraf.sync('./bundles/lfg-streamtip/bower_components');

	process.chdir('./bundles/lfg-streamtip');
	await program.runWith('install');
	assert.ok(fs.readdirSync('./node_modules').length > 0);
	assert.ok(fs.readdirSync('./bower_components').length > 0);
});

it('should print an error when no valid git repo is provided', async () => {
	const spy = mock.method(console, 'error');
	await program.runWith('install 123');
	assert.equal(
		spy.mock.calls[0].arguments[0],
		'Please enter a valid git repository URL or GitHub username/repo pair.',
	);
	spy.mock.restore();
});
