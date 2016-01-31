'use strict';

var util = require('../lib/util');
var childProcess = require('child_process');
var execSync = childProcess.execSync;
var os = require('os');
var chalk = require('chalk');
var inquirer = require('inquirer');

var NODECG_GIT_URL = 'https://github.com/nodecg/nodecg.git';

module.exports = function initCommand(program) {
    program
        .command('setup [version]')
        .option('-u, --update', 'Update the local NodeCG installation')
        .option('--skip-npm', 'Skip installing npm dependencies')
        .description('Install a new NodeCG instance')
        .action(action);
};

function action(version, options) {
    // We prefix our release tags with 'v'
    if (version && version.charAt(0) !== 'v') {
        version = 'v' + version;
    }

    // If NodeCG is already installed and the `-u` flag was supplied, update NodeCG
    if (util.pathContainsNodeCG(process.cwd())) {
        if (!options.update) {
            console.log('NodeCG is already installed in this directory.');
            console.log('Use ' + chalk.cyan('nodecg setup [version] -u') +
                ' if you want update your existing install.');
            return;
        }

        // Fetch the latest tags from GitHub
        process.stdout.write('Fetching the list of releases... ');
        try {
            execSync('git fetch');
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }

        if (version) {
            process.stdout.write('Searching for release ' + chalk.magenta(version) + ' ... ');
        } else {
            process.stdout.write('Checking against local install for updates... ');
        }

        var tags;
        try {
            tags = execSync('git tag').toString().trim().split('\n');
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }

        var current = 'v' + require(process.cwd() + '/package.json').version;

        // If a version was specified, look for it in the list of tags
        if (version && tags.indexOf(version) < 0) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error('The desired release, ' + chalk.magenta(version) + ', could not be found.');
            return;
        }

        // Now that we know our version exists, our target is either the version or the newest tag.
        var updatingToLatest = Boolean(!version);
        var target = version || tags.pop();
        process.stdout.write(chalk.green('done!') + os.EOL);

        if (target < current) {
            console.log(chalk.red('WARNING: ') + 'The target version (%s) is older than the current version (%s)',
                chalk.magenta(target), chalk.magenta(current));
            inquirer.prompt([{
                name: 'installOlder',
                message: 'Are you sure you wish to continue?',
                type: 'confirm'
            }], function (answers) {
                if (answers.installOlder) {
                    checkoutAfterFetch();
                }
            });
        } else {
            checkoutAfterFetch();
        }

        return;
    }

    function checkoutAfterFetch() {
        if (target === current) {
            console.log('Already on version %s', chalk.magenta(current));
            return;
        }

        if (updatingToLatest && current >= target) {
            console.log('No updates found! Your current version (%s) is the latest.', chalk.magenta(current));
            return;
        }

        // Now that we know for sure if the target tag exists (and if its newer or older than current),
        // we can `git pull` and `git checkout <tag>` if appropriate.
        process.stdout.write('Updating from ' + chalk.magenta(current) + ' to ' + chalk.magenta(target) + '... ');
        try {
            execSync('git pull origin master', {stdio: ['pipe', 'pipe', 'pipe']});
            execSync('git checkout ' + target, {stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }

        if (target) {
            console.log('NodeCG updated to', chalk.magenta(target));
        }
    }

    // If we're here, then NodeCG must not be installed yet.
    // Clone it into the cwd.
    process.stdout.write('Cloning NodeCG... ');
    try {
        execSync('git clone ' + NODECG_GIT_URL + ' .', {stdio: ['pipe', 'pipe', 'pipe']});
        process.stdout.write(chalk.green('done!') + os.EOL);
    } catch (e) {
        process.stdout.write(chalk.red('failed!') + os.EOL);
        console.error(e.stack);
        return;
    }

    // If [version] was supplied, checkout that version
    if (version) {
        process.stdout.write('Checking out version ' + version + '... ');
        try {
            execSync('git checkout ' + version, {stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }
    }

    // Install NodeCG's production dependencies (`npm install --production`)
    // This operation takes a very long time, so we don't test it.
    /* istanbul ignore if */
    if (!options.skipNpm) {
        process.stdout.write('Installing production npm dependencies... ');
        try {
            execSync('npm install --production', { stdio: ['pipe', 'pipe', 'pipe'] });
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }
    }

    console.log('NodeCG (%s) installed to', version ? version : 'latest', process.cwd());
}
