#!/usr/bin/env node
'use strict';

// Nodejs libs
var fs = require('fs');

// / check if nodecg is already installed
var pjsonPath = process.cwd() + '/package.json';
if (fs.existsSync(pjsonPath)) {
    var pjson = require(pjsonPath);
    if (pjson.name.toLowerCase() === 'nodecg') {
        console.log('Running local NodeCG ('+ pjson.version +')');
        require(process.cwd());
    } else {
        console.warn('No NodeCG installation found in this folder.');
    }
} else {
    console.warn('No NodeCG installation found in this folder.');
}