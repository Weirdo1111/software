import { NextResponse } from "next/server";

import { getCurrentDiscussionUser } from "@/lib/current-user";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { readSeminarAttachment } from "@/lib/seminar-room-storage";

export async function GET(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ roomId: string; attachmentId: string }>;
  },
) {
  try {
    const { roomId, attachmentId } = await params;
    const roomIdValue = BigInt(roomId);
    const attachmentIdValue = BigInt(attachmentId);
    const currentUser = await getCurrentDiscussionUser();

    const attachment = await prisma.seminarRoomAttachment.findUnique({
      where: {
        id: attachmentIdValue,
      },
      include: {
        room: {
          select: {
            id: true,
            visibility: true,
            ownerId: true,
          },
        },
      },
    });

    if (!attachment || attachment.roomId !== roomIdValue) {
      return jsonError("Attachment not found", 404);
    }

    if (attachment.room.visibility === "PROTECTED") {
      if (!currentUser) {
        return jsonError("Please sign in first", 401);
      }

      if (attachment.room.ownerId !== currentUser.id) {
        const member = await prisma.seminarRoomMember.findUnique({
          where: {
            roomId_userId: {
              roomId: roomIdValue,
              userId: currentUser.id,
            },
          },
          select: {
            id: true,
          },
        });

        if (!member) {
          return jsonError("You do not have access to this attachment", 403);
        }
      }
    }

    const bytes = await readSeminarAttachment(attachment);

    return new NextResponse(bytes, {
      headers: {
        "Content-Type": attachment.mimeType,
        "Content-Length": String(bytes.byteLength),
        "Content-Disposition": `inline; filename="${attachment.fileName.replace(/"/g, "")}"`,
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch (error) {
    console.error("seminar attachment GET failed", error);
    return jsonError("Failed to load seminar attachment", 500);
  }
}
