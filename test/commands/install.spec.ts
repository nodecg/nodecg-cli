import fs from "node:fs";

import { Command } from "commander";
import rimraf from "rimraf";
import semver from "semver";
import temp from "tmp";
import { beforeEach, expect, it, vi } from "vitest";

import installCommand from "../../src/commands/install";
import { createMockProgram, MockCommand } from "../mocks/program";

let program: MockCommand;
const tempFolder = temp.dirSync();
process.chdir(tempFolder.name);
fs.writeFileSync("package.json", JSON.stringify({ name: "nodecg" }));

beforeEach(() => {
	program = createMockProgram();
	installCommand(program as unknown as Command);
});

it("should install a bundle and its dependencies", async () => {
	await program.runWith("install supportclass/lfg-streamtip");
	expect(fs.existsSync("./bundles/lfg-streamtip/package.json")).toBe(true);
	expect(
		fs.readdirSync("./bundles/lfg-streamtip/node_modules").length,
	).toBeGreaterThan(0);
	expect(
		fs.readdirSync("./bundles/lfg-streamtip/bower_components").length,
	).toBeGreaterThan(0);
});

it("should install a version that satisfies a provided semver range", async () => {
	await program.runWith("install supportclass/lfg-nucleus#^1.1.0");
	expect(fs.existsSync("./bundles/lfg-nucleus/package.json")).toBe(true);

	const pjson = JSON.parse(
		fs.readFileSync("./bundles/lfg-nucleus/package.json", {
			encoding: "utf8",
		}),
	);
	expect(semver.satisfies(pjson.version, "^1.1.0")).toBe(true);
});

it("should install bower & npm dependencies when run with no arguments in a bundle directory", async () => {
	rimraf.sync("./bundles/lfg-streamtip/node_modules");
	rimraf.sync("./bundles/lfg-streamtip/bower_components");

	process.chdir("./bundles/lfg-streamtip");
	await program.runWith("install");
	expect(fs.readdirSync("./node_modules").length).toBeGreaterThan(0);
	expect(fs.readdirSync("./bower_components").length).toBeGreaterThan(0);
});

it("should print an error when no valid git repo is provided", async () => {
	const spy = vi.spyOn(console, "error");
	await program.runWith("install 123");
	expect(spy).toBeCalledWith(
		"Please enter a valid git repository URL or GitHub username/repo pair.",
	);
	spy.mockRestore();
});
