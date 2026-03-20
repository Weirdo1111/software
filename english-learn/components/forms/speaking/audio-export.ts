import { encodeWavFile } from "@/lib/audio/wav";

// Date: 2026/3/18
// Author: Tianbo Cao
// Converts recorded browser audio into base64 WAV so the speaking UI can send a Doubao-compatible file to ASR.
export async function exportAudioBlobAsWavBase64(blob: Blob) {
  const AudioContextClass =
    window.AudioContext ||
    (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error("Audio conversion is not supported in this browser.");
  }

  const audioContext = new AudioContextClass();

  try {
    const sourceBuffer = await blob.arrayBuffer();
    const decodedBuffer = await audioContext.decodeAudioData(sourceBuffer.slice(0));
    const channels = Array.from({ length: decodedBuffer.numberOfChannels }, (_, index) =>
      decodedBuffer.getChannelData(index),
    );
    const wavBytes = encodeWavFile(channels, decodedBuffer.sampleRate);

    return {
      audioBase64: bytesToBase64(wavBytes),
      mimeType: "audio/wav",
    };
  } catch {
    throw new Error("The latest take could not be converted into a transcript-ready audio file.");
  } finally {
    await audioContext.close().catch(() => {});
  }
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}
