'use strict';

var fs = require('fs');
var inquirer = require('inquirer');
var path = require('path');
var util = require('../lib/util');
var chalk = require('chalk');
var rimraf = require('rimraf');
var os = require('os');

module.exports = function installCommand(program) {
    program
        .command('uninstall <bundle>')
        .description('Uninstalls a bundle.')
        .option('-f, --force', 'ignore warnings')
        .action(action);
};

function action(bundleName, options) {
    var nodecgPath = process.cwd();
    if (!util.pathContainsNodeCG(nodecgPath)) {
        console.error('NodeCG installation not found, are you in the right directory?');
        return;
    }

    var bundlesPath = path.resolve(nodecgPath, 'bundles');
    if (!fs.existsSync(bundlesPath)) {
        console.log('Bundle %s does not exist', chalk.magenta(bundleName));
    }

    var bundlePath = path.resolve(bundlesPath, bundleName);
    if (options.force) {
        deleteBundle(bundleName, bundlePath);
    } else {
        inquirer.prompt([{
            name: 'confirmUninstall',
            message: 'Are you sure you wish to uninstall ' + bundleName + '?',
            type: 'confirm'
        }], function (answers) {
            if (answers.confirmUninstall) {
                deleteBundle(bundleName, bundlePath);
            }
        });
    }
}

function deleteBundle(name, path) {
    if (!fs.existsSync(path)) {
        console.log('Nothing to uninstall.');
        return;
    }

    process.stdout.write('Uninstalling ' + chalk.magenta(name) + '... ');
    try {
        rimraf.sync(path);
    } catch (e) {
        process.stdout.write(chalk.red('failed!') + os.EOL);
        console.error(e.stack);
        return;
    }
    process.stdout.write(chalk.green('done!') + os.EOL);
}
