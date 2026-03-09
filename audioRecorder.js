const { spawn } = require("child_process");

function startRecording(meetingId) {

  const device = `${meetingId}.monitor`;
  const file = `${meetingId}.wav`;

  console.log(`Grabando ${meetingId}`);

  const ffmpeg = spawn("ffmpeg", [
    "-f",
    "pulse",
    "-i",
    device,
    "-ac",
    "1",
    "-ar",
    "16000",
    file
  ]);

  ffmpeg.stderr.on("data", (data) => {
    console.log(data.toString());
  });
}

module.exports = { startRecording };