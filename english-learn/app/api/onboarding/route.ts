import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestUserId, jsonError } from "@/lib/api";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const onboardingSchema = z.object({
  goal: z.enum(["coursework", "research", "seminar"]),
  daily_minutes: z.number().int().min(10).max(60),
  native_language: z.string().min(2).max(8),
  ui_language: z.enum(["zh", "en"]),
});

const taskMap = {
  coursework: [
    { type: "lesson", title: "Academic reading + writing starter" },
    { type: "review", title: "Core coursework vocabulary review" },
  ],
  research: [
    { type: "lesson", title: "Research abstract reading drill" },
    { type: "review", title: "Evidence-tracking vocabulary review" },
  ],
  seminar: [
    { type: "lesson", title: "Seminar speaking starter" },
    { type: "review", title: "Discussion phrase review" },
  ],
} as const;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = onboardingSchema.parse(body);
    const userId = getRequestUserId(request);

    const supabase = createSupabaseServiceClient();

    if (supabase) {
      await supabase.from("profiles").upsert(
        {
          user_id: userId,
          native_language: payload.native_language,
          ui_language: payload.ui_language,
        },
        { onConflict: "user_id" },
      );

      await supabase.from("learning_goals").upsert(
        {
          user_id: userId,
          goal: payload.goal,
          daily_minutes: payload.daily_minutes,
        },
        { onConflict: "user_id" },
      );

      const today = new Date().toISOString().slice(0, 10);
      await supabase.from("daily_plans").upsert(
        {
          user_id: userId,
          date: today,
          tasks: taskMap[payload.goal],
          estimated_minutes: payload.daily_minutes,
        },
        { onConflict: "user_id,date" },
      );
    }

    return NextResponse.json({
      profile_id: userId,
      plan_seeded: true,
      recommended_focus: payload.goal,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to save onboarding profile", 500);
  }
}
