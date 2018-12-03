'use strict';

// Native
const fs = require('fs');

// Packages
const assert = require('chai').assert;
const sinon = require('sinon');
const inquirer = require('inquirer');
const temp = require('temp');

// Ours
const MockProgram = require('../mocks/program');
const SetupCommand = require('../../commands/setup');

describe('setup command', () => {
	let program;

	/*
	 * These tests depend on global state of the disk.
	 * Therefore, we only do this setup once.
	 */
	before(() => {
		// Set up environment.
		const tempFolder = temp.mkdirSync();
		temp.track(); // Automatically track and cleanup files at exit
		process.chdir(tempFolder);
	});

	beforeEach(() => {
		// Build program.
		program = new MockProgram();
		new SetupCommand(program); // eslint-disable-line no-new
	});

	it('should install the latest NodeCG when no version is specified', function () {
		this.timeout(20000);
		program.runWith('setup --skip-dependencies');
		assert.equal(fs.existsSync('./package.json'), true);
		assert.equal(JSON.parse(fs.readFileSync('./package.json')).name, 'nodecg');
	});

	it('should ask the user for confirmation when downgrading versions', function () {
		this.timeout(16000);
		sinon.spy(inquirer, 'prompt');
		program.runWith('setup 0.8.1 -u --skip-dependencies');
		inquirer.prompt.getCall(0).args[1]({installOlder: true});
		assert.equal(JSON.parse(fs.readFileSync('./package.json')).version, '0.8.1');
		inquirer.prompt.restore();
	});

	it('should let the user change upgrade versions', function () {
		this.timeout(16000);
		program.runWith('setup 0.8.2 -u --skip-dependencies');
		assert.equal(JSON.parse(fs.readFileSync('./package.json')).version, '0.8.2');
	});

	it('should print an error when the target version is the same as current', function () {
		this.timeout(16000);
		sinon.spy(console, 'log');
		program.runWith('setup 0.8.2 -u --skip-dependencies');
		assert.equal('The target version (%s) is equal to the current version (%s). No action will be taken.',
			console.log.getCall(0).args[0]);
		console.log.restore();
	});

	it('should print an error when the target version doesn\'t exist', function () {
		this.timeout(16000);
		sinon.spy(console, 'error');
		program.runWith('setup 0.0.99 -u --skip-dependencies');
		assert.equal('No releases match the supplied semver range (\u001b[35m0.0.99\u001b[39m)',
			console.error.getCall(0).args[0]);
		console.error.restore();
	});

	context('when nodecg is already installed in the current directory', () => {
		it('should print an error and exit', function () {
			this.timeout(16000);
			sinon.spy(console, 'error');
			program.runWith('setup 0.7.0 --skip-dependencies');
			assert.equal('NodeCG is already installed in this directory.', console.error.getCall(0).args[0]);
			console.error.restore();
		});
	});
});
