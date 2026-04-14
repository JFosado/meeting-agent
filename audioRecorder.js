const path = require("path");
const { spawn } = require("child_process");
const { ensureMeetingDir } = require("./videoRecorder");

function startRecording(meetingId) {

  const dir = ensureMeetingDir(meetingId);
  const device = `${meetingId}.monitor`;
  const file = path.join(dir, `${meetingId}.wav`);

  console.log(`Grabando audio de ${meetingId} en ${file}`);

  const ffmpeg = spawn(
    "ffmpeg",
    [
      "-f",
      "pulse",
      "-i",
      device,
      "-ac",
      "1",
      "-ar",
      "16000",
      file
    ],
    { stdio: ["pipe", "ignore", "pipe"] }
  );

  ffmpeg.stderr.on("data", (data) => {
    console.log(data.toString());
  });

  ffmpeg.on("error", (err) => {
    console.error(`[ffmpeg ${meetingId}]`, err.message);
  });

  return { ffmpeg, wavPath: file };
}

module.exports = { startRecording };