import fs from "fs";
import path from "path";
import fse from "fs-extra";
import temp from "tmp";
import { MockCommand, createMockProgram } from "../mocks/program";
import schemaTypesCommand from "../../src/commands/schema-types";
import { EventEmitter } from "events";
import { beforeEach, expect, it, vi } from "vitest";

let program: MockCommand;

beforeEach(() => {
	// Set up environment.
	const tempFolder = temp.dirSync();
	process.chdir(tempFolder.name);
	fs.writeFileSync("package.json", JSON.stringify({ name: "nodecg" }));

	// Copy fixtures.
	fse.copySync(path.resolve(__dirname, "../fixtures/"), "./");

	// Build program.
	program = createMockProgram();
	schemaTypesCommand(program as any);
});

it("should successfully create d.ts files from the replicant schemas and create an index.d.ts file", async () => {
	process.chdir("bundles/schema-types");

	/*
	 * Commander has no return values for command invocations.
	 * This means that if your command returns a promise (or is otherwise async),
	 * there is no way to get a reference to that promise to await it.
	 * The command is just invoked by a dispatched event, with no
	 * way to access the return value of your command's action.
	 *
	 * This makes testing async actions very challenging.
	 *
	 * Our current solution is to hack custom events onto the process global.
	 * It's gross, but whatever. It works for now.
	 */
	await Promise.all([
		program.runWith("schema-types"),
		waitForEvent(process, "schema-types-done"),
	]);

	const outputPath = "./src/types/schemas/example.d.ts";
	expect(fs.existsSync(outputPath)).toBe(true);

	expect(fs.readFileSync(outputPath, "utf8")).toMatchFileSnapshot(
		"../fixtures/results/schema-types/example.d.ts",
	);

	const indexPath = "./src/types/schemas/index.d.ts";
	expect(fs.existsSync(indexPath)).toBe(true);
	expect(fs.readFileSync(indexPath, "utf8")).toMatchFileSnapshot(
		"../fixtures/results/schema-types/index.d.ts",
	);
});

it("should print an error when the target bundle does not have a schemas dir", async () => {
	process.chdir("bundles/uninstall-test");
	const spy = vi.spyOn(console, "error");
	await program.runWith("schema-types");
	expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(
		`"Error: Input directory ("%s") does not exist"`,
	);
	spy.mockRestore();
});

it("should successfully compile the config schema", async () => {
	process.chdir("bundles/config-schema");
	fs.mkdirSync("empty-dir");

	await Promise.all([
		program.runWith("schema-types empty-dir"),
		waitForEvent(process, "schema-types-done"),
	]);

	const outputPath = "./src/types/schemas/configschema.d.ts";
	expect(fs.existsSync(outputPath)).toBe(true);

	expect(fs.readFileSync(outputPath, "utf8")).toMatchFileSnapshot(
		"../fixtures/results/schema-types/configschema.d.ts",
	);
	expect(fs.readFileSync("./src/types/schemas/index.d.ts", "utf8"))
		.toMatchInlineSnapshot(`
		"/* eslint-disable */
		// @ts-ignore
		export * from './configschema';
		"
	`);
});

async function waitForEvent(emitter: EventEmitter, eventName: string) {
	return new Promise<void>((resolve) => {
		emitter.on(eventName, () => {
			resolve();
		});
	});
}
