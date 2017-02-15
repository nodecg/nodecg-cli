'use strict';

const execSync = require('child_process').execSync;

module.exports = function (repoUrl) {
	const rawTags = execSync(`git ls-remote --refs --tags ${repoUrl}`).toString().trim().split('\n');
	return rawTags.map(rawTag => rawTag.split('refs/tags/').pop());
};
