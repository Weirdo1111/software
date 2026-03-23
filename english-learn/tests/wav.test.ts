import { describe, expect, it } from "vitest";

import { encodeWavFile } from "@/lib/audio/wav";

describe("wav encoder", () => {
  it("writes a valid wav header and payload length", () => {
    const channel = new Float32Array([0, 0.25, -0.25, 0.5]);
    const bytes = encodeWavFile([channel], 16000);
    const riff = new TextDecoder("ascii").decode(bytes.subarray(0, 4));
    const wave = new TextDecoder("ascii").decode(bytes.subarray(8, 12));

    expect(riff).toBe("RIFF");
    expect(wave).toBe("WAVE");
    expect(bytes.length).toBe(44 + channel.length * 2);
  });
});
