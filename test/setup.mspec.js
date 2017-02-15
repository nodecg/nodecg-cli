/* eslint-env mocha */
'use strict';

const temp = require('temp');
const tempFolder = temp.mkdirSync();

// Automatically track and cleanup files at exit
temp.track();

beforeEach(() => {
	process.chdir(tempFolder);
});
