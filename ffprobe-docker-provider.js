const childProcessPromise = require('./child-process-promise');

module.exports = function(ffprobeDockerImage) {
    return function(ffprobeArgs, workdir) {
        return childProcessPromise.spawn(
            "docker",
            ("run --rm -v "+workdir+":/ffprobeworkdir -w /ffprobeworkdir " + ffprobeDockerImage).split(" ").concat(ffprobeArgs),
            {env: process.env, cwd: workdir}
        )
    }
};
