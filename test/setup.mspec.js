/* eslint-env mocha */
'use strict';

var temp = require('temp');
var tempFolder = temp.mkdirSync();

// Automatically track and cleanup files at exit
temp.track();

beforeEach(function () {
	process.chdir(tempFolder);
});
