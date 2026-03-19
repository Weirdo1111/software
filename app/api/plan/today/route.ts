import { NextResponse } from "next/server";

import { getRequestUserId } from "@/lib/api";
import { todayTasks } from "@/lib/mock-data";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const userId = getRequestUserId(request);
  const today = new Date().toISOString().slice(0, 10);

  const supabase = createSupabaseServiceClient();

  if (supabase) {
    const { data } = await supabase
      .from("daily_plans")
      .select("tasks, estimated_minutes")
      .eq("user_id", userId)
      .eq("date", today)
      .maybeSingle();

    if (data) {
      return NextResponse.json({
        tasks: data.tasks,
        estimated_minutes: data.estimated_minutes,
        streak_info: { current_streak: 7, best_streak: 21 },
      });
    }
  }

  return NextResponse.json({
    tasks: todayTasks,
    estimated_minutes: todayTasks.reduce((acc, task) => acc + task.estimated_minutes, 0),
    streak_info: { current_streak: 7, best_streak: 21 },
  });
}
