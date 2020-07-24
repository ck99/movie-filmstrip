const childProcessPromise = require('./child-process-promise');

module.exports = function(ffmpegBinaryPath) {
    return function(ffmpegArgs, workdir) {
        return childProcessPromise.spawn(
            ffmpegBinaryPath,
            ffmpegArgs,
            {env: process.env, cwd: workdir}
        )
    }
};
