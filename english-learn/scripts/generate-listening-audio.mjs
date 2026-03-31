import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const {
  getListeningStudyText,
  listeningMaterials,
  practiceListeningMaterials,
} = await import("../lib/listening-materials.ts");

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");

const defaultVoiceByAccent = {
  british: "Daniel (英语（英国）)",
  american: "Eddy (英语（美国）)",
  indian: "Aman (英语（印度）)",
  global: "Karen",
};

function ensureParentDirectory(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function renderSpeechToFile({ filePath, text, voice }) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "listening-audio-"));
  const tempAiff = path.join(tempDir, `${path.basename(filePath, path.extname(filePath))}.aiff`);

  const sayResult = spawnSync("say", ["-v", voice, "-o", tempAiff, text], { stdio: "inherit" });

  if (sayResult.status !== 0) {
    throw new Error(`Failed to render speech for ${filePath}`);
  }

  ensureParentDirectory(filePath);

  const convertResult = spawnSync(
    "afconvert",
    ["-f", "m4af", "-d", "aac", "-b", "64000", tempAiff, filePath],
    { stdio: "inherit" },
  );

  fs.rmSync(tempDir, { recursive: true, force: true });

  if (convertResult.status !== 0) {
    throw new Error(`Failed to convert audio for ${filePath}`);
  }

  console.log(`Generated ${path.relative(projectRoot, filePath)}`);
}

const materialsToRender = [
  ...practiceListeningMaterials,
  ...listeningMaterials.filter(
    (material) =>
      typeof material.audioSrc === "string" &&
      material.audioSrc.startsWith("/audio/listening/"),
  ),
];

for (const material of materialsToRender) {
  if (typeof material.audioSrc !== "string" || material.audioSrc.length === 0) {
    continue;
  }

  const transcript = getListeningStudyText(material).trim();

  if (transcript.length === 0) {
    throw new Error(`Missing transcript or study text for ${material.id}`);
  }

  const finalFile = path.join(projectRoot, "public", material.audioSrc.replace(/^\//, ""));
  const voice =
    material.audioVoice ??
    defaultVoiceByAccent[material.accent] ??
    defaultVoiceByAccent.global;

  renderSpeechToFile({
    filePath: finalFile,
    text: transcript,
    voice,
  });
}
