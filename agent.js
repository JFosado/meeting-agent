require("dotenv").config();
const { startMeetingBot } = require("./meetingBot");
const { transcribeWavFile } = require("./transcriber");

const urls = process.argv.slice(2);

if (urls.length === 0) {
  console.log("Uso: node agent.js <url1> <url2> ...");
  process.exit(1);
}

const sessionPromises = [];
const sessions = [];
let shuttingDown = false;

urls.forEach((url, index) => {
  const meetingId = `meeting${index + 1}`;

  const p = startMeetingBot({
    url,
    meetingId
  }).then((session) => {
    if (session) {
      sessions.push(session);
    }
    return session;
  });
  sessionPromises.push(p);
});

function stopFfmpeg(ffmpeg) {
  return new Promise((resolve) => {
    if (!ffmpeg || ffmpeg.killed) {
      resolve();
      return;
    }
    let finished = false;
    const done = () => {
      if (finished) return;
      finished = true;
      resolve();
    };

    ffmpeg.once("close", done);

    // En Windows, señales tipo SIGTERM a veces no detienen procesos como esperas.
    // ffmpeg soporta 'q' en stdin para salir limpiamente y finalizar el WAV.
    try {
      if (ffmpeg.stdin && !ffmpeg.stdin.destroyed) {
        ffmpeg.stdin.write("q");
      }
    } catch {}

    // Fallback: intentar terminar el proceso.
    try {
      ffmpeg.kill("SIGTERM");
    } catch {}

    setTimeout(done, 20000);
  });
}

async function shutdown() {
  if (shuttingDown) return;
  shuttingDown = true;

  console.log("\n[shutdown] Deteniendo sesiones y generando transcripciones…");

  // Asegurar que ya resolvieron los startMeetingBot() que estaban en vuelo
  try {
    await Promise.allSettled(sessionPromises);
  } catch {}

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
        console.log(`[transcripción] Iniciando (${s.meetingId})…`);
        await transcribeWavFile(s.wavPath, s.meetingId);
      } catch (err) {
        console.error(`[transcripción] Error (${s.meetingId}):`, err.message);
      }
    }
  }

  console.log("[shutdown] Listo.");
  process.exit(0);
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);

process.on("unhandledRejection", (err) => {
  console.error("[unhandledRejection]", err?.message || err);
});