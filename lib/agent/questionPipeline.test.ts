import { describe, expect, it } from "vitest";
import { auditQuestion } from "./questionPipeline";

describe("auditQuestion", () => {
  it("approves when answers agree (case/whitespace-insensitive) and format checks pass", () => {
    const result = auditQuestion({
      generatorAnswer: "had been",
      blindSolverAnswer: "  Had Been ",
      formatChecksPassed: true,
    });
    expect(result.status).toBe("approved");
    expect(result.notes).toHaveLength(0);
  });

  it("flags for human review when the blind solver disagrees", () => {
    const result = auditQuestion({
      generatorAnswer: "had been",
      blindSolverAnswer: "have been",
      formatChecksPassed: true,
    });
    expect(result.status).toBe("needs_human_review");
    expect(result.notes.length).toBeGreaterThan(0);
  });

  it("flags for human review when format checks fail even if answers agree", () => {
    const result = auditQuestion({
      generatorAnswer: "x",
      blindSolverAnswer: "x",
      formatChecksPassed: false,
    });
    expect(result.status).toBe("needs_human_review");
  });
});
