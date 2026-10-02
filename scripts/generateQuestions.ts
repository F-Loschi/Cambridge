/**
 * Bulk-seed the question bank by running the real pipeline (generator ->
 * blind solver -> auditor) N times per part type, outside the browser.
 * Reuses the exact same lib/agent modules the /admin/generate UI calls —
 * no reimplemented logic to drift out of sync.
 *
 * Usage: npm run generate-questions -- [countPerPartType] [partTypeId]
 *   npm run generate-questions -- 3            # 3 of every part type
 *   npm run generate-questions -- 5 uoe_part2_open_cloze
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvLocal() {
  const path = resolve(process.cwd(), ".env.local");
  let content: string;
  try {
    content = readFileSync(path, "utf8");
  } catch {
    return;
  }
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadEnvLocal();

import { AGENT_MODEL } from "../lib/agent/client";
import { PART_TYPES, findPartType } from "../lib/agent/partTypeCatalog";
import { auditQuestion, blindSolve, generateQuestion } from "../lib/agent/questionPipeline";
import { checkQuestionFormat } from "../lib/agent/questionFormat";
import { createAdminClient } from "../lib/supabase/admin";

async function generateOne(partType: (typeof PART_TYPES)[number]) {
  const generated = await generateQuestion({
    skill: partType.skill,
    partType: partType.id,
    kind: partType.kind,
    calibrationExamples: partType.calibrationExamples,
  });

  const blind = await blindSolve({
    skill: partType.skill,
    partType: partType.id,
    content: generated.content,
  });

  const formatOk = checkQuestionFormat(partType, generated);
  const audit = auditQuestion({
    generatorAnswer: generated.correctAnswer,
    blindSolverAnswer: blind.answer,
    formatChecksPassed: formatOk,
  });

  const supabase = createAdminClient();
  const { error } = await supabase.from("question_bank").insert({
    skill: partType.skill,
    part_type: partType.id,
    content: generated.content,
    correct_answer: generated.correctAnswer,
    explanation: generated.explanation,
    difficulty_estimate: generated.difficultyEstimate,
    status: audit.status,
    generator_model: AGENT_MODEL,
    blind_solver_answer: blind.answer,
    audit_notes: { notes: audit.notes },
  });

  if (error) throw new Error(error.message);
  return audit.status;
}

async function main() {
  const countPerType = Number(process.argv[2] ?? 3);
  const onlyPartTypeId = process.argv[3];
  const partTypes = onlyPartTypeId
    ? [findPartType(onlyPartTypeId)].filter((p): p is NonNullable<typeof p> => p != null)
    : PART_TYPES;

  if (onlyPartTypeId && partTypes.length === 0) {
    console.error(`Unknown part_type: ${onlyPartTypeId}`);
    process.exit(1);
  }

  let approved = 0;
  let needsReview = 0;
  let failed = 0;

  for (const partType of partTypes) {
    for (let i = 0; i < countPerType; i++) {
      process.stdout.write(`${partType.id} (${i + 1}/${countPerType})... `);
      try {
        const status = await generateOne(partType);
        if (status === "approved") approved++;
        else needsReview++;
        console.log(status);
      } catch (err) {
        failed++;
        console.log("FAILED —", err instanceof Error ? err.message : err);
      }
      // Free tier allows 15 requests/min per model and each question costs
      // 2 (generate + blind solve), so stay under ~7 questions a minute.
      await new Promise((r) => setTimeout(r, 9000));
    }
  }

  console.log(`\nDone. approved=${approved} needsReview=${needsReview} failed=${failed}`);
}

main();
