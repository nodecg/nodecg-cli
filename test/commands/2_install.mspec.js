'use strict';

var assert = require('chai').assert;
var fs = require('fs');
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
        program.runWith('install supportclass/lfg-streamtip');
        assert.equal(fs.existsSync('./bundles/lfg-streamtip/package.json'), true);
    });

    it('should install npm dependencies', function () {
        assert.equal(fs.existsSync('./bundles/lfg-streamtip/node_modules'), true);
    });

    it('should install bower dependencies', function () {
        assert.equal(fs.existsSync('./bundles/lfg-streamtip/bower_components'), true);
    });
});
