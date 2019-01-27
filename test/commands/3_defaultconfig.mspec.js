'use strict';

// Native
const fs = require('fs');
const path = require('path');

// Packages
const {assert} = require('chai');
const sinon = require('sinon');
const fse = require('fs-extra');
const temp = require('tmp');

// Ours
const MockProgram = require('../mocks/program');
const DefaultConfigCommand = require('../../dist/commands/defaultconfig');

describe('defaultconfig command', () => {
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
		new DefaultConfigCommand(program); // eslint-disable-line no-new
	});

	context('when run with a bundle argument', () => {
		it('should successfully create a bundle config file when bundle has configschema.json', () => {
			program.runWith('defaultconfig config-schema');
			assert.equal(fs.existsSync('./cfg/config-schema.json'), true);
			const config = JSON.parse(fs.readFileSync('./cfg/config-schema.json'));
			assert.equal('user', config.username);
			assert.equal(5, config.value);
			assert.isUndefined(config.nodefault);
		});

		it('should print an error when the target bundle does not have a configschema.json', () => {
			sinon.spy(console, 'error');
			fse.mkdirpSync('./bundles/missing-schema-bundle');
			program.runWith('defaultconfig missing-schema-bundle');
			assert.equal('\u001b[31mError:\u001b[39m Bundle %s does not have a configschema.json',
				console.error.getCall(0).args[0]);
			console.error.restore();
		});

		it('should print an error when the target bundle does not exist', () => {
			sinon.spy(console, 'error');
			program.runWith('defaultconfig not-installed');
			assert.equal('\u001b[31mError:\u001b[39m Bundle %s does not exist',
				console.error.getCall(0).args[0]);
			console.error.restore();
		});

		it('should print an error when the target bundle already has a config', () => {
			sinon.spy(console, 'error');
			fs.mkdirSync('cfg');
			fs.writeFileSync('./cfg/config-schema.json', JSON.stringify({fake: 'data'}));
			program.runWith('defaultconfig config-schema');
			assert.equal('\u001b[31mError:\u001b[39m Bundle %s already has a config file',
				console.error.getCall(0).args[0]);
			console.error.restore();
		});
	});

	context('when run with no arguments', () => {
		it('should successfully create a bundle config file when run from inside bundle directory', () => {
			process.chdir('./bundles/config-schema');
			program.runWith('defaultconfig');
			assert.equal(fs.existsSync('../../cfg/config-schema.json'), true);
		});

		it('should print an error when in a folder with no package.json', () => {
			fse.mkdirpSync('./bundles/not-a-bundle');
			process.chdir('./bundles/not-a-bundle');

			sinon.spy(console, 'error');
			program.runWith('defaultconfig');
			assert.equal('\u001b[31mError:\u001b[39m No bundle found in the current directory!',
				console.error.getCall(0).args[0]);
			console.error.restore();
		});
	});
});
