/**
 * Command loader copied from Tim Santeford's commander.js starter
 * https://github.com/tsantef/commander-starter
 */

'use strict';

var fs = require('fs');
var path = require('path');

module.exports = function (program) {
	var commands = {};
	var loadPath = path.dirname(__filename);

	// Loop though command files
	fs.readdirSync(loadPath).filter(function (filename) {
		return (/\.js$/.test(filename) && filename !== 'index.js');
	}).forEach(function (filename) {
		var name = filename.substr(0, filename.lastIndexOf('.'));

		// Require command
		var command = require(path.join(loadPath, filename));

		// Initialize command
		commands[name] = command(program);
	});

	return commands;
};
