const path = require("path");
const fs = require("fs");

const recordingsRoot = path.join(__dirname, "recordings");

function ensureMeetingDir(meetingId) {
  const dir = path.join(recordingsRoot, meetingId);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Opciones de recordVideo de Playwright: una carpeta y resolución por reunión. */
function getPlaywrightVideoOptions(meetingId) {
  const dir = ensureMeetingDir(meetingId);
  const size = { width: 1280, height: 720 };
  return { dir, size };
}

module.exports = { ensureMeetingDir, getPlaywrightVideoOptions, recordingsRoot };
