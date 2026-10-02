import { describe, expect, it } from "vitest";
import { pcmToWav } from "./wav";

describe("pcmToWav", () => {
  const pcm = Buffer.from([1, 0, 2, 0, 3, 0, 4, 0]);
  const wav = pcmToWav(pcm, 24000);

  it("prefixes a 44-byte RIFF/WAVE header", () => {
    expect(wav.length).toBe(44 + pcm.length);
    expect(wav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(wav.toString("ascii", 8, 12)).toBe("WAVE");
    expect(wav.toString("ascii", 36, 40)).toBe("data");
  });

  it("encodes sizes, sample rate and format correctly", () => {
    expect(wav.readUInt32LE(4)).toBe(36 + pcm.length);
    expect(wav.readUInt16LE(20)).toBe(1); // PCM
    expect(wav.readUInt16LE(22)).toBe(1); // mono
    expect(wav.readUInt32LE(24)).toBe(24000);
    expect(wav.readUInt32LE(28)).toBe(48000); // byte rate
    expect(wav.readUInt16LE(34)).toBe(16);
    expect(wav.readUInt32LE(40)).toBe(pcm.length);
  });

  it("keeps the PCM payload unchanged after the header", () => {
    expect(wav.subarray(44).equals(pcm)).toBe(true);
  });
});
