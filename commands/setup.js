'use strict';

const util = require('../lib/util');
const childProcess = require('child_process');
const execSync = childProcess.execSync;
const os = require('os');
const chalk = require('chalk');
const inquirer = require('inquirer');
const semver = require('semver');
const fs = require('fs');
const fetchTags = require('../lib/fetch-tags');

const NODECG_GIT_URL = 'https://github.com/nodecg/nodecg.git';

module.exports = function (program) {
	program
		.command('setup [version]')
		.option('-u, --update', 'Update the local NodeCG installation')
		.option('-k, --skip-dependencies', 'Skip installing npm & bower dependencies')
		.description('Install a new NodeCG instance')
		.action(action);
};

function action(version, options) {
	// If NodeCG is already installed but the `-u` flag was not supplied, display an error and return.
	let isUpdate = false;

	// If NodeCG exists in the cwd, but the `-u` flag was not supplied, display an error and return.
	// If it was supplied, fetch the latest tags and set the `isUpdate` flag to true for later use.
	// Else, if this is a clean, empty directory, then we need to clone a fresh copy of NodeCG into the cwd.
	if (util.pathContainsNodeCG(process.cwd())) {
		if (!options.update) {
			console.error('NodeCG is already installed in this directory.');
			console.error('Use ' + chalk.cyan('nodecg setup [version] -u') +
				' if you want update your existing install.');
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

	let target;

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

	if (isUpdate) {
		const nodecgPath = util.getNodeCGPath();
		const current = JSON.parse(fs.readFileSync(nodecgPath + '/package.json')).version;

		process.stdout.write('Downloading latest release...');
		try {
			execSync('git fetch', {stdio: ['pipe', 'pipe', 'pipe']});
			process.stdout.write(chalk.green('done!') + os.EOL);
		} catch (e) {
			/* istanbul ignore next */
			process.stdout.write(chalk.red('failed!') + os.EOL);
			/* istanbul ignore next */
			console.error(e.stack);
			/* istanbul ignore next */
			return;
		}

		if (semver.eq(target, current)) {
			console.log('The target version (%s) is equal to the current version (%s). No action will be taken.',
				chalk.magenta(target), chalk.magenta(current));
		} else if (semver.lt(target, current)) {
			console.log(chalk.red('WARNING: ') + 'The target version (%s) is older than the current version (%s)',
				chalk.magenta(target), chalk.magenta(current));

			inquirer.prompt([{
				name: 'installOlder',
				message: 'Are you sure you wish to continue?',
				type: 'confirm'
			}], answers => {
				if (answers.installOlder) {
					checkoutUpdate(current, target, options.skipDependencies, true);
				}
			});
		} else {
			checkoutUpdate(current, target, options.skipDependencies);
		}
	} else {
		process.stdout.write('Cloning NodeCG... ');
		try {
			execSync(`git clone ${NODECG_GIT_URL} .`, {stdio: ['pipe', 'pipe', 'pipe']});
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
			execSync(`git checkout ${target}`, {stdio: ['pipe', 'pipe', 'pipe']});
			process.stdout.write(chalk.green('done!') + os.EOL);
		} catch (e) {
			/* istanbul ignore next */
			process.stdout.write(chalk.red('failed!') + os.EOL);
			/* istanbul ignore next */
			console.error(e.stack);
			/* istanbul ignore next */
			return;
		}

		// Install NodeCG's production dependencies (`npm install --production`)
		// This operation takes a very long time, so we don't test it.
		/* istanbul ignore if */
		if (!options.skipDependencies) {
			installDependencies();
		}

		console.log(`NodeCG (${target}) installed to ${process.cwd()}`);
	}
}

/* istanbul ignore next: takes forever, not worth testing */
function installDependencies() {
	process.stdout.write('Installing production npm dependencies... ');
	try {
		execSync('npm install --production', {stdio: ['pipe', 'pipe', 'pipe']});
		process.stdout.write(chalk.green('done!') + os.EOL);
	} catch (e) {
		process.stdout.write(chalk.red('failed!') + os.EOL);
		console.error(e.stack);
		return;
	}

	process.stdout.write('Installing production bower dependencies... ');
	try {
		execSync('bower install --production', {stdio: ['pipe', 'pipe', 'pipe']});
		process.stdout.write(chalk.green('done!') + os.EOL);
	} catch (e) {
		process.stdout.write(chalk.red('failed!') + os.EOL);
		console.error(e.stack);
	}
}

function checkoutUpdate(current, target, skipDependencies, downgrade) {
	// Now that we know for sure if the target tag exists (and if its newer or older than current),
	// we can `git pull` and `git checkout <tag>` if appropriate.
	const Verb = downgrade ? 'Downgrading' : 'Upgrading';
	process.stdout.write(Verb + ' from ' + chalk.magenta(current) + ' to ' + chalk.magenta(target) + '... ');

	try {
		execSync(`git checkout ${target}`, {stdio: ['pipe', 'pipe', 'pipe']});
		process.stdout.write(chalk.green('done!') + os.EOL);

		/* istanbul ignore next: takes forever, not worth testing */
		if (!skipDependencies) {
			installDependencies();
		}
	} catch (e) {
		/* istanbul ignore next */
		process.stdout.write(chalk.red('failed!') + os.EOL);
		/* istanbul ignore next */
		console.error(e.stack);
		/* istanbul ignore next */
		return;
	}

	if (target) {
		const verb = downgrade ? 'downgraded' : 'upgraded';
		console.log('NodeCG %s to', verb, chalk.magenta(target));
	}
}
