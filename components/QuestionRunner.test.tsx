// @vitest-environment jsdom
import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { QuestionRunner, type RunnerQuestion } from "./QuestionRunner";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
}));

const questions: RunnerQuestion[] = [
  {
    id: "q1",
    skill: "speaking",
    part_type: "smoke_test",
    content: { prompt: "Describe your favourite hobby." },
    correct_answer: "open",
  },
  {
    id: "q2",
    skill: "speaking",
    part_type: "smoke_test",
    content: { prompt: "What did you do last weekend?" },
    correct_answer: "open",
  },
];

describe("QuestionRunner mock-mode timeout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    push.mockClear();
    refresh.mockClear();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("auto-submits every remaining question as skipped once the clock hits zero", async () => {
    render(
      <QuestionRunner
        questions={questions}
        submitUrl="/api/attempts/submit"
        onFinishHref="/practice"
        source="mock_test"
        timeLimitSeconds={2}
      />,
    );

    // Nothing answered yet, no fetch should have fired before time is up.
    expect(fetch).not.toHaveBeenCalled();

    // Advance one second at a time so React gets a render/effect cycle
    // between ticks (the interval is torn down and recreated every tick).
    for (let i = 0; i < 3; i++) {
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1000);
      });
    }

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/attempts/submit");

    const body = JSON.parse((init as RequestInit).body as string) as {
      source: string;
      items: { question_id: string; correct: boolean }[];
    };
    expect(body.source).toBe("mock_test");
    expect(body.items).toHaveLength(2);
    expect(body.items.map((i) => i.question_id)).toEqual(["q1", "q2"]);
    expect(body.items.every((i) => i.correct === false)).toBe(true);

    expect(push).toHaveBeenCalledWith("/practice");
  });
});
