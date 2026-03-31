import type {
  SeminarCallSignalKind,
  SeminarRoomCallParticipant,
  SeminarRoomCallSignal,
  SeminarRoomCallState,
} from "@/components/discussion/seminar-types";
import { requireCurrentDiscussionUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import {
  SEMINAR_CALL_SIGNAL_RETENTION_MS,
  SEMINAR_CALL_STALE_AFTER_MS,
} from "@/lib/seminar-room";
import {
  SeminarLocalStoreError,
  createLocalSeminarCallSignal,
  getCurrentSeminarLocalActor,
  joinLocalSeminarCall,
  leaveLocalSeminarCall,
  shouldUseSeminarLocalStore,
  syncLocalSeminarCallPresence,
} from "@/lib/seminar-room-local-store";

type DbRoomAccessRecord = {
  id: bigint;
  ownerId: bigint;
  visibility: string;
  status: string;
  members: Array<{ role: string }>;
};

type JoinCallInput = {
  sessionId: string;
  displayName?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
};

type SyncCallInput = {
  sessionId: string;
  afterSignalId?: string;
  audioEnabled: boolean;
  videoEnabled: boolean;
};

type SendSignalInput = {
  sessionId: string;
  toSessionId: string;
  kind: SeminarCallSignalKind;
  payload: unknown;
};

export class SeminarCallServiceError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function serializeId(id: bigint | number | string) {
  return id.toString();
}

function serializeDate(value: Date | string) {
  return new Date(value).toISOString();
}

function toCallParticipant(
  participant: {
    sessionId: string;
    displayName: string;
    audioEnabled: boolean;
    videoEnabled: boolean;
    joinedAt: Date | string;
  },
  selfSessionId: string,
): SeminarRoomCallParticipant {
  return {
    sessionId: participant.sessionId,
    displayName: participant.displayName,
    audioEnabled: participant.audioEnabled,
    videoEnabled: participant.videoEnabled,
    joinedAt: serializeDate(participant.joinedAt),
    isSelf: participant.sessionId === selfSessionId,
  };
}

function toCallSignal(signal: {
  id: bigint | number | string;
  kind: string;
  payload: unknown;
  createdAt: Date | string;
  fromParticipant: {
    sessionId: string;
  };
}): SeminarRoomCallSignal {
  return {
    id: serializeId(signal.id),
    kind: signal.kind === "answer" ? "answer" : signal.kind === "ice-candidate" ? "ice-candidate" : "offer",
    fromSessionId: signal.fromParticipant.sessionId,
    payload: signal.payload,
    createdAt: serializeDate(signal.createdAt),
  };
}

function hasDbRoomAccess(room: DbRoomAccessRecord | null, currentUserId: bigint) {
  if (!room) return false;
  return room.visibility === "PUBLIC" || room.ownerId === currentUserId || room.members.length > 0;
}

async function loadDbCallRoom(roomId: bigint, currentUserId: bigint) {
  const room = await prisma.seminarRoom.findUnique({
    where: {
      id: roomId,
    },
    select: {
      id: true,
      ownerId: true,
      visibility: true,
      status: true,
      members: {
        where: {
          userId: currentUserId,
        },
        select: {
          role: true,
        },
      },
    },
  });

  if (!room) {
    throw new SeminarCallServiceError("Seminar room not found", 404);
  }

  if (!hasDbRoomAccess(room, currentUserId)) {
    throw new SeminarCallServiceError("You do not have access to this room", 403);
  }

  return room;
}

async function cleanupDbCallState(roomId: bigint) {
  const staleThreshold = new Date(Date.now() - SEMINAR_CALL_STALE_AFTER_MS);
  const signalThreshold = new Date(Date.now() - SEMINAR_CALL_SIGNAL_RETENTION_MS);

  const staleParticipants = await prisma.seminarRoomCallParticipant.findMany({
    where: {
      roomId,
      lastSeenAt: {
        lt: staleThreshold,
      },
    },
    select: {
      id: true,
    },
  });

  if (staleParticipants.length > 0) {
    const staleIds = staleParticipants.map((participant) => participant.id);
    await prisma.seminarRoomCallSignal.deleteMany({
      where: {
        roomId,
        OR: [
          {
            fromParticipantId: {
              in: staleIds,
            },
          },
          {
            toParticipantId: {
              in: staleIds,
            },
          },
        ],
      },
    });

    await prisma.seminarRoomCallParticipant.deleteMany({
      where: {
        id: {
          in: staleIds,
        },
      },
    });
  }

  await prisma.seminarRoomCallSignal.deleteMany({
    where: {
      roomId,
      createdAt: {
        lt: signalThreshold,
      },
    },
  });
}

async function loadDbCallState(
  roomId: bigint,
  selfParticipantId: bigint,
  sessionId: string,
  afterSignalId?: string,
) {
  const participants = await prisma.seminarRoomCallParticipant.findMany({
    where: {
      roomId,
    },
    orderBy: [{ joinedAt: "asc" }, { id: "asc" }],
    select: {
      sessionId: true,
      displayName: true,
      audioEnabled: true,
      videoEnabled: true,
      joinedAt: true,
    },
  });

  const signals = await prisma.seminarRoomCallSignal.findMany({
    where: {
      roomId,
      toParticipantId: selfParticipantId,
      ...(afterSignalId
        ? {
            id: {
              gt: BigInt(afterSignalId),
            },
          }
        : {}),
    },
    orderBy: {
      id: "asc",
    },
    select: {
      id: true,
      kind: true,
      payload: true,
      createdAt: true,
      fromParticipant: {
        select: {
          sessionId: true,
        },
      },
    },
  });

  return {
    sessionId,
    participants: participants.map((participant) => toCallParticipant(participant, sessionId)),
    signals: signals.map(toCallSignal),
    refreshedAt: new Date().toISOString(),
  } satisfies SeminarRoomCallState;
}

export async function joinSeminarRoomCall(inputRoomId: string, payload: JoinCallInput) {
  if (shouldUseSeminarLocalStore()) {
    const actor = await getCurrentSeminarLocalActor(true);
    return joinLocalSeminarCall(inputRoomId, actor, payload);
  }

  const currentUser = await requireCurrentDiscussionUser();
  const roomId = BigInt(inputRoomId);
  const room = await loadDbCallRoom(roomId, currentUser.id);

  if (room.status !== "ACTIVE") {
    throw new SeminarCallServiceError("This room is closed for live calls", 409);
  }

  await cleanupDbCallState(roomId);

  const participant = await prisma.seminarRoomCallParticipant.upsert({
    where: {
      roomId_sessionId: {
        roomId,
        sessionId: payload.sessionId,
      },
    },
    create: {
      roomId,
      userId: currentUser.id,
      sessionId: payload.sessionId,
      displayName: payload.displayName?.trim() || currentUser.displayName,
      audioEnabled: payload.audioEnabled,
      videoEnabled: payload.videoEnabled,
    },
    update: {
      userId: currentUser.id,
      displayName: payload.displayName?.trim() || currentUser.displayName,
      audioEnabled: payload.audioEnabled,
      videoEnabled: payload.videoEnabled,
      lastSeenAt: new Date(),
    },
    select: {
      id: true,
    },
  });

  return loadDbCallState(roomId, participant.id, payload.sessionId);
}

export async function syncSeminarRoomCall(inputRoomId: string, payload: SyncCallInput) {
  if (shouldUseSeminarLocalStore()) {
    const actor = await getCurrentSeminarLocalActor(true);
    return syncLocalSeminarCallPresence(inputRoomId, actor, payload);
  }

  const currentUser = await requireCurrentDiscussionUser();
  const roomId = BigInt(inputRoomId);
  const room = await loadDbCallRoom(roomId, currentUser.id);

  if (room.status !== "ACTIVE") {
    throw new SeminarCallServiceError("This room is closed for live calls", 409);
  }

  await cleanupDbCallState(roomId);

  const participant = await prisma.seminarRoomCallParticipant.findUnique({
    where: {
      roomId_sessionId: {
        roomId,
        sessionId: payload.sessionId,
      },
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!participant || participant.userId !== currentUser.id) {
    throw new SeminarCallServiceError("Live call session not found", 404);
  }

  await prisma.seminarRoomCallParticipant.update({
    where: {
      id: participant.id,
    },
    data: {
      audioEnabled: payload.audioEnabled,
      videoEnabled: payload.videoEnabled,
      lastSeenAt: new Date(),
    },
  });

  return loadDbCallState(roomId, participant.id, payload.sessionId, payload.afterSignalId);
}

export async function sendSeminarRoomCallSignal(inputRoomId: string, payload: SendSignalInput) {
  if (shouldUseSeminarLocalStore()) {
    const actor = await getCurrentSeminarLocalActor(true);
    await createLocalSeminarCallSignal(inputRoomId, actor, payload);
    return;
  }

  const currentUser = await requireCurrentDiscussionUser();
  const roomId = BigInt(inputRoomId);
  const room = await loadDbCallRoom(roomId, currentUser.id);

  if (room.status !== "ACTIVE") {
    throw new SeminarCallServiceError("This room is closed for live calls", 409);
  }

  await cleanupDbCallState(roomId);

  const [sender, receiver] = await Promise.all([
    prisma.seminarRoomCallParticipant.findUnique({
      where: {
        roomId_sessionId: {
          roomId,
          sessionId: payload.sessionId,
        },
      },
      select: {
        id: true,
        userId: true,
      },
    }),
    prisma.seminarRoomCallParticipant.findUnique({
      where: {
        roomId_sessionId: {
          roomId,
          sessionId: payload.toSessionId,
        },
      },
      select: {
        id: true,
      },
    }),
  ]);

  if (!sender || sender.userId !== currentUser.id) {
    throw new SeminarCallServiceError("Live call session not found", 404);
  }

  if (!receiver) {
    throw new SeminarCallServiceError("Target participant is no longer connected", 404);
  }

  await prisma.seminarRoomCallParticipant.update({
    where: {
      id: sender.id,
    },
    data: {
      lastSeenAt: new Date(),
    },
  });

  await prisma.seminarRoomCallSignal.create({
    data: {
      roomId,
      fromParticipantId: sender.id,
      toParticipantId: receiver.id,
      kind: payload.kind,
      payload: payload.payload as never,
    },
  });
}

export async function leaveSeminarRoomCall(inputRoomId: string, sessionId: string) {
  if (shouldUseSeminarLocalStore()) {
    const actor = await getCurrentSeminarLocalActor(true);
    await leaveLocalSeminarCall(inputRoomId, actor, sessionId);
    return;
  }

  const currentUser = await requireCurrentDiscussionUser();
  const roomId = BigInt(inputRoomId);
  await loadDbCallRoom(roomId, currentUser.id);

  const participant = await prisma.seminarRoomCallParticipant.findUnique({
    where: {
      roomId_sessionId: {
        roomId,
        sessionId,
      },
    },
    select: {
      id: true,
      userId: true,
    },
  });

  if (!participant || participant.userId !== currentUser.id) {
    return;
  }

  await prisma.seminarRoomCallSignal.deleteMany({
    where: {
      roomId,
      OR: [
        {
          fromParticipantId: participant.id,
        },
        {
          toParticipantId: participant.id,
        },
      ],
    },
  });

  await prisma.seminarRoomCallParticipant.delete({
    where: {
      id: participant.id,
    },
  });
}

export function mapSeminarCallError(error: unknown) {
  if (error instanceof SeminarCallServiceError || error instanceof SeminarLocalStoreError) {
    return {
      status: error.status,
      message: error.message,
    };
  }

  if (error instanceof Error && error.message === "UNAUTHORIZED_DISCUSSION_USER") {
    return {
      status: 401,
      message: "Please sign in first",
    };
  }

  return null;
}
