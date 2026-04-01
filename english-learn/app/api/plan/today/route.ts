import { NextResponse } from "next/server";

import { resolveRequestUserId } from "@/lib/api";
import { todayTasks } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const userId = await resolveRequestUserId(request);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const data = await prisma.dailyPlan.findUnique({
    where: {
      userId_date: {
        userId,
        date: today,
      },
    },
    select: {
      tasks: true,
      estimatedMinutes: true,
    },
  });

  if (data) {
    return NextResponse.json({
      tasks: data.tasks,
      estimated_minutes: data.estimatedMinutes,
      streak_info: { current_streak: 7, best_streak: 21 },
    });
  }

  return NextResponse.json({
    tasks: todayTasks,
    estimated_minutes: todayTasks.reduce((acc, task) => acc + task.estimated_minutes, 0),
    streak_info: { current_streak: 7, best_streak: 21 },
  });
}
