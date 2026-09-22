import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { reconcileGamification } from "@/lib/server/gamification";
import { updateReviewItems } from "@/lib/server/reviewQueue";

interface SubmittedItem {
  question_id: string;
  correct: boolean;
}

// Review-queue sessions don't create attempts/attempt_items — they're
// reinforcement of already-graded questions, not a fresh scored attempt.
// Only the review_items schedule (and the daily streak) update here.
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = (await request.json()) as { items: SubmittedItem[] };
  if (!items?.length) {
    return NextResponse.json({ error: "No items" }, { status: 400 });
  }

  await updateReviewItems(supabase, user.id, items);
  await reconcileGamification(supabase, user.id, items.length);

  return NextResponse.json({ ok: true });
}
