import { NextResponse } from "next/server";

import { resolveRequestUserId } from "@/lib/api";
import { summary30d, summary7d } from "@/lib/mock-data";
import { prisma } from "@/lib/prisma";
import type { SkillType } from "@/types/learning";

function getRangeDays(range: "7d" | "30d") {
  return range === "30d" ? 30 : 7;
}

function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function subDays(value: Date, days: number) {
  const next = new Date(value);
  next.setDate(next.getDate() - days);
  return next;
}

function guessSkillFromExerciseId(exerciseId: string): SkillType {
  const value = exerciseId.toLowerCase();
  if (value.includes("listen")) return "listening";
  if (value.includes("speak")) return "speaking";
  if (value.includes("read")) return "reading";
  if (value.includes("writ")) return "writing";
  if (value.includes("gram")) return "grammar";
  return "vocab";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const range = url.searchParams.get("range") === "30d" ? "30d" : "7d";
  const fallback = range === "30d" ? summary30d : summary7d;

  try {
    const userId = await resolveRequestUserId(request);
    const now = startOfDay(new Date());
    const rangeDays = getRangeDays(range);
    const startDate = subDays(now, rangeDays - 1);

    const attempts = await prisma.userAttempt.findMany({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
      select: {
        exerciseId: true,
        durationSec: true,
        correctness: true,
      },
    });

    if (attempts.length === 0) {
      return NextResponse.json(fallback);
    }

    const totalDurationSec = attempts.reduce((sum, item) => sum + Math.max(0, item.durationSec), 0);
    const totalMinutes = Math.max(1, Math.round(totalDurationSec / 60));
    const correctCount = attempts.filter((item) => item.correctness).length;
    const accuracy = Number((correctCount / attempts.length).toFixed(2));
    const lessonsCompleted = correctCount;

    const incorrectBySkill = attempts
      .filter((item) => !item.correctness)
      .reduce<Record<SkillType, number>>(
        (acc, item) => {
          const skill = guessSkillFromExerciseId(item.exerciseId);
          acc[skill] += 1;
          return acc;
        },
        {
          listening: 0,
          speaking: 0,
          reading: 0,
          writing: 0,
          vocab: 0,
          grammar: 0,
        },
      );

    const weakSkills = (Object.entries(incorrectBySkill) as Array<[SkillType, number]>)
      .filter(([, count]) => count > 0)
      .sort((left, right) => right[1] - left[1])
      .slice(0, 2)
      .map(([skill]) => skill);

    return NextResponse.json({
      minutes: totalMinutes,
      lessons_completed: lessonsCompleted,
      accuracy,
      weak_skills: weakSkills.length > 0 ? weakSkills : fallback.weak_skills,
    });
  } catch {
    return NextResponse.json(fallback);
  }

}
