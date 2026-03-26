import { NextResponse } from "next/server";
import { requireCurrentDiscussionUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const currentUser = await requireCurrentDiscussionUser();

    await prisma.discussionNotification.updateMany({
      where: {
        userId: currentUser.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
      return NextResponse.json({ ok: true });
    }

    console.error("discussion activity read POST failed", error);
    return NextResponse.json({ error: "Failed to mark notifications read" }, { status: 500 });
  }
}
