var assert = require('chai').assert;
var fs = require('fs');
var rimraf = require('rimraf');
var path = require('path');
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
        })
    });

    it('should install NodeCG', function () {
        this.timeout(120000);
        fs.mkdirSync('tmp');
        process.chdir('tmp');
        program.runWith('setup 0.4.7');
        assert.equal(fs.existsSync('./package.json'), true);
        assert.equal(JSON.parse(fs.readFileSync('./package.json')).name, 'nodecg');
    });

    it('should let the user change versions', function () {
        this.timeout(4000);
        program.runWith('setup 0.4.8 -u');
        assert.equal(JSON.parse(fs.readFileSync('./package.json')).version, '0.4.8');
    });
});
