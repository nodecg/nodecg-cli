process.title = "nodecg";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import chalk from "chalk";
import { Command } from "commander";
import semver from "semver";

import util from "./lib/util.js";

const program = new Command("nodecg");
const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageVersion: string = JSON.parse(
	fs.readFileSync(path.join(dirname, "../package.json"), "utf8"),
);

// Check for updates, asynchronously, so as to not make the CLI startup time excessively slow
util
	.getLatestCLIRelease()
	.then((release) => {
		if (semver.gt(release.version, packageVersion)) {
			console.log(
				chalk.yellow("?") +
					" A new update is available for nodecg-cli: " +
					chalk.green.bold(release.version) +
					chalk.dim(" (current: " + packageVersion + ")"),
			);
			console.log(
				"  Run " +
					chalk.cyan.bold("npm install -g nodecg-cli") +
					" to install the latest version",
			);
		}
	})
	.catch(() => {
		// Do nothing, as this is an optional check.
	});

// Initialise CLI
program.version(packageVersion).usage("<command> [options]");

// Initialise commands
const { setupCommands } = await import("./commands/index.js");
setupCommands(program as any);

// Handle unknown commands
program.on("*", () => {
	console.log("Unknown command:", program.args.join(" "));
	program.help();
});

// Print help if no commands were given
if (!process.argv.slice(2).length) {
	program.help();
}

// Process commands
program.parse(process.argv);
