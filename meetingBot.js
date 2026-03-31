require("dotenv").config();
const { chromium } = require("playwright");
const { startRecording } = require("./audioRecorder");
const { getPlaywrightVideoOptions } = require("./videoRecorder");
const { joinTeams } = require("./platforms/teams");
const { joinMeet } = require("./platforms/meet");

async function startMeetingBot({ url, meetingId }) {

  const browser = await chromium.launch({
    headless: false,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      "--no-sandbox"
    ]
  });

  const { dir: videoDir, size: videoSize } = getPlaywrightVideoOptions(meetingId);

  const context = await browser.newContext({
    permissions: ["microphone", "camera"],
    viewport: videoSize,
    recordVideo: {
      dir: videoDir,
      size: videoSize
    }
  });

  const page = await context.newPage();

  console.log(`Bot entrando a ${url}`);

  await page.goto(url);

  if (url.includes("teams")) {
    await joinTeams(page);
  } else if (url.includes("meet")) {
    await joinMeet(page);
  } else {
    console.log("Plataforma no soportada");
    await browser.close();
    return null;
  }

  console.log(
    `Vídeo: se guardará en "${videoDir}" (archivo .webm al cerrar el navegador o Ctrl+C en la consola).`
  );

  const { ffmpeg, wavPath } = startRecording(meetingId);

  return { browser, ffmpeg, wavPath, meetingId };
}

module.exports = { startMeetingBot };