var spawn = require('child_process').spawn;

var exports = module.exports;

exports.clone = function(repo, targetPath, cb) {
    var args = ['clone'];
    args.push('--');
    args.push(repo);
    args.push(targetPath);
    spawnGit(args, cb);
};

function spawnGit(args, cb) {
    var gitProc = spawn('git', args);

    gitProc.stdout.on('data', function(data) {
        console.log(data.toString());
    });

    gitProc.stderr.on('data', function(data) {
        console.log(data.toString());
    });

    gitProc.on('close', function(status) {
        if (status == 0) {
            console.log('Clone successful!');
            cb && cb();
        } else {
            cb && cb(new Error("git operation failed with status " + status));
        }
    });

    gitProc.on('error', cb);
}