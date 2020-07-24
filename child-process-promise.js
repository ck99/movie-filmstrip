/*global module, require, console, Promise */
'use strict';
const childProcess = require('child_process'),
    spawnPromise = function (command, argsarray, envOptions) {
        return new Promise((resolve, reject) => {
            console.error('executing', command, argsarray.join(' '));
            const childProc = childProcess.spawn(command, argsarray, envOptions || {env: process.env, cwd: process.cwd()}),
                stdOutBuffer = [], stdErrBuffer = [];
            childProc.stdout.on('data', buffer => {
                stdOutBuffer.push(buffer);
            });
            childProc.stderr.on('data', buffer => {
                stdErrBuffer.push(buffer);
            });
            childProc.on('exit', (code, signal) => {
                let result = {
                    code: code || signal,
                    stdout: Buffer.concat(stdOutBuffer).toString().trim(),
                    stderr: Buffer.concat(stdErrBuffer).toString().trim()
                }
                if (code || signal) {
                    reject(result);
                } else {
                    resolve(result);
                }
            });
        });
    };
module.exports = {
    spawn: spawnPromise
};