import { NextResponse } from "next/server";
import { z } from "zod";

import { getRequestUserId, jsonError } from "@/lib/api";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

const classSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: z.enum(["lecture", "seminar", "lab"]),
  day: z.number().int().min(0).max(6),
  slot: z.enum(["01-02", "03-04", "05-06", "07-08", "09-10"]),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

const deadlineSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  skill: z.enum(["listening", "speaking", "reading", "writing"]),
});

const blockSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["anchor", "support", "memory", "custom"]),
  title: z.string().min(1),
  skill: z.enum(["listening", "speaking", "reading", "writing", "review"]),
  minutes: z.number().int().min(5).max(90),
  reason: z.string().min(1),
});

const planOverrideSchema = z.object({
  day: z.number().int().min(0).max(6),
  blocks: z.array(blockSchema),
});

const preferencesSchema = z.object({
  version: z.literal(1),
  goal: z.enum(["coursework", "research", "seminar"]),
  dailyMinutes: z.number().int().min(20).max(50),
  mode: z.enum(["light", "standard", "intensive"]),
  studyWindow: z.enum(["early", "midday", "evening"]),
  classes: z.array(classSchema),
  deadlines: z.array(deadlineSchema),
  planWeekStartISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  planOverrides: z.array(planOverrideSchema),
  updatedAt: z.string(),
});

function addDays(value: string, amount: number) {
  const next = new Date(`${value}T00:00:00`);
  next.setDate(next.getDate() + amount);
  return next.toISOString().slice(0, 10);
}

function getCurrentWeekStartISO() {
  const next = new Date();
  next.setHours(0, 0, 0, 0);
  const weekday = next.getDay();
  const diff = weekday === 0 ? -6 : 1 - weekday;
  next.setDate(next.getDate() + diff);
  return next.toISOString().slice(0, 10);
}

function mapPlanRows(
  userId: string,
  weekStartISO: string,
  planOverrides: z.infer<typeof planOverrideSchema>[],
) {
  return planOverrides.map((item) => ({
    user_id: userId,
    date: addDays(weekStartISO, item.day),
    tasks: item.blocks,
    estimated_minutes: item.blocks.reduce((sum, block) => sum + block.minutes, 0),
  }));
}

export async function GET(request: Request) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ preferences: null });
  }

  const userId = getRequestUserId(request);

  try {
    const [{ data: goalRow }, { data: scheduleRow }] = await Promise.all([
      supabase
        .from("learning_goals")
        .select("goal, daily_minutes, schedule_mode, study_window, updated_at")
        .eq("user_id", userId)
        .maybeSingle(),
      supabase
        .from("schedule_profiles")
        .select("classes, deadlines, plan_week_start, plan_overrides, updated_at")
        .eq("user_id", userId)
        .maybeSingle(),
    ]);

    if (!goalRow && !scheduleRow) {
      return NextResponse.json({ preferences: null });
    }

    return NextResponse.json({
      preferences: {
        version: 1,
        goal: goalRow?.goal ?? "coursework",
        dailyMinutes: goalRow?.daily_minutes ?? 35,
        mode: goalRow?.schedule_mode ?? "standard",
        studyWindow: goalRow?.study_window ?? "evening",
        classes: Array.isArray(scheduleRow?.classes) ? scheduleRow.classes : [],
        deadlines: Array.isArray(scheduleRow?.deadlines) ? scheduleRow.deadlines : [],
        planWeekStartISO: scheduleRow?.plan_week_start ?? null,
        planOverrides: Array.isArray(scheduleRow?.plan_overrides) ? scheduleRow.plan_overrides : [],
        updatedAt:
          scheduleRow?.updated_at ??
          goalRow?.updated_at ??
          new Date().toISOString(),
      },
    });
  } catch {
    return NextResponse.json({ preferences: null });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const payload = preferencesSchema.parse(body.preferences ?? body);
    const userId = getRequestUserId(request);
    const supabase = createSupabaseServiceClient();

    if (!supabase) {
      return NextResponse.json({ saved: false, fallback: true });
    }

    await supabase.from("learning_goals").upsert(
      {
        user_id: userId,
        goal: payload.goal,
        daily_minutes: payload.dailyMinutes,
        schedule_mode: payload.mode,
        study_window: payload.studyWindow,
        updated_at: payload.updatedAt,
      },
      { onConflict: "user_id" },
    );

    await supabase.from("schedule_profiles").upsert(
      {
        user_id: userId,
        classes: payload.classes,
        deadlines: payload.deadlines,
        plan_week_start: payload.planWeekStartISO,
        plan_overrides: payload.planOverrides,
        updated_at: payload.updatedAt,
      },
      { onConflict: "user_id" },
    );

    const targetWeekStart = payload.planWeekStartISO ?? getCurrentWeekStartISO();
    const targetWeekEnd = addDays(targetWeekStart, 6);

    await supabase
      .from("daily_plans")
      .delete()
      .eq("user_id", userId)
      .gte("date", targetWeekStart)
      .lte("date", targetWeekEnd);

    if (payload.planOverrides.length > 0) {
      await supabase.from("daily_plans").upsert(
        mapPlanRows(userId, targetWeekStart, payload.planOverrides),
        { onConflict: "user_id,date" },
      );
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to save schedule preferences", 500);
  }
}
