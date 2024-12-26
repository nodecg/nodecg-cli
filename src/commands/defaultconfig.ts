import util from "../lib/util";
import chalk from "chalk";
import fs from "fs";
import path from "path";
import defaults from "json-schema-defaults";
import { Command } from "commander";

export = function (program: Command) {
	program
		.command("defaultconfig [bundle]")
		.description("Generate default config from configschema.json")
		.action(action);
};

function action(bundleName?: string) {
	const cwd = process.cwd();
	const nodecgPath = util.getNodeCGPath();

	if (!bundleName) {
		if (util.isBundleFolder(cwd)) {
			bundleName = bundleName ?? path.basename(cwd);
		} else {
			console.error(
				chalk.red("Error:") + " No bundle found in the current directory!",
			);
			return;
		}
	}

	const bundlePath = path.join(nodecgPath, "bundles/", bundleName);
	const schemaPath = path.join(
		nodecgPath,
		"bundles/",
		bundleName,
		"/configschema.json",
	);
	const cfgPath = path.join(nodecgPath, "cfg/");

	if (!fs.existsSync(bundlePath)) {
		console.error(
			chalk.red("Error:") + " Bundle %s does not exist",
			bundleName,
		);
		return;
	}

	if (!fs.existsSync(schemaPath)) {
		console.error(
			chalk.red("Error:") + " Bundle %s does not have a configschema.json",
			bundleName,
		);
		return;
	}

	if (!fs.existsSync(cfgPath)) {
		fs.mkdirSync(cfgPath);
	}

	const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
	const configPath = path.join(nodecgPath, "cfg/", bundleName + ".json");
	if (fs.existsSync(configPath)) {
		console.error(
			chalk.red("Error:") + " Bundle %s already has a config file",
			bundleName,
		);
	} else {
		try {
			fs.writeFileSync(
				configPath,
				JSON.stringify(defaults(schema), null, "  "),
			);
			console.log(
				chalk.green("Success:") +
					" Created %s's default config from schema\n\n" +
					JSON.stringify(defaults(schema), null, "  "),
				bundleName,
			);
		} catch (e) {
			console.error(chalk.red("Error: ") + String(e));
		}
	}
}
