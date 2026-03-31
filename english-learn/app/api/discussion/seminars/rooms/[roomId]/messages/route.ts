import { NextRequest, NextResponse } from "next/server";

import { getCurrentDiscussionUser, requireCurrentDiscussionUser } from "@/lib/current-user";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import {
  MAX_SEMINAR_ATTACHMENTS_PER_MESSAGE,
  getSeminarAttachmentRule,
  normalizeSeminarTextContent,
  sanitizeSeminarFileName,
} from "@/lib/seminar-room";
import { deleteSeminarAttachment, saveSeminarAttachment } from "@/lib/seminar-room-storage";
import { toSeminarRoomMessage } from "@/lib/seminar-room-mappers";
import {
  SeminarLocalStoreError,
  createLocalSeminarMessage,
  getCurrentSeminarLocalActor,
  listLocalSeminarMessages,
  shouldUseSeminarLocalStore,
} from "@/lib/seminar-room-local-store";

async function loadRoom(roomId: bigint, currentUserId?: bigint | null) {
  return prisma.seminarRoom.findUnique({
    where: {
      id: roomId,
    },
    include: {
      members: {
        where: {
          userId: currentUserId ?? BigInt(-1),
        },
        select: {
          userId: true,
          role: true,
        },
      },
    },
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;

    if (shouldUseSeminarLocalStore()) {
      const currentUser = await getCurrentSeminarLocalActor(false);
      const afterRaw = request.nextUrl.searchParams.get("after");
      const messages = await listLocalSeminarMessages(roomId, currentUser?.id, afterRaw);
      return NextResponse.json({ messages });
    }

    const roomIdValue = BigInt(roomId);
    const currentUser = await getCurrentDiscussionUser();
    const room = await loadRoom(roomIdValue, currentUser?.id);

    if (!room) {
      return jsonError("Seminar room not found", 404);
    }

    const hasAccess =
      room.visibility === "PUBLIC" ||
      room.ownerId === currentUser?.id ||
      Boolean(room.members[0]);

    if (!hasAccess) {
      return jsonError("You do not have access to this room", 403);
    }

    const afterRaw = request.nextUrl.searchParams.get("after");
    const where =
      afterRaw && afterRaw.trim()
        ? {
            roomId: roomIdValue,
            id: {
              gt: BigInt(afterRaw),
            },
          }
        : {
            roomId: roomIdValue,
          };

    const messages = await prisma.seminarRoomMessage.findMany({
      where,
      orderBy: afterRaw ? { id: "asc" } : { id: "desc" },
      take: 80,
      include: {
        sender: {
          select: {
            displayName: true,
          },
        },
        attachments: true,
      },
    });

    const normalized = afterRaw ? messages : messages.reverse();

    return NextResponse.json({
      messages: normalized.map((message) => toSeminarRoomMessage(roomIdValue, message, currentUser?.id)),
    });
  } catch (error) {
    console.error("seminar room messages GET failed", error);
    return jsonError("Failed to load seminar messages", 500);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  const storedAttachments: Array<{
    fileName: string;
    fileKind: "image" | "video" | "audio" | "file";
    mimeType: string;
    fileSize: number;
    storageDriver: "local" | "supabase";
    storagePath: string;
  }> = [];

  try {
    const { roomId } = await params;

    if (shouldUseSeminarLocalStore()) {
      const currentUser = await getCurrentSeminarLocalActor(true);
      const formData = await request.formData();
      const content = normalizeSeminarTextContent(formData.get("content"));
      const files = formData
        .getAll("files")
        .filter((value): value is File => typeof File !== "undefined" && value instanceof File);

      if (!content && files.length === 0) {
        return jsonError("Add text or at least one attachment", 422);
      }

      if (files.length > MAX_SEMINAR_ATTACHMENTS_PER_MESSAGE) {
        return jsonError(`You can send up to ${MAX_SEMINAR_ATTACHMENTS_PER_MESSAGE} attachments`, 422);
      }

      for (const file of files) {
        const rule = getSeminarAttachmentRule(file.type);

        if (!rule) {
          return jsonError(`Unsupported attachment type: ${file.type || file.name}`, 422);
        }

        if (file.size <= 0) {
          return jsonError(`Attachment ${file.name} is empty`, 422);
        }

        if (file.size > rule.maxBytes) {
          return jsonError(`${file.name} exceeds the allowed size limit`, 422);
        }

        const fileName = sanitizeSeminarFileName(file.name);
        const bytes = new Uint8Array(await file.arrayBuffer());
        const stored = await saveSeminarAttachment({
          roomId,
          fileName,
          mimeType: file.type,
          bytes,
        });

        storedAttachments.push({
          fileName,
          fileKind: rule.kind,
          mimeType: file.type,
          fileSize: file.size,
          storageDriver: stored.storageDriver,
          storagePath: stored.storagePath,
        });
      }

      return NextResponse.json(
        await createLocalSeminarMessage(roomId, currentUser, content, storedAttachments),
      );
    }

    const currentUser = await requireCurrentDiscussionUser();
    const roomIdValue = BigInt(roomId);
    const room = await loadRoom(roomIdValue, currentUser.id);

    if (!room) {
      return jsonError("Seminar room not found", 404);
    }

    const hasAccess =
      room.visibility === "PUBLIC" ||
      room.ownerId === currentUser.id ||
      Boolean(room.members[0]);

    if (!hasAccess) {
      return jsonError("You do not have access to this room", 403);
    }

    if (room.status !== "ACTIVE") {
      return jsonError("This room is closed for new messages", 409);
    }

    const formData = await request.formData();
    const content = normalizeSeminarTextContent(formData.get("content"));
    const files = formData
      .getAll("files")
      .filter((value): value is File => typeof File !== "undefined" && value instanceof File);

    if (!content && files.length === 0) {
      return jsonError("Add text or at least one attachment", 422);
    }

    if (files.length > MAX_SEMINAR_ATTACHMENTS_PER_MESSAGE) {
      return jsonError(`You can send up to ${MAX_SEMINAR_ATTACHMENTS_PER_MESSAGE} attachments`, 422);
    }

    for (const file of files) {
      const rule = getSeminarAttachmentRule(file.type);

      if (!rule) {
        return jsonError(`Unsupported attachment type: ${file.type || file.name}`, 422);
      }

      if (file.size <= 0) {
        return jsonError(`Attachment ${file.name} is empty`, 422);
      }

      if (file.size > rule.maxBytes) {
        return jsonError(`${file.name} exceeds the allowed size limit`, 422);
      }

      const fileName = sanitizeSeminarFileName(file.name);
      const bytes = new Uint8Array(await file.arrayBuffer());
      const stored = await saveSeminarAttachment({
        roomId,
        fileName,
        mimeType: file.type,
        bytes,
      });

      storedAttachments.push({
        fileName,
        fileKind: rule.kind,
        mimeType: file.type,
        fileSize: file.size,
        storageDriver: stored.storageDriver,
        storagePath: stored.storagePath,
      });
    }

    const created = await prisma.$transaction(async (tx) => {
      await tx.seminarRoomMember.upsert({
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
          role: room.ownerId === currentUser.id ? "OWNER" : "MEMBER",
        },
      });

      const message = await tx.seminarRoomMessage.create({
        data: {
          roomId: roomIdValue,
          senderId: currentUser.id,
          content: content || null,
        },
      });

      if (storedAttachments.length > 0) {
        await tx.seminarRoomAttachment.createMany({
          data: storedAttachments.map((attachment) => ({
            messageId: message.id,
            roomId: roomIdValue,
            uploadedById: currentUser.id,
            fileName: attachment.fileName,
            fileKind: attachment.fileKind,
            mimeType: attachment.mimeType,
            fileSize: attachment.fileSize,
            storageDriver: attachment.storageDriver,
            storagePath: attachment.storagePath,
          })),
        });
      }

      await tx.seminarRoom.update({
        where: {
          id: roomIdValue,
        },
        data: {
          lastActiveAt: new Date(),
        },
      });

      return tx.seminarRoomMessage.findUniqueOrThrow({
        where: {
          id: message.id,
        },
        include: {
          sender: {
            select: {
              displayName: true,
            },
          },
          attachments: true,
        },
      });
    });

    return NextResponse.json(toSeminarRoomMessage(roomIdValue, created, currentUser.id));
  } catch (error) {
    if (error instanceof SeminarLocalStoreError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return jsonError("Please sign in first", 401);
    }

    for (const attachment of storedAttachments) {
      try {
        await deleteSeminarAttachment(attachment);
      } catch (cleanupError) {
        console.warn("failed to clean up seminar attachment", cleanupError);
      }
    }

    console.error("seminar room messages POST failed", error);
    return jsonError("Failed to send seminar message", 500);
  }
}
