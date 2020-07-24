const childProcessPromise = require('./child-process-promise');

module.exports = function(ffprobeBinaryPath) {
    return function(ffprobeArgs, workdir) {
        return childProcessPromise.spawn(
            ffprobeBinaryPath,
            ffprobeArgs,
            {env: process.env, cwd: workdir}
        )
    }
};
