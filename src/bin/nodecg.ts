#!/usr/bin/env node

import chalk from 'chalk';
import {execSync} from 'child_process';

const REQUIRED_VERSION = 'v0.11.22';

if (typeof execSync !== 'function') {
	console.error('nodecg-cli relies on %s, which was added to Node.js in %s (your version: %s).',
		chalk.cyan('execSync'), chalk.magenta(REQUIRED_VERSION), chalk.magenta(process.version));
	console.error('Please upgrade your Node.js installation.');
	process.exit(1);
}

try {
	execSync('git --version', {stdio: ['pipe', 'pipe', 'pipe']});
} catch (e) {
	console.error('nodecg-cli requires that %s be available in your PATH.', chalk.cyan('git'));
	console.error('If you do not have %s installed, you can get it from http://git-scm.com/', chalk.cyan('git'));
	console.error('By default, the installer will add %s to your PATH.', chalk.cyan('git'));
	process.exit(1);
}

require('..');
