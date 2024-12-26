import fs from "node:fs";
import path from "node:path";

import { Command } from "commander";
import fse from "fs-extra";
import temp from "tmp";
import { beforeEach, describe, expect, it, vi } from "vitest";

import defaultConfigCommand from "../../src/commands/defaultconfig";
import { createMockProgram, MockCommand } from "../mocks/program";

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
	defaultConfigCommand(program as unknown as Command);
});

describe("when run with a bundle argument", () => {
	it("should successfully create a bundle config file when bundle has configschema.json", async () => {
		await program.runWith("defaultconfig config-schema");
		const config = JSON.parse(
			fs.readFileSync("./cfg/config-schema.json", { encoding: "utf8" }),
		);
		expect(config.username).toBe("user");
		expect(config.value).toBe(5);
		expect(config.nodefault).toBeUndefined();
	});

	it("should print an error when the target bundle does not have a configschema.json", async () => {
		const spy = vi.spyOn(console, "error");
		fse.mkdirpSync(
			path.resolve(process.cwd(), "./bundles/missing-schema-bundle"),
		);
		await program.runWith("defaultconfig missing-schema-bundle");
		expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(
			`"Error: Bundle %s does not have a configschema.json"`,
		);
		spy.mockRestore();
	});

	it("should print an error when the target bundle does not exist", async () => {
		const spy = vi.spyOn(console, "error");
		await program.runWith("defaultconfig not-installed");
		expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(
			`"Error: Bundle %s does not exist"`,
		);
		spy.mockRestore();
	});

	it("should print an error when the target bundle already has a config", async () => {
		const spy = vi.spyOn(console, "error");
		fs.mkdirSync("./cfg");
		fs.writeFileSync(
			"./cfg/config-schema.json",
			JSON.stringify({ fake: "data" }),
		);
		await program.runWith("defaultconfig config-schema");
		expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(
			`"Error: Bundle %s already has a config file"`,
		);
		spy.mockRestore();
	});
});

describe("when run with no arguments", () => {
	it("should successfully create a bundle config file when run from inside bundle directory", async () => {
		process.chdir("./bundles/config-schema");
		await program.runWith("defaultconfig");
		expect(fs.existsSync("../../cfg/config-schema.json")).toBe(true);
	});

	it("should print an error when in a folder with no package.json", async () => {
		fse.mkdirpSync(path.resolve(process.cwd(), "./bundles/not-a-bundle"));
		process.chdir("./bundles/not-a-bundle");

		const spy = vi.spyOn(console, "error");
		await program.runWith("defaultconfig");
		expect(spy.mock.calls[0][0]).toMatchInlineSnapshot(
			`"Error: No bundle found in the current directory!"`,
		);
		spy.mockRestore();
	});
});
