import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import type { SpeakingEvaluationHistoryEntry, SpeakingEvaluationStoredInput } from "@/lib/speaking-evaluation-history";
import { formatHistoryDateLabels } from "@/lib/speaking-evaluation-history";
import { normalizeSpeakingTestFeedback, getSpeakingEvaluationTier, type SpeakingTestFeedback } from "@/lib/speaking-test";

type FeedbackRecordRow = {
  id: string;
  createdAt: Date;
  inputPayload: string | SpeakingEvaluationStoredInput;
  outputPayload: string | SpeakingTestFeedback;
  userAttemptId: string | null;
};

export async function GET() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) {
    return NextResponse.json({ records: [] satisfies SpeakingEvaluationHistoryEntry[] });
  }

  const rows = await prisma.$queryRawUnsafe<FeedbackRecordRow[]>(
    `
      SELECT afr.id, afr.createdAt, afr.inputPayload, afr.outputPayload, ua.id AS userAttemptId
      FROM ai_feedback_records afr
      LEFT JOIN user_attempts ua ON ua.id = afr.userAttemptId
      WHERE afr.userId = ? AND afr.feedbackType = ?
      ORDER BY afr.createdAt DESC
      LIMIT 24
    `,
    user.id.toString(),
    "speaking-test-report",
  );

  const records: SpeakingEvaluationHistoryEntry[] = rows.map((row) => {
    const inputPayload = parseJsonField<SpeakingEvaluationStoredInput>(row.inputPayload);
    const report = normalizeSpeakingTestFeedback(parseJsonField<SpeakingTestFeedback>(row.outputPayload));
    const { monthLabel, dayLabel, yearLabel } = formatHistoryDateLabels(row.createdAt);

    return {
      id: row.id,
      attemptedAt: row.createdAt.toISOString(),
      monthLabel,
      dayLabel,
      yearLabel,
      title: inputPayload.set_title || "Speaking Test Report",
      subtitle: `Speaking record #${(row.userAttemptId || row.id).slice(0, 4).toUpperCase()}`,
      score: report.overall_score,
      tier: getSpeakingEvaluationTier(report.overall_score),
      report,
    };
  });

  return NextResponse.json({ records });
}

function parseJsonField<T>(value: string | T) {
  if (typeof value !== "string") {
    return value;
  }

  return JSON.parse(value) as T;
}

