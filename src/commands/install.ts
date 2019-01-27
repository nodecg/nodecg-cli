import fs from 'fs';
import os from 'os';
import installBundleDeps from '../lib/install-bundle-deps';
import {execSync} from 'child_process';
import npa from 'npm-package-arg';
import path from 'path';
import util from '../lib/util';
import semver from 'semver';
import chalk from 'chalk';
import fetchTags from '../lib/fetch-tags';
import {Command} from 'commander';
import * as HostedGitInfo from 'hosted-git-info';

export default function (program: Command) {
	program
		.command('install [repo]')
		.description('Install a bundle by cloning a git repo. Can be a GitHub owner/repo pair or a git url.' +
			'\n\t\t    If run in a bundle directory with no arguments, installs that bundle\'s dependencies.')
		.option('-d, --dev', 'install development npm & bower dependencies')
		.action(action);
}

function action(repo: string, options: {dev: boolean}) {
	const dev = options.dev || false;

	// If no args are supplied, assume the user is intending to operate on the bundle in the current dir
	if (!repo) {
		installBundleDeps(process.cwd(), dev);
		return;
	}

	let range = '';
	if (repo.indexOf('#') > 0) {
		const repoParts = repo.split('#');
		range = repoParts[1];
		repo = repoParts[0];
	}

	const nodecgPath = util.getNodeCGPath();
	const parsed = npa(repo);
	if (!parsed.hosted) {
		console.error('Please enter a valid git repository URL or GitHub username/repo pair.');
		return;
	}

	const hostedInfo = parsed.hosted as unknown as HostedGitInfo;
	const repoUrl = hostedInfo.git();
	if (!repoUrl) {
		console.error('Please enter a valid git repository URL or GitHub username/repo pair.');
		return;
	}

	// Check that `bundles` exists
	const bundlesPath = path.join(nodecgPath, 'bundles');
	/* istanbul ignore next: Simple directory creation, not necessary to test */
	if (!fs.existsSync(bundlesPath)) {
		fs.mkdirSync(bundlesPath);
	}

	// Extract repo name from git url
	const temp = repoUrl.split('/').pop()!;
	const bundleName = temp.substr(0, temp.length - 4);
	const bundlePath = path.join(nodecgPath, 'bundles/', bundleName);

	// Figure out what version to checkout
	process.stdout.write(`Fetching ${bundleName} release list... `);
	let tags;
	let target;
	try {
		tags = fetchTags(repoUrl);
		target = semver.maxSatisfying(tags, range);
		process.stdout.write(chalk.green('done!') + os.EOL);
	} catch (e) {
		/* istanbul ignore next */
		process.stdout.write(chalk.red('failed!') + os.EOL);
		/* istanbul ignore next */
		console.error(e.stack);
		/* istanbul ignore next */
		return;
	}

	// Clone from github
	process.stdout.write(`Installing ${bundleName}... `);
	try {
		execSync(`git clone ${repoUrl} "${bundlePath}"`, {stdio: ['pipe', 'pipe', 'pipe']});
		process.stdout.write(chalk.green('done!') + os.EOL);
	} catch (e) {
		/* istanbul ignore next */
		process.stdout.write(chalk.red('failed!') + os.EOL);
		/* istanbul ignore next */
		console.error(e.stack);
		/* istanbul ignore next */
		return;
	}

	// If a bundle has no git tags, target will be null.
	if (target) {
		process.stdout.write(`Checking out version ${target}... `);
		try {
			execSync(`git checkout ${target}`, {
				cwd: bundlePath,
				stdio: ['pipe', 'pipe', 'pipe']
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
	}

	// After installing the bundle, install its npm dependencies
	installBundleDeps(bundlePath, dev);
}
