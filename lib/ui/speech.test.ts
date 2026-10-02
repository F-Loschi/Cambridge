import { describe, expect, it } from "vitest";
import { pickEnglishVoice, splitSentences } from "./speech";

describe("splitSentences", () => {
  it("splits on sentence-ending punctuation and keeps it", () => {
    expect(splitSentences("I left. Why did I? Because it was time!")).toEqual([
      "I left.",
      "Why did I?",
      "Because it was time!",
    ]);
  });

  it("keeps text without terminal punctuation as one sentence", () => {
    expect(splitSentences("no punctuation here")).toEqual(["no punctuation here"]);
  });

  it("drops a leading ellipsis so it isn't read aloud", () => {
    expect(splitSentences("...while crossing the river, it proved hard.")).toEqual([
      "while crossing the river, it proved hard.",
    ]);
  });
});

describe("pickEnglishVoice", () => {
  it("returns null when there are no English voices", () => {
    expect(pickEnglishVoice([{ name: "Luciana", lang: "pt-BR" }])).toBeNull();
  });

  it("prefers a natural British voice over a plain US one", () => {
    const voices = [
      { name: "Microsoft David", lang: "en-US" },
      { name: "Microsoft Sonia Online (Natural)", lang: "en-GB" },
      { name: "Luciana", lang: "pt-BR" },
    ];
    expect(pickEnglishVoice(voices)?.name).toBe("Microsoft Sonia Online (Natural)");
  });

  it("falls back to any English voice", () => {
    expect(pickEnglishVoice([{ name: "Alex", lang: "en_US" }])?.name).toBe("Alex");
  });
});
