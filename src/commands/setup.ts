import util, { NPMRelease } from '../lib/util';
import { execSync } from 'child_process';
import os from 'os';
import chalk from 'chalk';
import inquirer from 'inquirer';
import semver from 'semver';
import fs from 'fs';
import fetchTags from '../lib/fetch-tags';
import { Command } from 'commander';
import fetch from 'node-fetch';
import tar from 'tar';

const NODECG_GIT_URL = 'https://github.com/nodecg/nodecg.git';

export = function (program: Command) {
	program
		.command('setup [version]')
		.option('-u, --update', 'Update the local NodeCG installation')
		.option('-k, --skip-dependencies', 'Skip installing npm & bower dependencies')
		.description('Install a new NodeCG instance')
		.action(decideActionVersion);
};

async function decideActionVersion(version: string, options: { update: boolean; skipDependencies: boolean }) {
	// If NodeCG is already installed but the `-u` flag was not supplied, display an error and return.
	let isUpdate = false;

	// If NodeCG exists in the cwd, but the `-u` flag was not supplied, display an error and return.
	// If it was supplied, fetch the latest tags and set the `isUpdate` flag to true for later use.
	// Else, if this is a clean, empty directory, then we need to clone a fresh copy of NodeCG into the cwd.
	if (util.pathContainsNodeCG(process.cwd())) {
		if (!options.update) {
			console.error('NodeCG is already installed in this directory.');
			console.error(
				'Use ' + chalk.cyan('nodecg setup [version] -u') + ' if you want update your existing install.',
			);
			return;
		}

		isUpdate = true;
	}

	if (version) {
		process.stdout.write('Finding latest release that satisfies semver range ' + chalk.magenta(version) + '... ');
	} else if (isUpdate) {
		process.stdout.write('Checking against local install for updates... ');
	} else {
		process.stdout.write('Finding latest release... ');
	}

	let tags;
	try {
		tags = fetchTags(NODECG_GIT_URL);
	} catch (e) {
		/* istanbul ignore next */
		process.stdout.write(chalk.red('failed!') + os.EOL);
		/* istanbul ignore next */
		console.error(e.stack);
		/* istanbul ignore next */
		return;
	}

	let target: string;

	// If a version (or semver range) was supplied, find the latest release that satisfies the range.
	// Else, make the target the newest version.
	if (version) {
		const maxSatisfying = semver.maxSatisfying(tags, version);
		if (!maxSatisfying) {
			process.stdout.write(chalk.red('failed!') + os.EOL);
			console.error('No releases match the supplied semver range (' + chalk.magenta(version) + ')');
			return;
		}

		target = maxSatisfying;
	} else {
		target = semver.maxSatisfying(tags, '');
	}

	process.stdout.write(chalk.green('done!') + os.EOL);

	let current: string | undefined;
	let downgrade = false;

	if (isUpdate) {
		const current = util.getCurrentNodeCGVersion();

		if (semver.eq(target, current)) {
			console.log(
				'The target version (%s) is equal to the current version (%s). No action will be taken.',
				chalk.magenta(target),
				chalk.magenta(current),
			);
			return;
		}

		if (semver.lt(target, current)) {
			console.log(
				chalk.red('WARNING: ') + 'The target version (%s) is older than the current version (%s)',
				chalk.magenta(target),
				chalk.magenta(current),
			);

			const answers = await inquirer.prompt<{ installOlder: boolean }>([
				{
					name: 'installOlder',
					message: 'Are you sure you wish to continue?',
					type: 'confirm',
				},
			]);

			if (!answers.installOlder) {
				console.log('Setup cancelled.');
				return;
			}

			downgrade = true;
		}
	}

	if (semver.lt(target, 'v2.0.0')) {
		actionV1(current, target, isUpdate);
	} else if (semver.lt(target, 'v3.0.0')) {
		await actionV2(current, target, isUpdate);
	} else {
		console.error(
			`Unknown NodeCG verison ${chalk.magenta(
				version,
			)}, perhaps you need to update nodecg-cli? (${chalk.cyan.bold('npm i -g nodecg-cli@latest')})`,
		);
	}

	// Install NodeCG's dependencies
	// This operation takes a very long time, so we don't test it.
	/* istanbul ignore if */
	if (!options.skipDependencies) {
		installDependencies();
	}

	if (isUpdate) {
		const verb = downgrade ? 'downgraded' : 'upgraded';
		console.log('NodeCG %s to', verb, chalk.magenta(target));
	} else {
		console.log(`NodeCG (${target}) installed to ${process.cwd()}`);
	}
}

