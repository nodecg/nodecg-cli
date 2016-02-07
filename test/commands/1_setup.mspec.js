'use strict';

var assert = require('chai').assert;
var fs = require('fs');
var sinon = require('sinon');
var inquirer = require('inquirer');
var MockProgram = require('../mocks/program');
var SetupCommand = require('../../commands/setup');

describe('setup command', function () {
    var setupCommand, program;

    beforeEach(function() {
        program = new MockProgram();
        setupCommand = new SetupCommand(program);
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
        program.runWith('setup 0.6.3 -u --skip-dependencies');
        inquirer.prompt.getCall(0).args[1]({installOlder: true});
        assert.equal(JSON.parse(fs.readFileSync('./package.json')).version, '0.6.3');
        inquirer.prompt.restore();
    });

    it('should let the user change upgrade versions', function () {
        this.timeout(16000);
        program.runWith('setup 0.7.1 -u --skip-dependencies');
        assert.equal(JSON.parse(fs.readFileSync('./package.json')).version, '0.7.1');
    });

    it('should print an error when the target version is the same as current', function () {
        this.timeout(16000);
        sinon.spy(console, 'log');
        program.runWith('setup 0.7.1 -u --skip-dependencies');
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

    context('when nodecg is already installed in the current directory', function() {
        it('should print an error and exit', function () {
            this.timeout(16000);
            sinon.spy(console, 'error');
            program.runWith('setup 0.7.0 --skip-dependencies');
            assert.equal('NodeCG is already installed in this directory.', console.error.getCall(0).args[0]);
            console.error.restore();
        });
    });
});
