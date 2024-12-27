#!/usr/bin/env node

import { execFileSync } from "node:child_process";

import chalk from "chalk";
import updateNotifier from "update-notifier";

import packageJson from "../../package.json" with { type: "json" };

updateNotifier({ pkg: packageJson }).notify();

try {
	execFileSync("git", ["--version"]);
} catch {
	console.error(
		`nodecg-cli requires that ${chalk.cyan("git")} be available in your PATH.`,
	);
	process.exit(1);
}

await import("../index.js");
