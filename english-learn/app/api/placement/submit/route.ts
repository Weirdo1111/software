import { NextResponse } from "next/server";
import { z } from "zod";

import { jsonError } from "@/lib/api";
import { evaluatePlacement, placementQuestions } from "@/lib/placement";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const submitSchema = z.object({
  test_session_id: z.string().min(1),
  question_ids: z.array(z.string().min(1)).min(1),
  answers: z.array(z.number().int()).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = submitSchema.parse(body);

    if (payload.question_ids.length !== payload.answers.length) {
      return jsonError("Question list and answers must have the same length.", 422);
    }

    const result = evaluatePlacement(payload.answers);
    const supabase = createSupabaseServiceClient();

    if (supabase) {
      const answerRows = payload.question_ids.map((questionId, index) => {
        const question = placementQuestions.find((item) => item.id === questionId);
        return {
          placement_session_id: payload.test_session_id,
          question_id: questionId,
          answer: payload.answers[index] ?? -1,
          is_correct: question ? question.answer === payload.answers[index] : false,
        };
      });

      if (answerRows.length > 0) {
        await supabase.from("placement_answers").insert(answerRows);
      }

      await supabase
        .from("placement_sessions")
        .update({
          cefr_level: result.cefr_level,
          score: result.score,
          skill_breakdown: result.skill_breakdown,
        })
        .eq("id", payload.test_session_id);
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to submit placement", 500);
  }
}
