import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentDiscussionUser, requireCurrentDiscussionUser } from "@/lib/current-user";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { toSeminarRoomDetail, toSeminarRoomSummary } from "@/lib/seminar-room-mappers";
import { isSeminarManagerRole, seminarRoomUpdateSchema } from "@/lib/seminar-room";
import { hashPassword } from "@/lib/local-auth";
import { deleteSeminarAttachment } from "@/lib/seminar-room-storage";
import {
  SeminarLocalStoreError,
  deleteLocalSeminarRoom,
  getCurrentSeminarLocalActor,
  getLocalSeminarRoomDetail,
  shouldUseSeminarLocalStore,
  updateLocalSeminarRoom,
} from "@/lib/seminar-room-local-store";

async function loadRoom(roomId: bigint, currentUserId?: bigint | null) {
  return prisma.seminarRoom.findUnique({
    where: {
      id: roomId,
    },
    include: {
      owner: true,
      _count: {
        select: {
          members: true,
        },
      },
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

async function upsertViewerMembership(roomId: bigint, userId: bigint) {
  await prisma.seminarRoomMember.upsert({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
    update: {
      lastSeenAt: new Date(),
    },
    create: {
      roomId,
      userId,
      role: "MEMBER",
    },
  });
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;

    if (shouldUseSeminarLocalStore()) {
      const currentUser = await getCurrentSeminarLocalActor(false);
      const detail = await getLocalSeminarRoomDetail(roomId, currentUser?.id);
      return NextResponse.json(detail, { status: detail.hasAccess ? 200 : 403 });
    }

    const roomIdValue = BigInt(roomId);
    const currentUser = await getCurrentDiscussionUser();

    let room = await loadRoom(roomIdValue, currentUser?.id);

    if (!room) {
      return jsonError("Seminar room not found", 404);
    }

    const currentMembership = room.members[0];
    const hasAccess =
      room.visibility === "PUBLIC" ||
      room.ownerId === currentUser?.id ||
      Boolean(currentMembership);

    if (currentUser && hasAccess) {
      await upsertViewerMembership(roomIdValue, currentUser.id);
      room = await loadRoom(roomIdValue, currentUser.id);
    }

    if (!room) {
      return jsonError("Seminar room not found", 404);
    }

    const messages = hasAccess
      ? await prisma.seminarRoomMessage.findMany({
          where: {
            roomId: roomIdValue,
          },
          orderBy: {
            id: "desc",
          },
          take: 80,
          include: {
            sender: {
              select: {
                displayName: true,
              },
            },
            attachments: true,
          },
        }).then((items) => items.reverse())
      : [];

    const detail = toSeminarRoomDetail(room, messages, {
      currentUserId: currentUser?.id,
      hasAccess,
      canSend: Boolean(currentUser) && hasAccess && room.status === "ACTIVE",
    });

    if (!hasAccess) {
      return NextResponse.json(detail, { status: 403 });
    }

    return NextResponse.json(detail);
  } catch (error) {
    console.error("seminar room detail GET failed", error);
    return jsonError("Failed to load seminar room", 500);
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;

    if (shouldUseSeminarLocalStore()) {
      const currentUser = await getCurrentSeminarLocalActor(true);
      const rawBody = await request.json();
      const payload = seminarRoomUpdateSchema.parse(rawBody);
      return NextResponse.json(
        await updateLocalSeminarRoom(roomId, currentUser, {
          title: payload.title,
          description: Object.prototype.hasOwnProperty.call(rawBody, "description")
            ? (payload.description ?? null)
            : undefined,
          topicTag: Object.prototype.hasOwnProperty.call(rawBody, "topicTag")
            ? (payload.topicTag ?? null)
            : undefined,
          visibility: payload.visibility,
          password: payload.password,
          status: payload.status,
        }),
      );
    }

    const currentUser = await requireCurrentDiscussionUser();
    const roomIdValue = BigInt(roomId);
    const room = await loadRoom(roomIdValue, currentUser.id);

    if (!room) {
      return jsonError("Seminar room not found", 404);
    }

    const membership = room.members[0];

    if (room.ownerId !== currentUser.id && !isSeminarManagerRole(membership?.role)) {
      return jsonError("You do not have permission to manage this room", 403);
    }

    const rawBody = await request.json();
    const payload = seminarRoomUpdateSchema.parse(rawBody);

    const targetVisibility = payload.visibility ?? room.visibility;

    if (targetVisibility === "PROTECTED" && !payload.password && !room.passwordHash) {
      return jsonError("Protected rooms need a password", 422);
    }

    if (targetVisibility === "PUBLIC" && payload.password) {
      return jsonError("Switch to protected before setting a room password", 422);
    }

    const data: {
      title?: string;
      description?: string | null;
      topicTag?: string | null;
      visibility?: string;
      status?: string;
      passwordHash?: string | null;
    } = {};

    if (typeof rawBody.title === "string") {
      data.title = payload.title?.trim() ?? room.title;
    }

    if (Object.prototype.hasOwnProperty.call(rawBody, "description")) {
      data.description = payload.description ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(rawBody, "topicTag")) {
      data.topicTag = payload.topicTag ?? null;
    }

    if (payload.visibility) {
      data.visibility = payload.visibility;
    }

    if (payload.status) {
      data.status = payload.status;
    }

    if (targetVisibility === "PUBLIC") {
      data.passwordHash = null;
    } else if (payload.password) {
      data.passwordHash = await hashPassword(payload.password);
    }

    const updated = await prisma.seminarRoom.update({
      where: {
        id: roomIdValue,
      },
      data,
      include: {
        owner: true,
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: {
            userId: currentUser.id,
          },
          select: {
            userId: true,
            role: true,
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            sender: {
              select: {
                displayName: true,
              },
            },
            attachments: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(toSeminarRoomSummary(updated, currentUser.id));
  } catch (error) {
    if (error instanceof SeminarLocalStoreError) {
      return jsonError(error.message, error.status);
    }

    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return jsonError("Please sign in first", 401);
    }

    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid room payload", 422);
    }

    console.error("seminar room PATCH failed", error);
    return jsonError("Failed to update seminar room", 500);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> },
) {
  try {
    const { roomId } = await params;

    if (shouldUseSeminarLocalStore()) {
      const currentUser = await getCurrentSeminarLocalActor(true);
      const attachments = await deleteLocalSeminarRoom(roomId, currentUser);

      for (const attachment of attachments) {
        try {
          await deleteSeminarAttachment(attachment);
        } catch (error) {
          console.warn("failed to delete seminar attachment", error);
        }
      }

      return NextResponse.json({ ok: true });
    }

    const currentUser = await requireCurrentDiscussionUser();
    const roomIdValue = BigInt(roomId);
    const room = await loadRoom(roomIdValue, currentUser.id);

    if (!room) {
      return jsonError("Seminar room not found", 404);
    }

    const membership = room.members[0];

    if (room.ownerId !== currentUser.id && !isSeminarManagerRole(membership?.role)) {
      return jsonError("You do not have permission to delete this room", 403);
    }

    const attachments = await prisma.seminarRoomAttachment.findMany({
      where: {
        roomId: roomIdValue,
      },
      select: {
        storageDriver: true,
        storagePath: true,
      },
    });

    for (const attachment of attachments) {
      try {
        await deleteSeminarAttachment(attachment);
      } catch (error) {
        console.warn("failed to delete seminar attachment", error);
      }
    }

    await prisma.seminarRoom.delete({
      where: {
        id: roomIdValue,
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

    console.error("seminar room DELETE failed", error);
    return jsonError("Failed to delete seminar room", 500);
  }
}
