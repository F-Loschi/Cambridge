// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { urlBase64ToUint8Array } from "./pushKey";

describe("urlBase64ToUint8Array", () => {
  it("decodes a base64url string with no padding needed", () => {
    // "hello" -> base64 "aGVsbG8=" -> base64url "aGVsbG8" (no padding)
    const result = urlBase64ToUint8Array("aGVsbG8");
    expect([...result]).toEqual([104, 101, 108, 108, 111]);
  });

  it("decodes a base64url string that needs padding restored", () => {
    // "hi" -> base64 "aGk=" -> base64url "aGk"
    const result = urlBase64ToUint8Array("aGk");
    expect([...result]).toEqual([104, 105]);
  });

  it("converts - and _ back to + and /", () => {
    // bytes [251, 255, 191] -> base64 "+/+/" -> base64url "-_-_"
    const result = urlBase64ToUint8Array("-_-_");
    expect([...result]).toEqual([251, 255, 191]);
  });
});
