'use strict';

var assert = require('chai').assert;
var fs = require('fs');
var rimraf = require('rimraf');
var MockProgram = require('../mocks/program');
var SetupCommand = require('../../commands/setup');

describe('setup command', function () {
    var setupCommand, program;

    before(function(done) {
        this.timeout(20000);
        program = new MockProgram();
        setupCommand = new SetupCommand(program);
        rimraf('tmp', function(e) {
            if (e) throw e;
            done();
        });
    });

    it('should install NodeCG', function () {
        this.timeout(20000);
        fs.mkdirSync('tmp');
        process.chdir('tmp');
        program.runWith('setup 0.5.0 --skip-npm');
        assert.equal(fs.existsSync('./package.json'), true);
        assert.equal(JSON.parse(fs.readFileSync('./package.json')).name, 'nodecg');
    });

    it('should let the user change versions', function () {
        this.timeout(16000);
        program.runWith('setup 0.5.1 -u --skip-npm');
        assert.equal(JSON.parse(fs.readFileSync('./package.json')).version, '0.5.1');
    });
});
