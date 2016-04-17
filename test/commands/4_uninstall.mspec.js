'use strict';

var assert = require('chai').assert;
var fs = require('fs');
var sinon = require('sinon');
var inquirer = require('inquirer');
var MockProgram = require('../mocks/program');
var UninstallCommand = require('../../commands/uninstall');

describe('uninstall command', function () {
	var uninstallCommand, program; // eslint-disable-line

	beforeEach(function () {
		program = new MockProgram();
		uninstallCommand = new UninstallCommand(program);
	});

	it('should delete the bundle\'s folder after prompting for confirmation', function (done) {
		this.timeout(10000);
		sinon.stub(inquirer, 'prompt').returns(function () {
			return {
				then(callback) {
					callback({confirmUninstall: true});
					assert.equal(fs.existsSync('./bundles/lfg-streamtip'), false);
					inquirer.prompt.restore();
					done();
				}
			};
		});
		program.runWith('uninstall lfg-streamtip');
	});

	it('should print an error when the target bundle is not installed', function () {
		sinon.spy(console, 'error');
		program.runWith('uninstall not-installed');
		assert.equal('Cannot uninstall %s: bundle is not installed.',
			console.error.getCall(0).args[0]);
		console.error.restore();
	});
});
