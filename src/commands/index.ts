/**
 * Command loader copied from Tim Santeford's commander.js starter
 * https://github.com/tsantef/commander-starter
 */

import fs from 'fs';
import path from 'path';
import {Command} from 'commander';

export default function (program: Command) {
	const commands: {[x: string]: (program: Command) => void} = {};
	const loadPath = path.dirname(__filename);

	// Loop though command files
	fs.readdirSync(loadPath).filter(filename => {
		return (/\.js$/.test(filename) && filename !== 'index.js');
	}).forEach(filename => {
		const name = filename.substr(0, filename.lastIndexOf('.'));

		// Require command
		const command = require(path.join(loadPath, filename));

		// Initialize command
		commands[name] = command(program);
	});

	return commands;
}
