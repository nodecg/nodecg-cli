'use strict';

// Native
const fs = require('fs');
const path = require('path');

// Packages
const {assert} = require('chai');
const sinon = require('sinon');
const inquirer = require('inquirer');
const temp = require('tmp');
const fse = require('fs-extra');

// Ours
const MockProgram = require('../mocks/program');
const UninstallCommand = require('../../commands/uninstall');

describe('uninstall command', () => {
	let program; // eslint-disable-line

	beforeEach(() => {
		// Set up environment.
		const tempFolder = temp.dirSync();
		process.chdir(tempFolder.name);
		fs.writeFileSync('package.json', JSON.stringify({name: 'nodecg'}));

		// Copy fixtures.
		fse.copySync(path.resolve(__dirname, '../fixtures/'), './');

		// Build program.
		program = new MockProgram();
		new UninstallCommand(program); // eslint-disable-line no-new
	});

	it('should delete the bundle\'s folder after prompting for confirmation', function (done) {
		this.timeout(10000);
		sinon.stub(inquirer, 'prompt').returns({
			then(callback) {
				try {
					callback({confirmUninstall: true});
					assert.equal(fs.existsSync('./bundles/uninstall-test'), false);
					inquirer.prompt.restore();
					done();
				} catch (error) {
					done(error);
				}
			}
		});
		program.runWith('uninstall uninstall-test');
	});

	it('should print an error when the target bundle is not installed', () => {
		sinon.spy(console, 'error');
		program.runWith('uninstall not-installed');
		assert.equal('Cannot uninstall %s: bundle is not installed.',
			console.error.getCall(0).args[0]);
		console.error.restore();
	});
});
