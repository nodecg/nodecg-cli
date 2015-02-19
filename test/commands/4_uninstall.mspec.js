var assert = require('chai').assert;
var fs = require('fs');
var path = require('path');
var MockProgram = require('../mocks/program');
var UninstallCommand = require('../../commands/uninstall');

describe('uninstall command', function () {
    var uninstallCommand, program;

    before(function() {
        program = new MockProgram();
        uninstallCommand = new UninstallCommand(program);
    });

    it('should delete the bundle\'s folder', function () {
        this.timeout(25000);
        program.runWith('uninstall agdq15-layouts -f');
        assert.equal(fs.existsSync('./bundles/agdq15-layouts'), false);
    });
});
