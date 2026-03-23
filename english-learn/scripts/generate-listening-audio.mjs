import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { practiceListeningMaterials } from "../lib/listening-materials.ts";

const projectRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const outputDir = path.join(projectRoot, "public", "audio", "listening");

fs.mkdirSync(outputDir, { recursive: true });

for (const material of practiceListeningMaterials) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "listening-audio-"));
  const tempAiff = path.join(tempDir, `${material.id}.aiff`);
  const finalFile = path.join(outputDir, `${material.id}.m4a`);

  if (!material.audioVoice) {
    throw new Error(`Missing audio voice for ${material.id}`);
  }

  const sayResult = spawnSync(
    "say",
    ["-v", material.audioVoice, "-o", tempAiff, material.transcript],
    { stdio: "inherit" },
  );

  if (sayResult.status !== 0) {
    throw new Error(`Failed to render speech for ${material.id}`);
  }

  const convertResult = spawnSync(
    "afconvert",
    ["-f", "m4af", "-d", "aac", "-b", "64000", tempAiff, finalFile],
    { stdio: "inherit" },
  );

  if (convertResult.status !== 0) {
    throw new Error(`Failed to convert audio for ${material.id}`);
  }

  fs.rmSync(tempDir, { recursive: true, force: true });
  console.log(`Generated ${path.relative(projectRoot, finalFile)}`);
}
