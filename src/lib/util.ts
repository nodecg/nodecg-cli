import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import semver from "semver";

export default {
	/**
	 * Checks if the given directory contains a NodeCG installation.
	 * @param pathToCheck
	 */
	pathContainsNodeCG(pathToCheck: string): boolean {
		const pjsonPath = path.join(pathToCheck, "package.json");
		if (fs.existsSync(pjsonPath)) {
			const pjson = require(pjsonPath);
			return pjson.name.toLowerCase() === "nodecg";
		}

		return false;
	},

	/**
	 * Gets the nearest NodeCG installation folder. First looks in process.cwd(), then looks
	 * in every parent folder until reaching the root. Throws an error if no NodeCG installation
	 * could be found.
	 */
	getNodeCGPath() {
		let curr = process.cwd();
		do {
			if (this.pathContainsNodeCG(curr)) {
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
	},

	/**
	 * Checks if the given directory is a NodeCG bundle.
	 */
	isBundleFolder(pathToCheck: string) {
		const pjsonPath = path.join(pathToCheck, "package.json");
		if (fs.existsSync(pjsonPath)) {
			const pjson = require(pjsonPath);
			return typeof pjson.nodecg === "object";
		}

		return false;
	},

	/**
	 * Gets the currently-installed NodeCG version string, in the format "vX.Y.Z"
	 */
	getCurrentNodeCGVersion(): string {
		const nodecgPath = this.getNodeCGPath();
		return JSON.parse(fs.readFileSync(`${nodecgPath}/package.json`, "utf8"))
			.version;
	},

	/**
	 * Gets the latest NodeCG release information from npm, including tarball download link.
	 */
	async getNodeCGRelease(target: string): Promise<NPMRelease> {
		const targetVersion = semver.coerce(target)?.version;
		if (!targetVersion) {
			throw new Error(`Failed to determine target NodeCG version`);
		}

		const res = await fetch(
			`http://registry.npmjs.org/nodecg/${targetVersion}`,
		);
		if (res.status !== 200) {
			throw new Error(
				`Failed to fetch NodeCG release information from npm, status code ${res.status}`,
			);
		}

		return res.json() as Promise<NPMRelease>;
	},

	async getLatestCLIRelease(): Promise<NPMRelease> {
		const res = await fetch("http://registry.npmjs.org/nodecg-cli/latest");
		if (res.status !== 200) {
			throw new Error(
				`Failed to fetch NodeCG release information from npm, status code ${res.status}`,
			);
		}

		return res.json() as Promise<NPMRelease>;
	},
};

export interface NPMRelease {
	name: string;
	version: string;
	description?: string;
	bugs?: { url: string };
	repository?: { type: string; url: string };
	license: string;
	bin?: { [key: string]: string };
	scripts?: { [key: string]: string };
	dependencies?: { [key: string]: string };
	devDependencies?: { [key: string]: string };
	engines?: { [key: string]: string };
	contributors?: Array<{ [key: string]: string }>;
	gitHead?: string;
	homepage?: string;
	dist: {
		integrity: string;
		shasum: string;
		tarball: string;
		fileCount: number;
		unpackedSize: number;
		signatures: Array<{
			keyid: string;
			sig: string;
		}>;
		"npm-signature": string;
	};
	directories?: { [key: string]: string };
	maintainers: Array<{ [key: string]: string }>;
}
