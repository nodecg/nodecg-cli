#!/usr/bin/env node
'use strict';

var program = require('commander');

// External libs
var fs = require('fs.extra');
var npm = require('npm');

program.parse(process.argv);

var version = program.args[0] || 'latest';

// check if nodecg is already installed
var pjsonPath = process.cwd() + '/package.json';
if (fs.existsSync(pjsonPath)) {
    var pjson = require(pjsonPath);
    if (pjson.name.toLowerCase() === 'nodecg') {
        console.log('NodeCG is already installed in this directory');
        process.exit(0);
    }
}

// Use npm to install to node_modules, then copy out
fs.mkdirpSync('node_modules');

npm.load({}, function npmLoaded(er) {
    if (er) {
        console.error('Error loading npm:', er.stack);
        process.exit(1);
    }

    // astoundingly stupid hack to make NPM not spam the console
    console.log('Installing nodecg@' + version);
    npm.commands.install(['nodecg@' + version], function afterInstall(er, data) {
        if (er) {
            console.error('Error downloading/installing NodeCG:', er.stack);
            process.exit(1);
        }

        // npm automatically installs nodecg to node_modules/nodecg
        // we must move it into the current directory
        console.log(os.EOL + 'Copying files. This will take a while...');
        fs.copyRecursive('./node_modules/nodecg', '.', function (er) {
            if (er) {
                console.error('Error moving nodecg after npm install:', er.stack);
                process.exit(1);
            }

            fs.rmrf('./node_modules/nodecg', function (err) {
                if (err) {
                    console.error('Error cleaning up after npm install:', er.stack);
                    process.exit(1);
                }

                console.log('NodeCG (%s) installed to', version, process.cwd());
                process.exit(0);
            });
        });
    });
});