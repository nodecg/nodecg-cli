import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import chalk from "chalk";
import { Command } from "commander";
import inquirer from "inquirer";

import util from "../lib/util.js";

export function uninstallCommand(program: Command) {
	program
		.command("uninstall <bundle>")
		.description("Uninstalls a bundle.")
		.option("-f, --force", "ignore warnings")
		.action(action);
}

function action(bundleName: string, options: { force: boolean }) {
	const nodecgPath = util.getNodeCGPath();
	const bundlePath = path.join(nodecgPath, "bundles/", bundleName);

	if (!fs.existsSync(bundlePath)) {
		console.error(
			"Cannot uninstall %s: bundle is not installed.",
			chalk.magenta(bundleName),
		);
		return;
	}

	/* istanbul ignore if: deleteBundle() is tested in the else path */
	if (options.force) {
		deleteBundle(bundleName, bundlePath);
	} else {
		void inquirer
			.prompt<{ confirmUninstall: boolean }>([
				{
					name: "confirmUninstall",
					message:
						"Are you sure you wish to uninstall " +
						chalk.magenta(bundleName) +
						"?",
					type: "confirm",
				},
			])
			.then((answers) => {
				if (answers.confirmUninstall) {
					deleteBundle(bundleName, bundlePath);
				}
			});
	}
}

function deleteBundle(name: string, path: string) {
	if (!fs.existsSync(path)) {
		console.log("Nothing to uninstall.");
		return;
	}

	process.stdout.write("Uninstalling " + chalk.magenta(name) + "... ");
	try {
		fs.rmSync(path, { recursive: true, force: true });
	} catch (e: any) {
		/* istanbul ignore next */
		process.stdout.write(chalk.red("failed!") + os.EOL);
		/* istanbul ignore next */
		console.error(e.stack);
		/* istanbul ignore next */
		return;
	}

	process.stdout.write(chalk.green("done!") + os.EOL);
}
