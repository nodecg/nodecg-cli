'use strict';

var fs = require('fs');
var path = require('path');

module.exports.pathContainsNodeCG = function(ncgPath) {
    var pjsonPath = path.join(ncgPath, 'package.json');
    if (fs.existsSync(pjsonPath)) {
        var pjson = require(pjsonPath);

        return pjson.name.toLowerCase() === 'nodecg';
    } else {
        return false;
    }
};
