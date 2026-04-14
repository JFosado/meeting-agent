require("dotenv").config();
const fs = require("fs");
const path = require("path");

function textFromAsrResult(result) {
  if (!result) return "";
  if (typeof result.text === "string") return result.text;
  if (Array.isArray(result.chunks)) {
    return result.chunks.map((c) => c.text ?? "").join(" ").trim();
  }
  return String(result);
}

/**
 * Transcribe un WAV a texto.
 * - Si existe OPENAI_API_KEY: usa la API de OpenAI (Whisper), adecuada para audios largos.
 * - Si no: usa Whisper local vía @xenova/transformers (descarga el modelo la primera vez).
 */
async function transcribeWavFile(wavPath, meetingId) {
  const dir = path.dirname(wavPath);
  const outTxt = path.join(dir, `${meetingId}.transcript.txt`);
  const outJson = path.join(dir, `${meetingId}.transcript.json`);

  if (!fs.existsSync(wavPath)) {
    console.warn(`[transcripción] No existe el archivo: ${wavPath}`);
    return;
  }

  const stat = fs.statSync(wavPath);
  if (stat.size < 500) {
    console.warn(
      `[transcripción] El WAV es muy pequeño (${stat.size} bytes); la transcripción puede estar vacía.`
    );
  }

  let text;
  let engine;

  try {
    if (process.env.OPENAI_API_KEY) {
      engine = "openai-whisper";
      const OpenAI = require("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(wavPath),
        model: "whisper-1",
        language: "es"
      });
      text = transcription.text;
    } else {
      engine = "local-xenova";
      // @xenova/transformers es ESM; en proyectos CommonJS hay que usar import() dinámico.
      const { pipeline } = await import("@xenova/transformers");
      const transcriber = await pipeline(
        "automatic-speech-recognition",
        "Xenova/whisper-small",
        { quantized: true }
      );
      const result = await transcriber(wavPath, {
        language: "spanish",
        task: "transcribe",
        chunk_length_s: 30,
        stride_length_s: 5
      });
      text = textFromAsrResult(result);
    }
  } catch (err) {
    console.error(`[transcripción] Falló el motor (${engine || "desconocido"}):`, err.message);
    throw err;
  }

  fs.writeFileSync(outTxt, text, "utf8");
  fs.writeFileSync(
    outJson,
    JSON.stringify(
      {
        meetingId,
        wavPath,
        engine,
        transcribedAt: new Date().toISOString(),
        text
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(`[transcripción] Guardado: ${outTxt} (${engine})`);
}

module.exports = { transcribeWavFile };
