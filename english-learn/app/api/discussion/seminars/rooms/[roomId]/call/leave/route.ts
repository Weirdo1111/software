import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { leaveSeminarRoomCall, mapSeminarCallError } from "@/lib/seminar-room-call-service";
import { seminarCallLeaveSchema } from "@/lib/seminar-room";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const payload = seminarCallLeaveSchema.parse(await request.json());
    await leaveSeminarRoomCall(roomId, payload.sessionId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const mapped = mapSeminarCallError(error);

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    console.error("seminar call leave failed", error);
    return jsonError("Failed to leave the seminar call", 500);
  }
}
