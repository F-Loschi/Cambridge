import { describe, expect, it } from "vitest";
import { PART_TYPES } from "@/lib/agent/partTypeCatalog";
import { LESSONS, findLesson } from "./lessons";

describe("lessons", () => {
  it("has a lesson for every part type in the catalog", () => {
    for (const partType of PART_TYPES) {
      expect(findLesson(partType.id), partType.id).toBeDefined();
    }
  });

  it("has no lesson for a part type that doesn't exist", () => {
    const ids = new Set(PART_TYPES.map((p) => p.id));
    for (const lesson of LESSONS) {
      expect(ids.has(lesson.partTypeId), lesson.partTypeId).toBe(true);
    }
  });

  it("fills every section of each lesson", () => {
    for (const lesson of LESSONS) {
      expect(lesson.steps.length, lesson.partTypeId).toBeGreaterThanOrEqual(3);
      expect(lesson.pitfalls.length, lesson.partTypeId).toBeGreaterThanOrEqual(2);
      expect(lesson.example.answer, lesson.partTypeId).not.toBe("");
      expect(lesson.example.explanation, lesson.partTypeId).not.toBe("");
    }
  });
});
