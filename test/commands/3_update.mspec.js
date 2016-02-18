'use strict';

var path = require('path');
var childProcess = require('child_process');
var mkdirp = require('mkdirp');
var expect = require('chai').expect;
var assert = require('chai').assert;
var sinon = require('sinon');
var MockProgram = require('../mocks/program');
var UpdateCommand = require('../../commands/update');

describe('update command', function () {
	var updateCommand, program; // eslint-disable-line

	beforeEach(function () {
		program = new MockProgram();
		updateCommand = new UpdateCommand(program);
	});

	context('when run with a bundle argument', function () {
		it('should execute the correct `git pull` command when the target bundle is installed', function () {
			this.timeout(25000);
			sinon.spy(childProcess, 'execSync');
			program.runWith('update lfg-streamtip');
			assert.equal('git pull', childProcess.execSync.getCall(0).args[0]);
			assert.equal(path.resolve('./bundles/lfg-streamtip'), childProcess.execSync.getCall(0).args[1].cwd);
			childProcess.execSync.restore();
		});

		it('should execute the correct `git pull` commands when updating all bundles', function () {
			this.timeout(25000);
			sinon.spy(childProcess, 'execSync');
			program.runWith('update *');
			assert.equal('git pull', childProcess.execSync.getCall(0).args[0]);
			assert.equal(path.resolve('./bundles/lfg-streamtip'), childProcess.execSync.getCall(0).args[1].cwd);
			childProcess.execSync.restore();
		});

		it('should print an error when the target bundle is not installed', function () {
			this.timeout(25000);
			sinon.spy(console, 'error');
			program.runWith('update not-installed');
			assert.equal('Bundle %s is not installed, not updating',
				console.error.getCall(0).args[0]);
			console.error.restore();
		});
	});

	context('when run with no arguments', function () {
		it('shouldn\'t throw any errors when the current folder is a bundle', function () {
			this.timeout(25000);
			process.chdir('./bundles/lfg-streamtip');
			expect(function () {
				program.runWith('update');
			}).to.not.throw(Error);
		});

		it('should print an error when in a folder with no package.json', function () {
			this.timeout(25000);
			mkdirp.sync('./bundles/not-a-bundle');
			process.chdir('./bundles/not-a-bundle');

			sinon.spy(console, 'error');
			program.runWith('update');
			assert.equal('\u001b[31mError:\u001b[39m No bundle found in the current directory!',
				console.error.getCall(0).args[0]);
			console.error.restore();
		});
	});
});
