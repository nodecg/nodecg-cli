var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var MockProgram = require('../mocks/program');
var InstallCommand = require('../../commands/install');

describe('install command', function () {
    var installCommand, program;

    before(function() {
        program = new MockProgram();
        installCommand = new InstallCommand(program);
    });

    it('should install a bundle', function () {
        this.timeout(25000);
        program.runWith('install gamesdonequick/agdq15-layouts');
        assert.equal(fs.existsSync('./bundles/agdq15-layouts/nodecg.json'), true);
    });
});
