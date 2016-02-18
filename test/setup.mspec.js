/* eslint-env mocha */
'use strict';

var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');
var nodecgPath = path.resolve(__dirname, '../tmp');

before(function (done) {
	this.timeout(20000);
	rimraf(nodecgPath, function (e) {
		if (e) {
			throw e;
		}

		fs.mkdirSync(nodecgPath);
		process.chdir(nodecgPath);
		done();
	});
});

beforeEach(function () {
	process.chdir(nodecgPath);
});
