import { NextResponse } from "next/server";

import { resolveRequestUserId } from "@/lib/api";
import { prisma } from "@/lib/prisma";

function buildFallbackTasks(goal: string, dailyMinutes: number) {
  const baseMinutes = Math.max(20, Math.min(90, dailyMinutes || 30));
  const chunk = Math.max(10, Math.round(baseMinutes / 3));

  if (goal === "research") {
    return [
      {
        id: "auto-research-reading",
        title: "Research abstract reading",
        type: "lesson",
        estimated_minutes: chunk,
        skill: "reading",
        completed: false,
      },
      {
        id: "auto-research-writing",
        title: "Evidence-based paragraph writing",
        type: "writing",
        estimated_minutes: chunk,
        skill: "writing",
        completed: false,
      },
      {
        id: "auto-research-review",
        title: "Academic vocabulary review",
        type: "review",
        estimated_minutes: baseMinutes - chunk * 2,
        skill: "vocab",
        completed: false,
      },
    ];
  }

  if (goal === "seminar") {
    return [
      {
        id: "auto-seminar-speaking",
        title: "Seminar speaking rehearsal",
        type: "speaking",
        estimated_minutes: chunk,
        skill: "speaking",
        completed: false,
      },
      {
        id: "auto-seminar-listening",
        title: "Lecture listening notes",
        type: "lesson",
        estimated_minutes: chunk,
        skill: "listening",
        completed: false,
      },
      {
        id: "auto-seminar-review",
        title: "Discussion phrase review",
        type: "review",
        estimated_minutes: baseMinutes - chunk * 2,
        skill: "vocab",
        completed: false,
      },
    ];
  }

  return [
    {
      id: "auto-coursework-reading",
      title: "Course reading comprehension",
      type: "lesson",
      estimated_minutes: chunk,
      skill: "reading",
      completed: false,
    },
    {
      id: "auto-coursework-writing",
      title: "Course summary writing",
      type: "writing",
      estimated_minutes: chunk,
      skill: "writing",
      completed: false,
    },
    {
      id: "auto-coursework-review",
      title: "Core vocabulary review",
      type: "review",
      estimated_minutes: baseMinutes - chunk * 2,
      skill: "vocab",
      completed: false,
    },
  ];
}

export async function GET(request: Request) {
  const userId = await resolveRequestUserId(request);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [data, goal] = await Promise.all([
    prisma.dailyPlan.findUnique({
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
    }),
    prisma.learningGoal.findUnique({
      where: {
        userId,
      },
      select: {
        goal: true,
        dailyMinutes: true,
      },
    }),
  ]);

  if (data) {
    return NextResponse.json({
      tasks: data.tasks,
      estimated_minutes: data.estimatedMinutes,
      streak_info: { current_streak: 7, best_streak: 21 },
    });
  }

  const fallbackTasks = buildFallbackTasks(goal?.goal ?? "coursework", goal?.dailyMinutes ?? 30);

  return NextResponse.json({
    tasks: fallbackTasks,
    estimated_minutes: fallbackTasks.reduce((acc, task) => acc + task.estimated_minutes, 0),
    streak_info: { current_streak: 7, best_streak: 21 },
  });
}
