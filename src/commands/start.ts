import util from '../lib/util';
import { Command } from 'commander';
import { execSync } from 'child_process';

export = function (program: Command) {
	program
		.command('start')
		.description('Start NodeCG')
		.action(() => {
			// Check if nodecg is already installed
			if (util.pathContainsNodeCG(process.cwd())) {
				execSync('node --enable-source-maps index.js', { stdio: ['pipe', 'pipe', 'pipe'] });
			} else {
				console.warn('No NodeCG installation found in this folder.');
			}
		});
};
