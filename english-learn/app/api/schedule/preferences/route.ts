import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";

import { jsonError, resolveRequestUserId } from "@/lib/api";
import { prisma } from "@/lib/prisma";

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
  timeLabel: z.string().regex(/^$|^\d{2}:\d{2}$/).default(""),
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

function toDateOnly(value: string) {
  const next = new Date(`${value}T00:00:00`);
  next.setHours(0, 0, 0, 0);
  return next;
}

function toJsonArrayOrEmpty<T>(value: Prisma.JsonValue | null | undefined) {
  return Array.isArray(value) ? (value as T[]) : [];
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
  userId: bigint,
  weekStartISO: string,
  planOverrides: z.infer<typeof planOverrideSchema>[],
) {
  return planOverrides.map((item) => ({
    userId,
    date: toDateOnly(addDays(weekStartISO, item.day)),
    tasks: item.blocks as Prisma.InputJsonValue,
    estimatedMinutes: item.blocks.reduce((sum, block) => sum + block.minutes, 0),
  }));
}

export async function GET(request: Request) {
  const userId = await resolveRequestUserId(request);

  const [goalRow, scheduleRow] = await Promise.all([
    prisma.learningGoal.findUnique({
      where: { userId },
      select: {
        goal: true,
        dailyMinutes: true,
        scheduleMode: true,
        studyWindow: true,
        updatedAt: true,
      },
    }),
    prisma.scheduleProfile.findUnique({
      where: { userId },
      select: {
        classes: true,
        deadlines: true,
        planWeekStart: true,
        planOverrides: true,
        updatedAt: true,
      },
    }),
  ]);

  if (!goalRow && !scheduleRow) {
    return NextResponse.json({ preferences: null });
  }

  return NextResponse.json({
    preferences: {
      version: 1,
      goal: goalRow?.goal ?? "coursework",
      dailyMinutes: goalRow?.dailyMinutes ?? 35,
      mode: goalRow?.scheduleMode ?? "standard",
      studyWindow: goalRow?.studyWindow ?? "evening",
      classes: toJsonArrayOrEmpty(scheduleRow?.classes),
      deadlines: toJsonArrayOrEmpty(scheduleRow?.deadlines),
      planWeekStartISO: scheduleRow?.planWeekStart
        ? scheduleRow.planWeekStart.toISOString().slice(0, 10)
        : null,
      planOverrides: toJsonArrayOrEmpty(scheduleRow?.planOverrides),
      updatedAt:
        scheduleRow?.updatedAt?.toISOString() ??
        goalRow?.updatedAt?.toISOString() ??
        new Date().toISOString(),
    },
  });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const payload = preferencesSchema.parse(body.preferences ?? body);
    const userId = await resolveRequestUserId(request);

    await prisma.learningGoal.upsert({
      where: { userId },
      update: {
        goal: payload.goal,
        dailyMinutes: payload.dailyMinutes,
        scheduleMode: payload.mode,
        studyWindow: payload.studyWindow,
      },
      create: {
        userId,
        goal: payload.goal,
        dailyMinutes: payload.dailyMinutes,
        scheduleMode: payload.mode,
        studyWindow: payload.studyWindow,
      },
    });

    await prisma.scheduleProfile.upsert({
      where: { userId },
      update: {
        classes: payload.classes as Prisma.InputJsonValue,
        deadlines: payload.deadlines as Prisma.InputJsonValue,
        planWeekStart: payload.planWeekStartISO ? toDateOnly(payload.planWeekStartISO) : null,
        planOverrides: payload.planOverrides as Prisma.InputJsonValue,
      },
      create: {
        userId,
        classes: payload.classes as Prisma.InputJsonValue,
        deadlines: payload.deadlines as Prisma.InputJsonValue,
        planWeekStart: payload.planWeekStartISO ? toDateOnly(payload.planWeekStartISO) : null,
        planOverrides: payload.planOverrides as Prisma.InputJsonValue,
      },
    });

    const targetWeekStart = payload.planWeekStartISO ?? getCurrentWeekStartISO();
    const targetWeekEnd = addDays(targetWeekStart, 6);

    await prisma.dailyPlan.deleteMany({
      where: {
        userId,
        date: {
          gte: toDateOnly(targetWeekStart),
          lte: toDateOnly(targetWeekEnd),
        },
      },
    });

    if (payload.planOverrides.length > 0) {
      await prisma.dailyPlan.createMany({
        data: mapPlanRows(userId, targetWeekStart, payload.planOverrides),
      });
    }

    return NextResponse.json({ saved: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to save schedule preferences", 500);
  }
}
