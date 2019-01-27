import util from '../lib/util';
import {Command} from 'commander';

export default function (program: Command) {
	program
		.command('start')
		.description('Start NodeCG')
		.action(() => {
			// Check if nodecg is already installed
			if (util.pathContainsNodeCG(process.cwd())) {
				require(process.cwd());
			} else {
				console.warn('No NodeCG installation found in this folder.');
			}
		});
}
