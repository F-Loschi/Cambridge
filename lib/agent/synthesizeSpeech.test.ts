import { describe, expect, it } from "vitest";
import { toWav } from "./synthesizeSpeech";

describe("toWav", () => {
  it("passes through audio that is already WAV", () => {
    const wav = Buffer.from("RIFF....WAVEfmt ");
    expect(toWav(wav, "audio/wav")).toBe(wav);
  });

  it("wraps raw PCM using the sample rate from the mime type", () => {
    const pcm = Buffer.from([1, 0, 2, 0]);
    const out = toWav(pcm, "audio/L16;codec=pcm;rate=16000");
    expect(out.toString("ascii", 0, 4)).toBe("RIFF");
    expect(out.readUInt32LE(24)).toBe(16000);
    expect(out.subarray(44).equals(pcm)).toBe(true);
  });

  it("defaults to 24 kHz when the mime type has no rate", () => {
    const out = toWav(Buffer.from([0, 0]), undefined);
    expect(out.readUInt32LE(24)).toBe(24000);
  });
});
