import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { jsonError, resolveRequestUserId } from "@/lib/api";
import { prisma } from "@/lib/prisma";

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
    const userId = await resolveRequestUserId(request);

    await prisma.userProfile.upsert({
      where: { userId },
      update: {
        nativeLanguage: payload.native_language,
        uiLanguage: payload.ui_language,
      },
      create: {
        userId,
        nativeLanguage: payload.native_language,
        uiLanguage: payload.ui_language,
      },
    });

    await prisma.learningGoal.upsert({
      where: { userId },
      update: {
        goal: payload.goal,
        dailyMinutes: payload.daily_minutes,
      },
      create: {
        userId,
        goal: payload.goal,
        dailyMinutes: payload.daily_minutes,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.dailyPlan.upsert({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
      update: {
        tasks: taskMap[payload.goal] as Prisma.InputJsonValue,
        estimatedMinutes: payload.daily_minutes,
      },
      create: {
        userId,
        date: today,
        tasks: taskMap[payload.goal] as Prisma.InputJsonValue,
        estimatedMinutes: payload.daily_minutes,
      },
    });

    return NextResponse.json({
      profile_id: userId.toString(),
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
