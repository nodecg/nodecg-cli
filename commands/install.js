'use strict';

var fs = require('fs');
var os = require('os');
var installDeps = require('../lib/install-deps');
var execSync = require('child_process').execSync;
var npa = require('npm-package-arg');
var path = require('path');
var util = require('../lib/util');
var format = require('util').format;
var chalk = require('chalk');

module.exports = function installCommand(program) {
    program
        .command('install [repo]')
        .description('Install a bundle by cloning a git repo. Can be a GitHub owner/repo pair or a git url.' +
                     '\n\t\t    If run in a bundle directory with no arguments, installs that bundle\'s dependencies.')
        .option('-d, --dev', 'install development dependencies')
        .action(action);
};

function action(repo, options) {
    var nodecgPath = util.getNodeCGPath();

    var dev = options.dev || false;
    if (!repo) {
        // If no args are supplied, assume the user is intending to operate on the bundle in the current dir
        installDeps(process.cwd(), dev);
    } else {
        var parsed = npa(repo);
        var repoUrl = null;

        if (parsed.type === 'hosted') {
            repoUrl = parsed.hosted.httpsUrl;
        } else {
            console.error('Please enter a valid git url (https) or GitHub username/repo pair.');
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

        // Fetch the latest tags from GitHub
        process.stdout.write('Installing ' + bundleName + '... ');
        try {
            var cmdline = format('git clone %s "%s"', repoUrl, bundlePath);
            execSync(cmdline, {stdio: ['pipe', 'pipe', 'pipe']});
            process.stdout.write(chalk.green('done!') + os.EOL);
        } catch (e) {
            /* istanbul ignore next */ process.stdout.write(chalk.red('failed!') + os.EOL);
            /* istanbul ignore next */ console.error(e.stack);
            /* istanbul ignore next */ return;
        }

        // After installing the bundle, install its npm dependencies
        installDeps(bundlePath, dev);
    }
}
