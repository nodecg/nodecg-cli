'use strict';

const assert = require('chai').assert;
const fs = require('fs');
const sinon = require('sinon');
const inquirer = require('inquirer');
const MockProgram = require('../mocks/program');
const UninstallCommand = require('../../commands/uninstall');

describe('uninstall command', () => {
	let program; // eslint-disable-line

	beforeEach(() => {
		program = new MockProgram();
		new UninstallCommand(program); // eslint-disable-line no-new
	});

	it('should delete the bundle\'s folder after prompting for confirmation', function (done) {
		this.timeout(10000);
		sinon.stub(inquirer, 'prompt').returns({
			then(callback) {
				callback({confirmUninstall: true});
				assert.equal(fs.existsSync('./bundles/lfg-streamtip'), false);
				inquirer.prompt.restore();
				done();
			}
		});
		program.runWith('uninstall lfg-streamtip');
	});

	it('should print an error when the target bundle is not installed', () => {
		sinon.spy(console, 'error');
		program.runWith('uninstall not-installed');
		assert.equal('Cannot uninstall %s: bundle is not installed.',
			console.error.getCall(0).args[0]);
		console.error.restore();
	});
});
