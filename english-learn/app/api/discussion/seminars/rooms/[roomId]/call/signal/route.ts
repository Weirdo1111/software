import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { mapSeminarCallError, sendSeminarRoomCallSignal } from "@/lib/seminar-room-call-service";
import { seminarCallSignalSchema } from "@/lib/seminar-room";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const payload = seminarCallSignalSchema.parse(await request.json());
    await sendSeminarRoomCallSignal(roomId, payload);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const mapped = mapSeminarCallError(error);

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    console.error("seminar call signal failed", error);
    return jsonError("Failed to send the seminar call signal", 500);
  }
}
