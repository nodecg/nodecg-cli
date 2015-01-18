var spawn = require('child_process').spawn;

var exports = module.exports;

exports.clone = function(repo, targetPath, cb) {
    var args = ['clone'];
    args.push('--');
    args.push(repo);
    args.push(targetPath);
    spawnGit(args, cb);
};

exports.pull = function(cb) {
    var args = ['pull'];
    spawnGit(args, cb);
};

function spawnGit(args, cb) {
    var gitProc = spawn('git', args);

    gitProc.stdout.on('data', function onStdout(data) {
        console.log(data.toString());
    });

    gitProc.stderr.on('data', function onStderr(data) {
        console.log(data.toString());
    });

    gitProc.on('close', function onClose(status) {
        if (status == 0) {
            cb && cb();
        } else {
            cb && cb(new Error("git operation failed with status " + status));
        }
    });

    gitProc.on('error', function onError(err) {
        cb && cb();
    });
}