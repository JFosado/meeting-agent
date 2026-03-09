const { chromium } = require("playwright");
const { startRecording } = require("./audioRecorder");
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

  const context = await browser.newContext({
    permissions: ["microphone", "camera"]
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
    return;
  }

  startRecording(meetingId);
}

module.exports = { startMeetingBot };