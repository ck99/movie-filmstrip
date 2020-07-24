const childProcessPromise = require('./child-process-promise');

module.exports = function(ffmpegDockerImage) {
    return function(ffmpegArgs, workdir) {
        return childProcessPromise.spawn(
            "docker",
            ("run --rm -v "+workdir+":/ffmpegworkdir -w /ffmpegworkdir " + ffmpegDockerImage).split(" ").concat(ffmpegArgs),
            {env: process.env, cwd: workdir}
        )
    }
};
