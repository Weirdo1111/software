import { NextResponse } from "next/server";

import { jsonError } from "@/lib/api";
import { mapSeminarCallError, syncSeminarRoomCall } from "@/lib/seminar-room-call-service";
import { seminarCallPresenceSchema } from "@/lib/seminar-room";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;
    const payload = seminarCallPresenceSchema.parse(await request.json());
    return NextResponse.json(await syncSeminarRoomCall(roomId, payload));
  } catch (error) {
    const mapped = mapSeminarCallError(error);

    if (mapped) {
      return jsonError(mapped.message, mapped.status);
    }

    console.error("seminar call presence failed", error);
    return jsonError("Failed to refresh the seminar call", 500);
  }
}
