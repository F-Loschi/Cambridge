import { describe, expect, it } from "vitest";
import { normalizeLine, parseInline } from "./inlineMarkdown";

describe("parseInline", () => {
  it("returns plain text untouched", () => {
    expect(parseInline("just a sentence")).toEqual([{ type: "text", text: "just a sentence" }]);
  });

  it("parses bold, italic and code around plain text", () => {
    expect(parseInline("Use **since** or *for*, as in `has been`.")).toEqual([
      { type: "text", text: "Use " },
      { type: "bold", text: "since" },
      { type: "text", text: " or " },
      { type: "italic", text: "for" },
      { type: "text", text: ", as in " },
      { type: "code", text: "has been" },
      { type: "text", text: "." },
    ]);
  });

  it("handles several bold spans in one line", () => {
    const segments = parseInline("**had** and **been**");
    expect(segments.filter((s) => s.type === "bold").map((s) => s.text)).toEqual(["had", "been"]);
  });

  it("leaves a lone asterisk and spaced multiplication alone", () => {
    expect(parseInline("5 * 3 = 15")).toEqual([{ type: "text", text: "5 * 3 = 15" }]);
  });
});

describe("normalizeLine", () => {
  it("turns markdown bullets into a bullet character", () => {
    expect(normalizeLine("* first")).toBe("• first");
    expect(normalizeLine("- second")).toBe("• second");
  });

  it("strips heading hashes", () => {
    expect(normalizeLine("## Pontos fortes")).toBe("Pontos fortes");
  });

  it("does not mistake an italic opener for a bullet", () => {
    expect(normalizeLine("*word* is italic")).toBe("*word* is italic");
  });
});
