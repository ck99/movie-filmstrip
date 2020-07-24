const os = require('os');
const ffmpeg = require('./ffmpeg-docker-provider')('jrottenberg/ffmpeg');
const ffprobe = require('./ffprobe-docker-provider')('sjourdan/ffprobe');

let cliArgs  = process.argv.slice(2);
let workdir = process.cwd();

// https://www.binpress.com/generate-video-previews-ffmpeg/
// https://jsfiddle.net/wx8gLavc/


const HEIGHT = 240;
const COLUMNS = 50;
const MAX_THUMBS = 50;
const ROWS = 1;

const countFrames = video => {
    return ffprobe(
        [
            '-show_streams',
            video
        ],
        workdir
    ).then(result => {
        let nb_frames = result.stdout.split("\n").filter(l => l.indexOf("nb_frames") >= 0)[0].split("=")[1];
        if (nb_frames === "N/A") {
            return ffmpeg(
                [
                    '-nostats',
                    '-i', video,
                    '-vcodec', 'copy',
                    '-f', 'rawvideo',
                    '-y',
                    '/dev/null'
                ],
                workdir
            ).then(results => {
                return parseInt(results.stderr.split("\n").filter(l => l.indexOf("frame") >= 0)[0].split("fps")[0].split("=")[1].trim());
            })
        } else {
            return parseInt(nb_frames);
        }
    })
}

const getDurationInSeconds = video => {
    return ffprobe(
        [
            '-v', 'error',
            '-show_entries', 'format=duration',
            '-of', 'default=noprint_wrappers=1:nokey=1',
            video
        ],
        workdir
    ).then(result => {
        return parseFloat(result.stdout);
    })
}

const extractThumbnails = (video, rows, columns, sampleEveryNthFrame, thumbnailHeight, outputFile) => {
    return ffmpeg(
        [
            '-loglevel', 'panic',
            '-i', video,
            '-y',
            '-frames', 1,
            '-q:v', 1,
            '-vf', `select=not(mod(n\\,${sampleEveryNthFrame})),scale=-1:${thumbnailHeight},tile=${columns}x${rows}`,
            outputFile
        ],
        workdir
    )
}

const getMetadata = video => {
  return ffprobe(
      [
          '-show_streams',
          '-of', 'json',
          video
      ],
      workdir
  ).then(result => {
      return JSON.parse(result.stdout);
  });
};


const makeThumbnailMontage = ((inputFile, outputFile, rows, columns, height) => {
    return numFrames => {
        return extractThumbnails(inputFile, rows, columns, Math.floor(numFrames / (rows * columns)), height, outputFile)
    }
})(cliArgs[0], cliArgs[1], ROWS, COLUMNS, HEIGHT);


const makeThumbnailFilmStrip = ((inputFile, outputFile, height) => {
    return (numFrames, numThumbs) => {
        return extractThumbnails(inputFile, 1, numThumbs, Math.floor(numFrames / numThumbs), height, outputFile)
    }
})(cliArgs[0], cliArgs[1], HEIGHT);

countFrames(cliArgs[0]).then(frameCount => {
    console.error(`FrameCount: ${frameCount}`);
    return getDurationInSeconds(cliArgs[0]).then(durationSeconds => {
        let roundedDuration = Math.ceil(durationSeconds);

        console.error(`Duration: ${roundedDuration} seconds`);
        return Math.min(roundedDuration, MAX_THUMBS);
    }).then(numThumbs => {
        console.error(`numThumbs: ${numThumbs}`);
        return {
            totalFrames: frameCount,
            numberOfThumbnailsToExtract: numThumbs
        }
    })
}).then(data => {
    return makeThumbnailFilmStrip(data.totalFrames, data.numberOfThumbnailsToExtract)
})


// countFrames(cliArgs[0]).then(makeThumbnailMontage)
    .then( () => {
        console.log(`Created preview : ${cliArgs[1]} of ${cliArgs[0]}`);
    })
// getDurationInSeconds(cliArgs[0]).then(console.log)
    .catch(err => console.error(err));

