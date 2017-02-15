'use strict';

const sinon = require('sinon');
const commander = require('commander');

module.exports = function () {
	const program = new commander.Command();
	program.log = function () {};

	sinon.stub(program, 'log').returns(void 0); // eslint-disable-line no-void

	program.request = function (opts) {
		throw new Error('Unexpected request: ' + JSON.stringify(opts, null, 2));
	};

	program.runWith = function (argString) {
		program.parse(['node', './'].concat(argString.split(' ')));
	};

	return program;
};
