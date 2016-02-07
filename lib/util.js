'use strict';

var fs = require('fs');
var path = require('path');

module.exports = {
    pathContainsNodeCG: function(pathToCheck) {
        var pjsonPath = path.join(pathToCheck, 'package.json');
        if (fs.existsSync(pjsonPath)) {
            var pjson = require(pjsonPath);
            return pjson.name.toLowerCase() === 'nodecg';
        } else {
            return false;
        }
    },

    getNodeCGPath: function() {
        var curr = process.cwd();
        do {
            if (this.pathContainsNodeCG(curr)) {
                return curr;
            }

            var nextCurr = path.resolve(curr, '..');
            if (nextCurr === curr) {
                throw new Error('NodeCG installation could not be found in this directory or any parent directory.');
            }
            curr = nextCurr;
        } while (fs.lstatSync(curr).isDirectory());

    },

    isBundleFolder: function(pathToCheck) {
        var pjsonPath = path.join(pathToCheck, 'package.json');
        if (fs.existsSync(pjsonPath)) {
            var pjson = require(pjsonPath);
            return typeof pjson.nodecg === 'object';
        } else {
            return false;
        }
    }
};
