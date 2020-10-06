import fs from 'fs';
import { format } from 'util';
import chalk from 'chalk';
import os from 'os';
import { execSync } from 'child_process';
import util from './util';

/**
 * Installs npm and bower dependencies for the NodeCG bundle present at the given path.
 * @param bundlePath - The path of the NodeCG bundle to install dependencies for.
 * @param installDev - Whether to install devDependencies.
 */
export default function (bundlePath: string, installDev = false) {
	if (!util.isBundleFolder(bundlePath)) {
		console.error(
			chalk.red('Error:') +
				" There doesn't seem to be a valid NodeCG bundle in this folder:" +
				'\n\t' +
				chalk.magenta(bundlePath),
		);
		process.exit(1);
	}

	let cmdline;

	const cachedCwd = process.cwd();
	if (fs.existsSync(bundlePath + '/package.json')) {
		process.chdir(bundlePath);
		cmdline = installDev ? 'npm install' : 'npm install --production';
		process.stdout.write(format('Installing npm dependencies (dev: %s)... ', installDev));
		try {
			execSync(cmdline, {
				cwd: bundlePath,
				stdio: ['pipe', 'pipe', 'pipe'],
			});
			process.stdout.write(chalk.green('done!') + os.EOL);
		} catch (e) {
			/* istanbul ignore next */
			process.stdout.write(chalk.red('failed!') + os.EOL);
			/* istanbul ignore next */
			console.error(e.stack);
			/* istanbul ignore next */
			return;
		}

		process.chdir(cachedCwd);
	}

	if (fs.existsSync(bundlePath + '/bower.json')) {
		cmdline = format('bower install %s', installDev ? '' : '--production');
		process.stdout.write(format('Installing bower dependencies (dev: %s)... ', installDev));
		try {
			execSync(cmdline, {
				cwd: bundlePath,
				stdio: ['pipe', 'pipe', 'pipe'],
			});
			process.stdout.write(chalk.green('done!') + os.EOL);
		} catch (e) {
			/* istanbul ignore next */
			process.stdout.write(chalk.red('failed!') + os.EOL);
			/* istanbul ignore next */
			console.error(e.stack);
		}
	}
}
