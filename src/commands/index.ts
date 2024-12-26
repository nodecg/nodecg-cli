/**
 * Command loader copied from Tim Santeford's commander.js starter
 * https://github.com/tsantef/commander-starter
 */

import fs from "node:fs";
import path from "node:path";

import { Command } from "commander";

export = function (program: Command) {
	const commands: Record<string, (program: Command) => void> = {};
	const loadPath = path.dirname(__filename);

	// Loop though command files
	fs.readdirSync(loadPath)
		.filter((filename) => {
			return filename.endsWith(".js") && filename !== "index.js";
		})
		.forEach((filename) => {
			const name = filename.slice(0, filename.lastIndexOf("."));

			// Require command
			// eslint-disable-next-line @typescript-eslint/no-require-imports
			const command = require(path.join(loadPath, filename));

			// Initialize command
			commands[name] = command(program);
		});

	return commands;
};
