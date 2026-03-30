import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentDiscussionUser, requireCurrentDiscussionUser } from "@/lib/current-user";
import { jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { toSeminarRoomSummary } from "@/lib/seminar-room-mappers";
import { seminarRoomCreateSchema } from "@/lib/seminar-room";
import { hashPassword } from "@/lib/local-auth";

export async function GET() {
  try {
    const currentUser = await getCurrentDiscussionUser();

    const rooms = await prisma.seminarRoom.findMany({
      orderBy: [{ status: "asc" }, { lastActiveAt: "desc" }],
      include: {
        owner: true,
        _count: {
          select: {
            members: true,
          },
        },
        members: {
          where: {
            userId: currentUser?.id ?? BigInt(-1),
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

    return NextResponse.json(
      rooms.map((room) => {
        const summary = toSeminarRoomSummary(room, currentUser?.id);

        if (room.visibility === "PROTECTED" && !summary.canManage && room.members.length === 0) {
          return {
            ...summary,
            lastMessagePreview: undefined,
          };
        }

        return summary;
      }),
    );
  } catch (error) {
    console.error("seminar rooms GET failed", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const currentUser = await requireCurrentDiscussionUser();
    const body = await request.json();
    const payload = seminarRoomCreateSchema.parse(body);

    const passwordHash =
      payload.visibility === "PROTECTED" && payload.password
        ? await hashPassword(payload.password)
        : null;

    const created = await prisma.seminarRoom.create({
      data: {
        title: payload.title.trim(),
        description: payload.description ?? null,
        topicTag: payload.topicTag ?? null,
        visibility: payload.visibility,
        passwordHash,
        status: "ACTIVE",
        ownerId: currentUser.id,
        lastActiveAt: new Date(),
        members: {
          create: {
            userId: currentUser.id,
            role: "OWNER",
          },
        },
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

    return NextResponse.json(toSeminarRoomSummary(created, currentUser.id));
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return jsonError("Please sign in first", 401);
    }

    if (error instanceof z.ZodError) {
      return jsonError(error.issues[0]?.message ?? "Invalid room payload", 422);
    }

    console.error("seminar rooms POST failed", error);
    return jsonError("Failed to create seminar room", 500);
  }
}
