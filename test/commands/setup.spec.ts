import fs from "node:fs";

import { Command } from "commander";
import type { PackageJson } from "type-fest";
import { beforeEach, expect, test, vi } from "vitest";

import { setupCommand } from "../../src/commands/setup.js";
import { createMockProgram, MockCommand } from "../mocks/program.js";
import { setupTmpDir } from "./tmp-dir.js";

vi.mock("@inquirer/prompts", () => ({ confirm: () => Promise.resolve(true) }));

let program: MockCommand;
let currentDir = setupTmpDir();
const chdir = (keepCurrentDir = false) => {
	if (!keepCurrentDir) {
		currentDir = setupTmpDir();
	}

	process.chdir(currentDir);
};

const readPackageJson = (): PackageJson => {
	return JSON.parse(fs.readFileSync("./package.json", { encoding: "utf8" }));
};

beforeEach(() => {
	chdir(true);
	program = createMockProgram();
	setupCommand(program as unknown as Command);
});

test("should install the latest NodeCG when no version is specified", async () => {
	chdir();
	await program.runWith("setup --skip-dependencies");
	expect(readPackageJson().name).toBe("nodecg");
});

test("should install v2 NodeCG when specified", async () => {
	chdir();
	await program.runWith("setup v2.0.0 --skip-dependencies");
	expect(readPackageJson().name).toBe("nodecg");
	expect(readPackageJson().version).toBe("2.0.0");
});

test("should install v1 NodeCG when specified", async () => {
	chdir();
	await program.runWith("setup 1.9.0 -u --skip-dependencies");
	expect(readPackageJson().name).toBe("nodecg");
	expect(readPackageJson().version).toBe("1.9.0");
});

test("should ask the user for confirmation when downgrading versions", async () => {
	await program.runWith("setup 0.8.1 -u --skip-dependencies");
	expect(readPackageJson().version).toBe("0.8.1");
});

test("should let the user change upgrade versions", async () => {
	await program.runWith("setup 0.8.2 -u --skip-dependencies");
	expect(readPackageJson().version).toBe("0.8.2");
});

test("should print an error when the target version is the same as current", async () => {
	const spy = vi.spyOn(console, "log");
	await program.runWith("setup 0.8.2 -u --skip-dependencies");
	expect(spy.mock.calls[0]).toMatchInlineSnapshot(`
		[
		  "The target version (v0.8.2) is equal to the current version (0.8.2). No action will be taken.",
		]
	`);
	spy.mockRestore();
});

test("should correctly handle and refuse when you try to downgrade from v2 to v1", async () => {
	chdir();
	await program.runWith("setup 2.0.0 --skip-dependencies");
	expect(readPackageJson().version).toBe("2.0.0");
	await program.runWith("setup 1.9.0 -u --skip-dependencies");
	expect(readPackageJson().version).toBe("2.0.0");
});

test("should print an error when the target version doesn't exist", async () => {
	const spy = vi.spyOn(console, "error");
	await program.runWith("setup 0.0.99 -u --skip-dependencies");
	expect(spy.mock.calls[0]![0]).toMatchInlineSnapshot(
		`"No releases match the supplied semver range (0.0.99)"`,
	);
	spy.mockRestore();
});

test("should print an error and exit, when nodecg is already installed in the current directory ", async () => {
	const spy = vi.spyOn(console, "error");
	await program.runWith("setup 0.7.0 --skip-dependencies");
	expect(spy).toBeCalledWith("NodeCG is already installed in this directory.");
	spy.mockRestore();
});
