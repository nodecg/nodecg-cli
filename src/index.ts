process.title = "nodecg";

import fs from "node:fs";
import path from "node:path";
import semver from "semver";
import chalk from "chalk";
import { Command } from "commander";
import util from "./lib/util";

const program = new Command("nodecg");
const packageVersion: string = JSON.parse(
	fs.readFileSync(path.join(__dirname, "../package.json"), "utf8"),
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
// eslint-disable-next-line @typescript-eslint/no-require-imports
require("./commands")(program);

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
