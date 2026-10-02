import { describe, expect, it } from "vitest";
import { PART_TYPES } from "@/lib/agent/partTypeCatalog";
import { TOPICS, findTopic, topicExerciseDef, topicExerciseId } from "./topics";

describe("topics", () => {
  it("has unique ids", () => {
    const ids = TOPICS.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers the topics the study section was built around", () => {
    expect(findTopic("collocations")).toBeDefined();
    expect(findTopic("phrasal_verbs")).toBeDefined();
  });

  it("fills every section of each topic", () => {
    for (const topic of TOPICS) {
      expect(topic.concept.length, topic.id).toBeGreaterThanOrEqual(2);
      expect(topic.groups.length, topic.id).toBeGreaterThanOrEqual(2);
      for (const group of topic.groups) expect(group.examples.length, `${topic.id}/${group.title}`).toBeGreaterThan(0);
      expect(topic.howToStudy.length, topic.id).toBeGreaterThanOrEqual(3);
      expect(topic.pitfalls.length, topic.id).toBeGreaterThanOrEqual(3);
      expect(topic.exercise.calibrationExamples.length, topic.id).toBeGreaterThanOrEqual(2);
    }
  });

  it("gives every short-answer topic an explicit word limit", () => {
    for (const topic of TOPICS.filter((t) => t.exercise.kind === "short_answer")) {
      expect(topic.exercise.maxAnswerWords, topic.id).toBeGreaterThan(0);
    }
  });

  it("builds exercise types that never collide with the exam part types", () => {
    const partIds = new Set(PART_TYPES.map((p) => p.id));
    for (const topic of TOPICS) {
      const def = topicExerciseDef(topic);
      expect(def.id).toBe(topicExerciseId(topic.id));
      expect(partIds.has(def.id)).toBe(false);
    }
  });
});
