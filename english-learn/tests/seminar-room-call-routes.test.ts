import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const requireCurrentDiscussionUser = vi.fn();

  const prisma = {
    seminarRoom: {
      findUnique: vi.fn(),
    },
    seminarRoomCallParticipant: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    seminarRoomCallSignal: {
      findMany: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  };

  return {
    requireCurrentDiscussionUser,
    prisma,
  };
});

vi.mock("@/lib/current-user", () => ({
  requireCurrentDiscussionUser: mocks.requireCurrentDiscussionUser,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mocks.prisma,
}));

import { POST as joinCall } from "@/app/api/discussion/seminars/rooms/[roomId]/call/join/route";
import { POST as syncCallPresence } from "@/app/api/discussion/seminars/rooms/[roomId]/call/presence/route";
import { POST as sendCallSignal } from "@/app/api/discussion/seminars/rooms/[roomId]/call/signal/route";
import { POST as leaveCall } from "@/app/api/discussion/seminars/rooms/[roomId]/call/leave/route";

const { prisma, requireCurrentDiscussionUser } = mocks;

const b = (value: number) => BigInt(value);

function buildRoomAccessRecord(
  overrides: Partial<{
    ownerId: bigint;
    visibility: "PUBLIC" | "PROTECTED";
    status: "ACTIVE" | "ARCHIVED" | "CLOSED";
    members: Array<{ role: string }>;
  }> = {},
) {
  return {
    id: b(11),
    ownerId: b(1),
    visibility: "PUBLIC" as const,
    status: "ACTIVE" as const,
    members: [] as Array<{ role: string }>,
    ...overrides,
  };
}

describe("seminar room call routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    requireCurrentDiscussionUser.mockResolvedValue({
      id: b(1),
      displayName: "You",
    });
    prisma.seminarRoomCallParticipant.deleteMany.mockResolvedValue({ count: 0 });
    prisma.seminarRoomCallSignal.deleteMany.mockResolvedValue({ count: 0 });
    prisma.seminarRoomCallSignal.findMany.mockResolvedValue([]);
  });

  it("joins a seminar call for an authorized participant", async () => {
    prisma.seminarRoom.findUnique.mockResolvedValue(buildRoomAccessRecord());
    prisma.seminarRoomCallParticipant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          sessionId: "session-self",
          displayName: "You",
          audioEnabled: true,
          videoEnabled: true,
          joinedAt: new Date("2026-03-31T09:00:00.000Z"),
        },
      ]);
    prisma.seminarRoomCallParticipant.upsert.mockResolvedValue({ id: b(201) });

    const response = await joinCall(
      new Request("http://localhost/api/discussion/seminars/rooms/11/call/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "session-self",
          audioEnabled: true,
          videoEnabled: true,
        }),
      }),
      { params: Promise.resolve({ roomId: "11" }) },
    );

    expect(response.status).toBe(200);
    expect(prisma.seminarRoomCallParticipant.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          sessionId: "session-self",
          audioEnabled: true,
          videoEnabled: true,
        }),
      }),
    );

    await expect(response.json()).resolves.toMatchObject({
      sessionId: "session-self",
      participants: [expect.objectContaining({ isSelf: true })],
    });
  });

  it("blocks call join when the user does not have room access", async () => {
    prisma.seminarRoom.findUnique.mockResolvedValue(
      buildRoomAccessRecord({
        ownerId: b(5),
        visibility: "PROTECTED",
        members: [],
      }),
    );

    const response = await joinCall(
      new Request("http://localhost/api/discussion/seminars/rooms/11/call/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "session-self",
          audioEnabled: true,
          videoEnabled: true,
        }),
      }),
      { params: Promise.resolve({ roomId: "11" }) },
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      error: "You do not have access to this room",
    });
  });

  it("syncs active participants and targeted signals", async () => {
    prisma.seminarRoom.findUnique.mockResolvedValue(buildRoomAccessRecord());
    prisma.seminarRoomCallParticipant.findMany
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          sessionId: "session-self",
          displayName: "You",
          audioEnabled: true,
          videoEnabled: true,
          joinedAt: new Date("2026-03-31T09:00:00.000Z"),
        },
        {
          sessionId: "session-peer",
          displayName: "Partner",
          audioEnabled: true,
          videoEnabled: false,
          joinedAt: new Date("2026-03-31T09:01:00.000Z"),
        },
      ]);
    prisma.seminarRoomCallParticipant.findUnique.mockResolvedValue({
      id: b(301),
      userId: b(1),
    });
    prisma.seminarRoomCallParticipant.update.mockResolvedValue({ id: b(301) });
    prisma.seminarRoomCallSignal.findMany.mockResolvedValue([
      {
        id: b(77),
        kind: "offer",
        payload: { type: "offer", sdp: "test" },
        createdAt: new Date("2026-03-31T09:02:00.000Z"),
        fromParticipant: {
          sessionId: "session-peer",
        },
      },
    ]);

    const response = await syncCallPresence(
      new Request("http://localhost/api/discussion/seminars/rooms/11/call/presence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "session-self",
          audioEnabled: true,
          videoEnabled: true,
        }),
      }),
      { params: Promise.resolve({ roomId: "11" }) },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      participants: [
        expect.objectContaining({ sessionId: "session-self", isSelf: true }),
        expect.objectContaining({ sessionId: "session-peer", isSelf: false }),
      ],
      signals: [
        expect.objectContaining({
          id: "77",
          fromSessionId: "session-peer",
          kind: "offer",
        }),
      ],
    });
  });

  it("relays WebRTC signals to another participant", async () => {
    prisma.seminarRoom.findUnique.mockResolvedValue(buildRoomAccessRecord());
    prisma.seminarRoomCallParticipant.findMany.mockResolvedValue([]);
    prisma.seminarRoomCallParticipant.findUnique
      .mockResolvedValueOnce({
        id: b(401),
        userId: b(1),
      })
      .mockResolvedValueOnce({
        id: b(402),
      });
    prisma.seminarRoomCallParticipant.update.mockResolvedValue({ id: b(401) });
    prisma.seminarRoomCallSignal.create.mockResolvedValue({ id: b(501) });

    const response = await sendCallSignal(
      new Request("http://localhost/api/discussion/seminars/rooms/11/call/signal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "session-self",
          toSessionId: "session-peer",
          kind: "answer",
          payload: { type: "answer", sdp: "answer-sdp" },
        }),
      }),
      { params: Promise.resolve({ roomId: "11" }) },
    );

    expect(response.status).toBe(200);
    expect(prisma.seminarRoomCallSignal.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "answer",
          payload: { type: "answer", sdp: "answer-sdp" },
        }),
      }),
    );
  });

  it("removes the current call participant on leave", async () => {
    prisma.seminarRoom.findUnique.mockResolvedValue(buildRoomAccessRecord());
    prisma.seminarRoomCallParticipant.findUnique.mockResolvedValue({
      id: b(601),
      userId: b(1),
    });
    prisma.seminarRoomCallParticipant.delete.mockResolvedValue({ id: b(601) });

    const response = await leaveCall(
      new Request("http://localhost/api/discussion/seminars/rooms/11/call/leave", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: "session-self",
        }),
      }),
      { params: Promise.resolve({ roomId: "11" }) },
    );

    expect(response.status).toBe(200);
    expect(prisma.seminarRoomCallSignal.deleteMany).toHaveBeenCalled();
    expect(prisma.seminarRoomCallParticipant.delete).toHaveBeenCalledWith({
      where: {
        id: b(601),
      },
    });
  });
});
