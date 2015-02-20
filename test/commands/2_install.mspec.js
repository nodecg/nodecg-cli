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
        this.timeout(40000);
        program.runWith('install gamesdonequick/agdq15-layouts');
        assert.equal(fs.existsSync('./bundles/agdq15-layouts/nodecg.json'), true);
    });

    it('should install npm dependencies', function () {
        assert.equal(fs.existsSync('./bundles/agdq15-layouts/node_modules'), true);
    });

    it('should install bower dependencies', function () {
        assert.equal(fs.existsSync('./bundles/agdq15-layouts/bower_components'), true);
    });
});
