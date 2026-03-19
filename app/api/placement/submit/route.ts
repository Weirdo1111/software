import { NextResponse } from "next/server";
import { z } from "zod";

import { evaluatePlacement } from "@/lib/placement";
import { jsonError } from "@/lib/api";

const submitSchema = z.object({
  test_session_id: z.string().min(1),
  answers: z.array(z.number().int()).min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = submitSchema.parse(body);
    const result = evaluatePlacement(payload.answers);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid payload", 422);
    }

    return jsonError("Failed to submit placement", 500);
  }
}
