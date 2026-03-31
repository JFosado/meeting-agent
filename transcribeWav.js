/**
 * Transcribe un .wav ya existente (sin ejecutar el bot).
 * Uso: node transcribeWav.js <ruta/al/archivo.wav> [meetingId]
 */
require("dotenv").config();
const { transcribeWavFile } = require("./transcriber");

const wavPath = process.argv[2];
const meetingId = process.argv[3] || "meeting";

if (!wavPath) {
  console.log("Uso: node transcribeWav.js <ruta.wav> [meetingId]");
  process.exit(1);
}

transcribeWavFile(wavPath, meetingId).catch((err) => {
  console.error(err);
  process.exit(1);
});
