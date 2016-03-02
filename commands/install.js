'use strict';

var fs = require('fs');
var os = require('os');
var installBundleDeps = require('../lib/install-bundle-deps');
var execSync = require('child_process').execSync;
var npa = require('npm-package-arg');
var path = require('path');
var util = require('../lib/util');
var semver = require('semver');
var chalk = require('chalk');
var fetchTags = require('../lib/fetch-tags');

module.exports = function installCommand(program) {
	program
		.command('install [repo]')
		.description('Install a bundle by cloning a git repo. Can be a GitHub owner/repo pair or a git url.' +
			'\n\t\t    If run in a bundle directory with no arguments, installs that bundle\'s dependencies.')
		.option('-d, --dev', 'install development npm & bower dependencies')
		.action(action);
};

function action(repo, options) {
	var dev = options.dev || false;

	// If no args are supplied, assume the user is intending to operate on the bundle in the current dir
	if (!repo) {
		installBundleDeps(process.cwd(), dev);
		return;
	}

	var range = '';
	if (repo.indexOf('#') > 0) {
		var repoParts = repo.split('#');
		range = repoParts[1];
		repo = repoParts[0];
	}

	var nodecgPath = util.getNodeCGPath();
	var parsed = npa(repo);
	var repoUrl = null;

	if (parsed.type === 'hosted') {
		repoUrl = parsed.hosted.ssh;
	} else {
		console.error('Please enter a valid git repository URL or GitHub username/repo pair.');
		return;
	}

	// Check that `bundles` exists
	var bundlesPath = path.join(nodecgPath, 'bundles');
	/* istanbul ignore next: Simple directory creation, not necessary to test */
	if (!fs.existsSync(bundlesPath)) {
		fs.mkdirSync(bundlesPath);
	}

	// Extract repo name from git url
	var temp = repoUrl.split('/').pop();
	var bundleName = temp.substr(0, temp.length - 4);
	var bundlePath = path.join(nodecgPath, 'bundles/', bundleName);

	// Figure out what version to checkout
	process.stdout.write(`Fetching ${bundleName} release list... `);
	var tags;
	var target;
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
			execSync(`git checkout ${target}`, {cwd: bundlePath, stdio: ['pipe', 'pipe', 'pipe']});
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
