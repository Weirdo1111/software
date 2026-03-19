import { NextResponse } from "next/server";

import { getPlacementQuestionSet } from "@/lib/placement";

export async function POST() {
  const questions = getPlacementQuestionSet(20).map((question) => ({
    id: question.id,
    skill: question.skill,
    level: question.level,
    prompt: question.prompt,
    options: question.options,
  }));

  return NextResponse.json({
    test_session_id: crypto.randomUUID(),
    questions,
  });
}
