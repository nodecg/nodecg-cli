import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

import chalk from "chalk";
import { Command } from "commander";
import fse from "fs-extra";
import { compileFromFile } from "json-schema-to-typescript";

const writeFilePromise = promisify(fs.writeFile);

export = function (program: Command) {
	program
		.command("schema-types [dir]")
		.option(
			"-o, --out-dir [path]",
			"Where to put the generated d.ts files",
			"src/types/schemas",
		)
		.option(
			"--no-config-schema",
			"Don't generate a typedef from configschema.json",
		)
		.description(
			"Generate d.ts TypeScript typedef files from Replicant schemas and configschema.json (if present)",
		)
		.action(action);
};

function action(inDir: string, cmd: { outDir: string; configSchema: boolean }) {
	const processCwd = process.cwd();
	const schemasDir = path.resolve(processCwd, inDir || "schemas");
	if (!fs.existsSync(schemasDir)) {
		console.error(
			chalk.red("Error:") + ' Input directory ("%s") does not exist',
			inDir,
		);
		return;
	}

	const outDir = path.resolve(processCwd, cmd.outDir);
	if (!fs.existsSync(outDir)) {
		fse.mkdirpSync(outDir);
	}

	const configSchemaPath = path.join(processCwd, "configschema.json");
	const schemas = fs.readdirSync(schemasDir).filter((f) => f.endsWith(".json"));

	const style = {
		singleQuote: true,
		useTabs: true,
	};

	const compilePromises: Promise<void>[] = [];
	const compile = (input: string, output: string, cwd = processCwd) => {
		const promise = compileFromFile(input, {
			cwd,
			declareExternallyReferenced: true,
			enableConstEnums: true,
			style,
		})
			.then((ts) => writeFilePromise(output, ts))
			.then(() => {
				console.log(output);
			})
			.catch((err: unknown) => {
				console.error(err);
			});
		compilePromises.push(promise);
	};

	const indexFiles = ["/* eslint-disable */"];

	if (fs.existsSync(configSchemaPath) && cmd.configSchema) {
		compile(configSchemaPath, path.resolve(outDir, "configschema.d.ts"));
		indexFiles.push("// @ts-ignore");
		indexFiles.push(`export * from './configschema';`);
	}

	for (const schema of schemas) {
		indexFiles.push("// @ts-ignore");
		indexFiles.push(`export * from './${schema.replace(/\.json$/i, "")}';`);

		compile(
			path.resolve(schemasDir, schema),
			path.resolve(outDir, schema.replace(/\.json$/i, ".d.ts")),
			schemasDir,
		);
	}

	const indexPromise = writeFilePromise(
		path.resolve(outDir, "index.d.ts"),
		`${indexFiles.join("\n")}\n`,
	);

	return Promise.all([indexPromise, ...compilePromises]).then(() => {
		(process.emit as any)("schema-types-done");
	});
}
