#!/usr/bin/env node
'use strict';

var program = require('commander');

// External libs
var npa = require('npm-package-arg');
var clone = require('git-clone');
var findup = require('findup-sync');

var nodecgPath = findup('nodecg/');
if (!nodecgPath) {
    console.error('NodeCG installation not found, are you in the right directory?');
    process.exit(1);
}

program
    .option('-d, --dev', 'install development dependencies')
    .parse(process.argv);

if (!program.args[0]) {
    console.log('Hay do stuff if no arg is supplied');
    process.exit(0);
}

var parsed = npa(program.args[0]);

var repoUrl = null;
console.log(parsed);
if (parsed.type === 'git') {
    repoUrl = parsed.spec;
} else if (parsed.type === 'hosted') {
    repoUrl = parsed.hosted.httpsUrl;
} else {
    console.error('Please enter a valid git url (https) or git hub username/repo pair.');
    process.exit(1);
}

console.log(repoUrl, nodecgPath + '/bundles');
clone(repoUrl, nodecgPath + '/bundles', {}, function(er) {
    if (er) {
        console.error(er.message);
        process.exit(1);
    }
});

if (program.dev) {
    // take the contents of nodecg-installdev.js and put them in here
}