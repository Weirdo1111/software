import { NextResponse } from "next/server";

import { getRequestUserId, jsonError } from "@/lib/api";
import { getPlacementQuestionSet } from "@/lib/placement";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const sessionId = crypto.randomUUID();
    const questions = getPlacementQuestionSet().map((question) => ({
      id: question.id,
      type: question.type,
      skill: question.skill,
      level: question.level,
      context: question.context,
      prompt: question.prompt,
      options: question.options,
    }));

    const supabase = createSupabaseServiceClient();
    if (supabase) {
      await supabase.from("placement_sessions").insert({
        id: sessionId,
        user_id: getRequestUserId(request),
      });
    }

    return NextResponse.json({
      test_session_id: sessionId,
      questions,
    });
  } catch {
    return jsonError("Failed to start placement test", 500);
  }
}
