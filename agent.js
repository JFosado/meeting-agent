require("dotenv").config();
const { startMeetingBot } = require("./meetingBot");
const { transcribeWavFile } = require("./transcriber");

const urls = process.argv.slice(2);

if (urls.length === 0) {
  console.log("Uso: node agent.js <url1> <url2> ...");
  process.exit(1);
}

const sessions = [];

urls.forEach((url, index) => {
  const meetingId = `meeting${index + 1}`;

  startMeetingBot({
    url,
    meetingId
  }).then((session) => {
    if (session) {
      sessions.push(session);
    }
  });
});

function stopFfmpeg(ffmpeg) {
  return new Promise((resolve) => {
    if (!ffmpeg || ffmpeg.killed) {
      resolve();
      return;
    }
    const done = () => resolve();
    ffmpeg.once("close", done);
    ffmpeg.kill("SIGTERM");
    setTimeout(done, 12000);
  });
}

async function shutdown() {
  for (const s of sessions) {
    if (s.browser) {
      await s.browser.close().catch(() => {});
    }
  }

  for (const s of sessions) {
    await stopFfmpeg(s.ffmpeg);
  }

  for (const s of sessions) {
    if (s.wavPath && s.meetingId) {
      try {
        await transcribeWavFile(s.wavPath, s.meetingId);
      } catch (err) {
        console.error(`[transcripción] Error (${s.meetingId}):`, err.message);
      }
    }
  }

  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);