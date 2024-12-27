#!/usr/bin/env node

import { execFileSync } from "node:child_process";

import chalk from "chalk";

try {
	execFileSync("git", ["--version"]);
} catch {
	console.error(
		`nodecg-cli requires that ${chalk.cyan("git")} be available in your PATH.`,
	);
	process.exit(1);
}

await import("../index.js");
