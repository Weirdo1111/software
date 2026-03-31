import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { joinSeminarRoomCall, mapSeminarCallError } from "@/lib/seminar-room-call-service";
import { seminarCallJoinSchema } from "@/lib/seminar-room";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const payload = seminarCallJoinSchema.parse(await request.json());
    return NextResponse.json(await joinSeminarRoomCall(roomId, payload));
  } catch (error) {
    const mapped = mapSeminarCallError(error);

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    console.error("seminar call join failed", error);
    return jsonError("Failed to join the seminar call", 500);
  }
}
