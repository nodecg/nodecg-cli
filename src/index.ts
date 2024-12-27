process.title = "nodecg";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { Command } from "commander";
import updateNotifier from "update-notifier";

import packageJson from "../package.json" with { type: "json" };

updateNotifier({ pkg: packageJson }).notify();

const program = new Command("nodecg");
const dirname = path.dirname(fileURLToPath(import.meta.url));
const packageVersion: string = JSON.parse(
	fs.readFileSync(path.join(dirname, "../package.json"), "utf8"),
);

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
