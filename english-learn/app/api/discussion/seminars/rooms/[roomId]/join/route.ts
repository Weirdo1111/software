import { NextResponse } from "next/server";
import { z } from "zod";

import { requireCurrentDiscussionUser } from "@/lib/current-user";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { seminarJoinSchema } from "@/lib/seminar-room";
import { verifyPassword } from "@/lib/local-auth";
import {
  SeminarLocalStoreError,
  getCurrentSeminarLocalActor,
  joinLocalProtectedSeminarRoom,
  shouldUseSeminarLocalStore,
} from "@/lib/seminar-room-local-store";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;

    if (await shouldUseSeminarLocalStore()) {
      const currentUser = await getCurrentSeminarLocalActor(true);
      const payload = seminarJoinSchema.parse(await request.json());
      await joinLocalProtectedSeminarRoom(roomId, currentUser, payload.password);
      return NextResponse.json({ ok: true });
    }

    const currentUser = await requireCurrentDiscussionUser();
    const roomIdValue = BigInt(roomId);

    const room = await prisma.seminarRoom.findUnique({
      where: {
        id: roomIdValue,
      },
      select: {
        id: true,
        visibility: true,
        passwordHash: true,
      },
    });

    if (!room) {
      return jsonError("Seminar room not found", 404);
    }

    if (room.visibility !== "PROTECTED") {
      await prisma.seminarRoomMember.upsert({
        where: {
          roomId_userId: {
            roomId: roomIdValue,
            userId: currentUser.id,
          },
        },
        update: {
          lastSeenAt: new Date(),
        },
        create: {
          roomId: roomIdValue,
          userId: currentUser.id,
          role: "MEMBER",
        },
      });

      return NextResponse.json({ ok: true });
    }

    const payload = seminarJoinSchema.parse(await request.json());

    if (!room.passwordHash) {
      return jsonError("This protected room is missing a password", 500);
    }

    const valid = await verifyPassword(payload.password, room.passwordHash);

    if (!valid) {
      return jsonError("Incorrect room password", 403);
    }

    await prisma.seminarRoomMember.upsert({
      where: {
        roomId_userId: {
          roomId: roomIdValue,
          userId: currentUser.id,
        },
      },
      update: {
        lastSeenAt: new Date(),
      },
      create: {
        roomId: roomIdValue,
        userId: currentUser.id,
        role: "MEMBER",
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof SeminarLocalStoreError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return jsonError("Please sign in first", 401);
    }

    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid join payload", 422);
    }

    console.error("seminar room join POST failed", error);
    return jsonError("Failed to join seminar room", 500);
  }
}
