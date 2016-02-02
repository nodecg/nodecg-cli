'use strict';

var util = require('../lib/util');
var childProcess = require('child_process');
var execSync = childProcess.execSync;
var os = require('os');
var chalk = require('chalk');
var inquirer = require('inquirer');
var semver = require('semver');

var NODECG_GIT_URL = 'https://github.com/nodecg/nodecg.git';

module.exports = function initCommand(program) {
    program
        .command('setup [version]')
        .option('-u, --update', 'Update the local NodeCG installation')
        .option('--skip-dependencies', 'Skip installing npm & bower dependencies')
        .description('Install a new NodeCG instance')
        .action(action);
};

function action(version, options) {
    // If NodeCG is already installed but the `-u` flag was not supplied, display an error and return.
    var isUpdate = false;

    // If NodeCG exists in the cwd, but the `-u` flag was not supplied, display an error and return.
    // If it was supplied, fetch the latest tags and set the `isUpdate` flag to true for later use.
    if (util.pathContainsNodeCG(process.cwd())) {
        if (!options.update) {
            console.log('NodeCG is already installed in this directory.');
            console.log('Use ' + chalk.cyan('nodecg setup [version] -u') +
                ' if you want update your existing install.');
            return;
        }

        isUpdate = true;

        process.stdout.write('Fetching the list of releases... ');
        try {
            execSync('git fetch');
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }
    }

    // If this is a clean, empty directory, then we need to clone a fresh copy of NodeCG into the cwd.
    else {
        process.stdout.write('Cloning NodeCG... ');
        try {
            execSync('git clone ' + NODECG_GIT_URL + ' .', {stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }
    }

    if (version) {
        process.stdout.write('Finding latest release that satisfies semver range ' + chalk.magenta(version) + '... ');
    } else if (isUpdate) {
        process.stdout.write('Checking against local install for updates... ');
    } else {
        process.stdout.write('Finding latest release... ');
    }

    var tags;
    try {
        tags = execSync('git tag').toString().trim().split('\n');
    } catch (e) {
        process.stdout.write(chalk.red('failed!') + os.EOL);
        console.error(e.stack);
        return;
    }

    var target;

    // If a version (or semver range) was supplied, find the latest release that satisfies the range.
    // Else, make the target the newest version.
    if (version) {
        var maxSatisfying = semver.maxSatisfying(tags, version);
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
        var current = require(process.cwd() + '/package.json').version;

        if (semver.eq(target, current)) {
            console.log('The target version (%s) is equal to the current version (%s). No action will be taken.',
                chalk.magenta(target), chalk.magenta(current));
            return;
        }

        else if (semver.lt(target, current)) {
            console.log(chalk.red('WARNING: ') + 'The target version (%s) is older than the current version (%s)',
                chalk.magenta(target), chalk.magenta(current));

            inquirer.prompt([{
                name: 'installOlder',
                message: 'Are you sure you wish to continue?',
                type: 'confirm'
            }], function (answers) {
                if (answers.installOlder) {
                    checkoutUpdate(current, target, options.skipDependencies, true);

                    /*
                     I'm unsure why, but using inquirer here causes the process to never exit, because
                     a net socket is left open. I've no idea why Inquirer is causing a socket to open,
                     nor why it is not being destroyed. The below workaround forces the socket to be destroyed.

                     Lange - 2/2/2016
                    */
                    var handles = process._getActiveHandles();
                    handles[2].destroy();
                }
            });
        }

        else {
            checkoutUpdate(current, target, options.skipDependencies);
        }
    }

    else {
        // Check out the target version.
        process.stdout.write('Checking out version ' + target + '... ');
        try {
            execSync('git checkout ' + target, {stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            process.stdout.write(chalk.red('failed!') + os.EOL);
            console.error(e.stack);
            return;
        }

        // Install NodeCG's production dependencies (`npm install --production`)
        // This operation takes a very long time, so we don't test it.
        /* istanbul ignore if */
        if (!options.skipDependencies) {
            installDependencies();
        }

        console.log('NodeCG (%s) installed to', target, process.cwd());
    }
}

function installDependencies() {
    process.stdout.write('Installing production npm dependencies... ');
    try {
        execSync('npm install --production', { stdio: ['pipe', 'pipe', 'pipe'] });
        process.stdout.write(chalk.green('done!') + os.EOL);
    } catch (e) {
        process.stdout.write(chalk.red('failed!') + os.EOL);
        console.error(e.stack);
        return;
    }

    process.stdout.write('Installing production bower dependencies... ');
    try {
        execSync('bower install --production', { stdio: ['pipe', 'pipe', 'pipe'] });
        process.stdout.write(chalk.green('done!') + os.EOL);
    } catch (e) {
        process.stdout.write(chalk.red('failed!') + os.EOL);
        console.error(e.stack);
    }
}

function checkoutUpdate(current, target, skipDependencies, downgrade) {
    // Now that we know for sure if the target tag exists (and if its newer or older than current),
    // we can `git pull` and `git checkout <tag>` if appropriate.
    var Verb = downgrade ? 'Downgrading' : 'Upgrading';
    process.stdout.write(Verb + ' from ' + chalk.magenta(current) + ' to ' + chalk.magenta(target) + '... ');

    try {
        execSync('git pull origin master', {stdio: ['pipe', 'pipe', 'pipe']});
        execSync('git checkout ' + target, {stdio: ['pipe', 'pipe', 'pipe']});
        process.stdout.write(chalk.green('done!') + os.EOL);
        if (!skipDependencies) {
            installDependencies();
        }
    } catch (e) {
        process.stdout.write(chalk.red('failed!') + os.EOL);
        console.error(e.stack);
        return;
    }

    if (target) {
        var verb = downgrade ? 'downgraded' : 'upgraded';
        console.log('NodeCG %s to', verb, chalk.magenta(target));
    }
}
