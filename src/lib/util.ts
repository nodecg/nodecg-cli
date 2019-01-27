import fs from 'fs';
import path from 'path';

export default {
	/**
	 * Checks if the given directory contains a NodeCG installation.
	 * @param pathToCheck
	 */
	pathContainsNodeCG(pathToCheck: string): boolean {
		const pjsonPath = path.join(pathToCheck, 'package.json');
		if (fs.existsSync(pjsonPath)) {
			const pjson = require(pjsonPath);
			return pjson.name.toLowerCase() === 'nodecg';
		}

		return false;
	},

	/**
	 * Gets the nearest NodeCG installation folder. First looks in process.cwd(), then looks
	 * in every parent folder until reaching the root. Throws an error if no NodeCG installation
	 * could be found.
	 * @returns {*|String}
	 */
	getNodeCGPath() {
		let curr = process.cwd();
		do {
			if (this.pathContainsNodeCG(curr)) {
				return curr;
			}

			const nextCurr = path.resolve(curr, '..');
			if (nextCurr === curr) {
				throw new Error('NodeCG installation could not be found in this directory or any parent directory.');
			}

			curr = nextCurr;
		} while (fs.lstatSync(curr).isDirectory());

		throw new Error('NodeCG installation could not be found in this directory or any parent directory.');
	},

	/**
	 * Checks if the given directory is a NodeCG bundle.
	 * @param pathToCheck
	 * @returns {boolean}
	 */
	isBundleFolder(pathToCheck: string) {
		const pjsonPath = path.join(pathToCheck, 'package.json');
		if (fs.existsSync(pjsonPath)) {
			const pjson = require(pjsonPath);
			return typeof pjson.nodecg === 'object';
		}

		return false;
	}
};
