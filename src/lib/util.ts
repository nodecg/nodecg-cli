import fs from "node:fs";
import path from "node:path";

import semver from "semver";

import type { NpmRelease } from "./sample/npm-release.js";

/**
 * Checks if the given directory contains a NodeCG installation.
 * @param pathToCheck
 */
export function pathContainsNodeCG(pathToCheck: string): boolean {
	const pjsonPath = path.join(pathToCheck, "package.json");
	if (fs.existsSync(pjsonPath)) {
		const pjson = JSON.parse(fs.readFileSync(pjsonPath, "utf8"));
		return pjson.name.toLowerCase() === "nodecg";
	}

	return false;
}

/**
 * Gets the nearest NodeCG installation folder. First looks in process.cwd(), then looks
 * in every parent folder until reaching the root. Throws an error if no NodeCG installation
 * could be found.
 */
export function getNodeCGPath() {
	let curr = process.cwd();
	do {
		if (pathContainsNodeCG(curr)) {
			return curr;
		}

		const nextCurr = path.resolve(curr, "..");
		if (nextCurr === curr) {
			throw new Error(
				"NodeCG installation could not be found in this directory or any parent directory.",
			);
		}

		curr = nextCurr;
	} while (fs.lstatSync(curr).isDirectory());

	throw new Error(
		"NodeCG installation could not be found in this directory or any parent directory.",
	);
}

/**
 * Checks if the given directory is a NodeCG bundle.
 */
export function isBundleFolder(pathToCheck: string) {
	const pjsonPath = path.join(pathToCheck, "package.json");
	if (fs.existsSync(pjsonPath)) {
		const pjson = JSON.parse(fs.readFileSync(pjsonPath, "utf8"));
		return typeof pjson.nodecg === "object";
	}

	return false;
}

/**
 * Gets the currently-installed NodeCG version string, in the format "vX.Y.Z"
 */
export function getCurrentNodeCGVersion(): string {
	const nodecgPath = getNodeCGPath();
	return JSON.parse(fs.readFileSync(`${nodecgPath}/package.json`, "utf8"))
		.version;
}

/**
 * Gets the latest NodeCG release information from npm, including tarball download link.
 */
export async function getNodeCGRelease(target: string): Promise<NpmRelease> {
	const targetVersion = semver.coerce(target)?.version;
	if (!targetVersion) {
		throw new Error(`Failed to determine target NodeCG version`);
	}

	const res = await fetch(`http://registry.npmjs.org/nodecg/${targetVersion}`);
	if (res.status !== 200) {
		throw new Error(
			`Failed to fetch NodeCG release information from npm, status code ${res.status}`,
		);
	}

	return res.json() as Promise<NpmRelease>;
}

export async function getLatestCLIRelease(): Promise<NpmRelease> {
	const res = await fetch("http://registry.npmjs.org/nodecg-cli/latest");
	if (res.status !== 200) {
		throw new Error(
			`Failed to fetch NodeCG release information from npm, status code ${res.status}`,
		);
	}

	return res.json() as Promise<NpmRelease>;
}
