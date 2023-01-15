import util from '../lib/util';
import { Command } from 'commander';
import { execSync } from 'child_process';

export = function (program: Command) {
	program
		.command('start')
		.option('-d, --disable-source-maps', 'Disable source map support')
		.description('Start NodeCG')
		.action((options: { disableSourceMaps: boolean }) => {
			// Check if nodecg is already installed
			if (util.pathContainsNodeCG(process.cwd())) {
				if (options.disableSourceMaps) {
					execSync('node index.js', { stdio: ['pipe', 'pipe', 'pipe'] });
				} else {
					execSync('node --enable-source-maps index.js', { stdio: ['pipe', 'pipe', 'pipe'] });
				}
			} else {
				console.warn('No NodeCG installation found in this folder.');
			}
		});
};