function actionV1(current: string | undefined, target: string, isUpdate: boolean) {
	if (isUpdate) {
		process.stdout.write('Downloading latest release...');
		try {
			execSync('git fetch', { stdio: ['pipe', 'pipe', 'pipe'] });
			process.stdout.write(chalk.green('done!') + os.EOL);
		} catch (e) {
			/* istanbul ignore next */
			process.stdout.write(chalk.red('failed!') + os.EOL);
			/* istanbul ignore next */
			console.error(e.stack);
			/* istanbul ignore next */
			return;
		}

		if (current) {
			logDownOrUpgradeMessage(current, target, semver.lt(target, current));
		}

		gitCheckoutUpdate(target);
	} else {
		process.stdout.write('Cloning NodeCG... ');
		try {
			execSync(`git clone ${NODECG_GIT_URL} .`, { stdio: ['pipe', 'pipe', 'pipe'] });
			process.stdout.write(chalk.green('done!') + os.EOL);
		} catch (e) {
			/* istanbul ignore next */
			process.stdout.write(chalk.red('failed!') + os.EOL);
			/* istanbul ignore next */
			console.error(e.stack);
			/* istanbul ignore next */
			return;
		}

		// Check out the target version.
		process.stdout.write(`Checking out version ${target}... `);
		try {
			execSync(`git checkout ${target}`, { stdio: ['pipe', 'pipe', 'pipe'] });
			process.stdout.write(chalk.green('done!') + os.EOL);
		} catch (e) {
			/* istanbul ignore next */
			process.stdout.write(chalk.red('failed!') + os.EOL);
			/* istanbul ignore next */
			console.error(e.stack);
		}
	}
}

async function actionV2(current: string | undefined, target: string, _isUpdate: boolean) {
	let release: NPMRelease;

	process.stdout.write('Downloading latest release...');
	try {
		release = await util.getLatestNodeCGRelease();
		if (release.version !== target) {
			process.stdout.write(chalk.red('failed!') + os.EOL);
			console.error(
				`Expected latest npm release to be ${chalk.magenta(target)} but instead it was ${chalk.magenta(
					release.version,
				)}. Aborting.`,
			);
			return;
		}

		process.stdout.write(chalk.green('done!') + os.EOL);
	} catch (e) {
		/* istanbul ignore next */
		process.stdout.write(chalk.red('failed!') + os.EOL);
		/* istanbul ignore next */
		console.error(e.stack);
		/* istanbul ignore next */
		return;
	}

	if (current) {
		logDownOrUpgradeMessage(current, target, semver.lt(target, current));
	}

	downloadAndExtractReleaseTarball(release.dist.tarball);
}

/* istanbul ignore next: takes forever, not worth testing */
function installDependencies() {
	try {
		process.stdout.write('Installing production npm dependencies... ');
		execSync('npm ci --production', { stdio: ['pipe', 'pipe', 'pipe'] });

		process.stdout.write(chalk.green('done!') + os.EOL);
	} catch (e) {
		process.stdout.write(chalk.red('failed!') + os.EOL);
		console.error(e.stack);
		return;
	}

	if (fs.existsSync('./bower.json')) {
		process.stdout.write('Installing production bower dependencies... ');
		try {
			execSync('bower install --production', { stdio: ['pipe', 'pipe', 'pipe'] });
			process.stdout.write(chalk.green('done!') + os.EOL);
		} catch (e) {
			process.stdout.write(chalk.red('failed!') + os.EOL);
			console.error(e.stack);
		}
	}
}

function gitCheckoutUpdate(target: string) {
	try {
		execSync(`git checkout ${target}`, { stdio: ['pipe', 'pipe', 'pipe'] });
		process.stdout.write(chalk.green('done!') + os.EOL);
	} catch (e) {
		/* istanbul ignore next */
		process.stdout.write(chalk.red('failed!') + os.EOL);
		/* istanbul ignore next */
		console.error(e.stack);
	}
}

async function downloadAndExtractReleaseTarball(tarballUrl: string) {
	try {
		const res = await fetch(tarballUrl);
		if (!res.body) {
			throw new Error(`Failed to fetch release tarball from ${tarballUrl}, status code ${res.status}`);
		}

		res.body.pipe(tar.x({})).on('end', () => {
			process.stdout.write(chalk.green('done!') + os.EOL);
		});
	} catch (e) {
		/* istanbul ignore next */
		process.stdout.write(chalk.red('failed!') + os.EOL);
		/* istanbul ignore next */
		console.error(e.stack);
	}
}

function logDownOrUpgradeMessage(current: string, target: string, downgrade: boolean): void {
	const Verb = downgrade ? 'Downgrading' : 'Upgrading';
	process.stdout.write(Verb + ' from ' + chalk.magenta(current) + ' to ' + chalk.magenta(target) + '... ');
}
