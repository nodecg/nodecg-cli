'use strict';

var expect = require('chai').expect;
var MockProgram = require('../mocks/program');
var UpdateCommand = require('../../commands/update');

describe('update command', function () {
    var updateCommand, program;

    before(function() {
        program = new MockProgram();
        updateCommand = new UpdateCommand(program);
    });

    it('shouldn\'t throw any errors', function () {
        this.timeout(25000);
        function doUpdate() {
            program.runWith('update agdq15-layouts');
        }
        expect(doUpdate).to.not.throw(Error);
    });
});
